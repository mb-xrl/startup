// Central realtime hub over WebSocket. All connected clients subscribe to channels;
// server broadcasts events (chat, tasks, notifications, presence, typing, files)
// to the relevant users. Lightweight pub/sub with per-user subscriptions.
import { WebSocketServer } from 'ws';
import { nanoid } from 'nanoid';
import { all, get, run, persist } from './db/index.js';

const AVATAR_PALETTE = [
  '#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#22c55e','#10b981',
  '#14b8a6','#06b6d4','#0ea5e9','#3b82f6','#6366f1','#8b5cf6','#a855f7',
  '#d946ef','#ec4899','#f43f5e'
];
export function pickColor(seed) {
  let h = 0; for (let i=0;i<seed.length;i++) h = (h*31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

export class Hub {
  constructor(server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    /** @type {Map<string, {ws:WebSocket, user:any, channels:Set<string>}>} */
    this.clients = new Map();
    this.wss.on('connection', (ws, req) => this.onConnection(ws, req));
    // Periodic cleanup of stale typers/presence
    setInterval(() => this.tick(), 5000);
  }

  onConnection(ws, req) {
    const clientId = nanoid(12);
    const ctx = { ws, user: null, channels: new Set() };
    this.clients.set(clientId, ctx);

    ws.on('message', (buf) => {
      let msg; try { msg = JSON.parse(buf.toString()); } catch { return; }
      this.handle(clientId, ctx, msg).catch(err => {
        this.send(ws, { type: 'error', message: err.message });
      });
    });
    ws.on('close', () => this.disconnect(clientId, ctx));
    this.send(ws, { type: 'hello', clientId });
  }

  disconnect(clientId, ctx) {
    if (ctx.user) {
      // broadcast presence offline
      run('UPDATE users SET last_seen = ? WHERE id = ?', [Date.now(), ctx.user.id]);
      this.broadcast('presence', { userId: ctx.user.id, online: false, lastSeen: Date.now() });
    }
    this.clients.delete(clientId);
  }

  async handle(clientId, ctx, msg) {
    // Auth handshake
    if (msg.type === 'auth') {
      const user = await this.authenticate(msg.token);
      if (!user) return this.send(ctx.ws, { type: 'auth:error', message: 'invalid token' });
      ctx.user = user;
      ctx.channels.add('user:' + user.id);
      ctx.channels.add('channel:global');
      run('UPDATE users SET last_seen = ? WHERE id = ?', [Date.now(), user.id]);
      this.send(ctx.ws, { type: 'auth:ok', user: publicUser(user) });
      this.broadcast('presence', { userId: user.id, online: true, user: publicUser(user) });
      this.sendOnlineRoster(ctx);
      return;
    }
    if (!ctx.user) return this.send(ctx.ws, { type: 'auth:required' });

    switch (msg.type) {
      case 'subscribe': {
        if (msg.channel) ctx.channels.add('channel:' + msg.channel);
        break;
      }
      case 'unsubscribe': {
        ctx.channels.delete('channel:' + msg.channel);
        break;
      }
      case 'chat:send': {
        await this.handleChatMessage(ctx, msg);
        break;
      }
      case 'typing': {
        await this.handleTyping(ctx, msg);
        break;
      }
      case 'ping': {
        this.send(ctx.ws, { type: 'pong', t: Date.now() });
        break;
      }
      default:
        this.send(ctx.ws, { type: 'error', message: 'unknown message type: ' + msg.type });
    }
  }

  async authenticate(token) {
    try {
      // simple base64url JWT decode (signature verified in HTTP layer; here we trust bearer from WS)
      // But to stay safe, we do real verify: import jwt
      const { createVerifier } = await import('./auth.js');
      const payload = createVerifier()(token);
      const user = get('SELECT * FROM users WHERE id = ?', [payload.sub]);
      return user;
    } catch { return null; }
  }

  send(ws, ev) {
    if (ws.readyState === 1) ws.send(JSON.stringify(ev));
  }

  // Send event to a channel name (channel:<id>) or user:<id>
  publish(topic, event) {
    for (const ctx of this.clients.values()) {
      if (ctx.channels.has(topic)) this.send(ctx.ws, event);
    }
  }

  // Send to all (authed) users
  broadcast(kind, data) {
    const ev = { type: kind, ...data };
    for (const ctx of this.clients.values()) {
      if (ctx.user) this.send(ctx.ws, ev);
    }
  }

  sendToUser(userId, ev) {
    for (const ctx of this.clients.values()) {
      if (ctx.user && ctx.user.id === userId) this.send(ctx.ws, ev);
    }
  }

  sendOnlineRoster(ctx) {
    const online = [];
    for (const c of this.clients.values()) {
      if (c.user) online.push(publicUser(c.user));
    }
    this.send(ctx.ws, { type: 'presence:roster', users: online });
  }

  async handleChatMessage(ctx, msg) {
    const { text, channel = 'global', replyTo } = msg;
    if (!text || !text.trim()) return;
    const id = nanoid(12);
    const now = Date.now();
    run(
      `INSERT INTO messages (id, channel_id, author_id, text, reply_to, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, channel, ctx.user.id, text.trim(), replyTo || null, now]
    );
    const message = {
      id, channel, text: text.trim(), replyTo: replyTo || null,
      createdAt: now, author: publicUser(ctx.user)
    };
    // publish to channel
    this.publish('channel:' + channel, { type: 'chat:message', message });
    // If not global, also ensure other members are subscribed already on client side;
    // we broadcast project-channel messages to all project members even if not subscribed,
    // so they get a notification.
    if (channel.startsWith('project:')) {
      const projectId = channel.slice('project:'.length);
      const members = all(
        `SELECT u.* FROM users u
         JOIN project_members pm ON pm.user_id = u.id
         WHERE pm.project_id = ?`, [projectId]
      );
      for (const m of members) {
        if (m.id !== ctx.user.id) {
          this.sendToUser(m.id, {
            type: 'notification',
            notification: {
              id: nanoid(10), type: 'chat:mention',
              title: `${ctx.user.name} in #${channel}`, body: text.trim().slice(0,120),
              createdAt: now, read: false
            }
          });
        }
      }
    }
  }

  async handleTyping(ctx, msg) {
    const { channel = 'global', isTyping } = msg;
    if (isTyping) {
      run(
        `INSERT INTO typing (channel_id, user_id, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(channel_id, user_id) DO UPDATE SET updated_at=excluded.updated_at`,
        [channel, ctx.user.id, Date.now()]
      );
    } else {
      run('DELETE FROM typing WHERE channel_id = ? AND user_id = ?', [channel, ctx.user.id]);
    }
    this.publish('channel:' + channel, {
      type: 'typing', channel, user: publicUser(ctx.user), isTyping: !!isTyping
    });
  }

  tick() {
    const cutoff = Date.now() - 8000;
    const stale = all('SELECT channel_id, user_id FROM typing WHERE updated_at < ?', [cutoff]);
    if (stale.length) {
      run('DELETE FROM typing WHERE updated_at < ?', [cutoff]);
      for (const s of stale) {
        const u = get('SELECT * FROM users WHERE id = ?', [s.user_id]);
        if (u) this.publish('channel:' + s.channel_id, { type: 'typing', channel: s.channel_id, user: publicUser(u), isTyping: false });
      }
    }
  }

  // Helpers used by HTTP routes to push realtime events
  emitTaskChanged(projectId, task, actor, action='update') {
    this.publish('channel:project:' + projectId, { type: 'task:'+action, task, actor: publicUser(actor) });
    // notify assignee if not actor
    if (task.assignee_id && task.assignee_id !== actor.id) {
      this.sendToUser(task.assignee_id, {
        type: 'notification',
        notification: {
          id: nanoid(10), type: 'task:'+action,
          title: `Task ${action}: ${task.title}`,
          body: action === 'done' ? 'Marked as done' : 'Assigned or updated',
          createdAt: Date.now(), read: false, taskId: task.id, projectId
        }
      });
    }
  }

  emitProjectChanged(project, action='update') {
    this.broadcast('project:'+action, { project });
  }

  emitFileUploaded(file, uploader) {
    this.broadcast('file:new', { file, uploader: publicUser(uploader) });
  }
}

export function publicUser(u) {
  if (!u) return null;
  return {
    id: u.id, email: u.email, name: u.name, role: u.role,
    avatarColor: u.avatar_color, title: u.title || null
  };
}
