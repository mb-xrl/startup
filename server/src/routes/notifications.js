import { all, run } from '../db/index.js';
import { nanoid } from 'nanoid';

export async function notifRoutes(app) {
  const auth = app.authenticate;

  app.get('/api/notifications', { preHandler: [auth] }, async (req) => {
    const rows = all(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100`,
      [req.user.id]
    );
    return { notifications: rows.map(r => ({
      id: r.id, type: r.type, payload: JSON.parse(r.payload),
      readAt: r.read_at, createdAt: r.created_at
    }))};
  });

  app.post('/api/notifications/:id/read', { preHandler: [auth] }, async (req) => {
    run('UPDATE notifications SET read_at = ? WHERE id = ? AND user_id = ?',
        [Date.now(), req.params.id, req.user.id]);
    return { ok: true };
  });

  app.post('/api/notifications/read-all', { preHandler: [auth] }, async (req) => {
    run('UPDATE notifications SET read_at = ? WHERE user_id = ? AND read_at IS NULL',
        [Date.now(), req.user.id]);
    return { ok: true };
  });
}

export function createNotification(userId, type, payload) {
  const id = nanoid(10);
  run(
    `INSERT INTO notifications (id, user_id, type, payload, created_at) VALUES (?, ?, ?, ?, ?)`,
    [id, userId, type, JSON.stringify(payload), Date.now()]
  );
  return id;
}
