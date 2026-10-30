import { all, get, run } from '../db/index.js';
import { publicUser } from '../hub.js';
import { hashPassword } from '../auth.js';
import { nanoid } from 'nanoid';
import { pickColor } from '../hub.js';

export async function userRoutes(app) {
  const auth = app.authenticate;
  const adminOnly = app.requirePerm('members.manage');

  app.get('/api/users', { preHandler: [auth] }, async () => {
    return { users: all('SELECT * FROM users ORDER BY name').map(publicUser) };
  });

  app.post('/api/users', { preHandler: [auth, adminOnly] }, async (req, reply) => {
    const { email, name, password, role = 'employee', title } = req.body || {};
    if (!email || !name || !password) return reply.code(400).send({ error: 'Missing fields' });
    const exists = get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (exists) return reply.code(409).send({ error: 'Email already exists' });
    const hash = await hashPassword(password);
    const id = nanoid(12);
    const now = Date.now();
    run(
      `INSERT INTO users (id, email, name, password_hash, role, avatar_color, title, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, email.toLowerCase(), name, hash, role, pickColor(email+name), title || null, now]
    );
    const user = get('SELECT * FROM users WHERE id = ?', [id]);
    app.hub.broadcast('user:join', { user: publicUser(user) });
    return { user: publicUser(user) };
  });

  app.patch('/api/users/:id', { preHandler: [auth, adminOnly] }, async (req, reply) => {
    const { id } = req.params;
    const { name, role, title } = req.body || {};
    const user = get('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) return reply.code(404).send({ error: 'Not found' });
    run(
      `UPDATE users SET name = COALESCE(?, name), role = COALESCE(?, role), title = COALESCE(?, title) WHERE id = ?`,
      [name ?? null, role ?? null, title ?? null, id]
    );
    const updated = get('SELECT * FROM users WHERE id = ?', [id]);
    app.hub.broadcast('user:update', { user: publicUser(updated) });
    return { user: publicUser(updated) };
  });

  app.delete('/api/users/:id', { preHandler: [auth, adminOnly] }, async (req, reply) => {
    if (req.params.id === req.user.id) return reply.code(400).send({ error: 'Cannot delete yourself' });
    run('DELETE FROM users WHERE id = ?', [req.params.id]);
    app.hub.broadcast('user:leave', { userId: req.params.id });
    return { ok: true };
  });

  app.get('/api/roles', { preHandler: [auth] }, async () => {
    return { roles: all('SELECT * FROM roles ORDER BY name') };
  });

  app.post('/api/roles', { preHandler: [auth, adminOnly] }, async (req, reply) => {
    const { name, permissions = [] } = req.body || {};
    if (!name) return reply.code(400).send({ error: 'name required' });
    const id = nanoid(10);
    run(
      `INSERT INTO roles (id, name, permissions, created_at) VALUES (?, ?, ?, ?)`,
      [id, name, JSON.stringify(permissions), Date.now()]
    );
    return { role: get('SELECT * FROM roles WHERE id = ?', [id]) };
  });

  app.patch('/api/roles/:name', { preHandler: [auth, adminOnly] }, async (req, reply) => {
    const { permissions } = req.body || {};
    run('UPDATE roles SET permissions = ? WHERE name = ?', [JSON.stringify(permissions||[]), req.params.name]);
    const role = get('SELECT * FROM roles WHERE name = ?', [req.params.name]);
    if (!role) return reply.code(404).send({ error: 'Not found' });
    return { role };
  });

  app.delete('/api/roles/:name', { preHandler: [auth, adminOnly] }, async (req, reply) => {
    if (['owner','admin','manager','employee','viewer'].includes(req.params.name))
      return reply.code(400).send({ error: 'Cannot delete built-in roles' });
    run('DELETE FROM roles WHERE name = ?', [req.params.name]);
    return { ok: true };
  });
}
