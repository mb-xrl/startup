import { getToken } from './api.js';

export class RealtimeClient {
  constructor() {
    this.ws = null;
    this.handlers = new Map();
    this.reconnectTimer = null;
    this.subscribed = new Set();
    this.authed = false;
    this.queue = [];
  }

  connect() {
    if (this.ws && this.ws.readyState <= 1) return;
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const url = `${proto}://${location.host}/ws`;
    this.ws = new WebSocket(url);
    this.ws.onopen = () => {
      this.authed = false;
      const token = getToken();
      if (token) this.send({ type: 'auth', token });
      // re-subscribe
      for (const ch of this.subscribed) this.send({ type: 'subscribe', channel: ch });
      // flush queue
      while (this.queue.length) this.send(this.queue.shift());
      this.emit('open');
    };
    this.ws.onmessage = (ev) => {
      let msg; try { msg = JSON.parse(ev.data); } catch { return; }
      this.emit(msg.type, msg);
      this.emit('*', msg);
    };
    this.ws.onclose = () => {
      this.authed = false;
      this.emit('close');
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = setTimeout(() => this.connect(), 1500);
    };
    this.ws.onerror = () => { this.ws.close(); };
  }

  on(type, fn) {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type).add(fn);
    return () => this.off(type, fn);
  }
  off(type, fn) {
    const s = this.handlers.get(type);
    if (s) s.delete(fn);
  }
  emit(type, data) {
    const s = this.handlers.get(type);
    if (s) s.forEach(fn => fn(data));
  }

  send(msg) {
    if (!this.ws || this.ws.readyState !== 1) {
      this.queue.push(msg); return;
    }
    this.ws.send(JSON.stringify(msg));
  }

  auth(token) { this.send({ type: 'auth', token }); }
  subscribe(channel) {
    this.subscribed.add(channel);
    this.send({ type: 'subscribe', channel });
  }
  unsubscribe(channel) {
    this.subscribed.delete(channel);
    this.send({ type: 'unsubscribe', channel });
  }
  sendChat(channel, text, replyTo) {
    this.send({ type: 'chat:send', channel, text, replyTo });
  }
  typing(channel, isTyping) { this.send({ type: 'typing', channel, isTyping }); }
  close() { this.ws && this.ws.close(); }
}

export const rt = new RealtimeClient();
