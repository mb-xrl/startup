import { all, get, run } from '../db/index.js';
import { nanoid } from 'nanoid';
import { publicUser } from '../hub.js';

export async function projectRoutes(app) {
  const auth = app.authenticate;
  const canWrite = app.requirePerm('projects.write');

  app.get('/api/projects', { preHandler: [auth] }, async (req) => {
    // owners/admins see all; others see only projects they are members of (or created)
    const isAdmin = req.user.role === 'owner' || req.user.role === 'admin';
    const projects = isAdmin
      ? all(`SELECT p.*, u.name as owner_name FROM projects p
             JOIN users u ON u.id = p.owner_id WHERE p.archived = 0 ORDER BY p.created_at DESC`)
      : all(`SELECT p.*, u.name as owner_name FROM projects p
             JOIN users u ON u.id = p.owner_id
             LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = ?
             WHERE p.archived = 0 AND (p.owner_id = ? OR pm.user_id IS NOT NULL)
             ORDER BY p.created_at DESC`, [req.user.id, req.user.id]);
    return { projects: projects.map(mapProject) };
  });

  app.post('/api/projects', { preHandler: [auth, canWrite] }, async (req, reply) => {
    const { name, description = '', color = '#6366f1', memberIds = [] } = req.body || {};
    if (!name) return reply.code(400).send({ error: 'name required' });
    const id = nanoid(12);
    const now = Date.now();
    run(
      `INSERT INTO projects (id, name, description, color, owner_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, description, color, req.user.id, now]
    );
    run(`INSERT INTO project_members (project_id, user_id) VALUES (?, ?)`, [id, req.user.id]);
    for (const mid of memberIds) {
      run(`INSERT OR IGNORE INTO project_members (project_id, user_id) VALUES (?, ?)`, [id, mid]);
    }
    const project = getProjectWithMembers(id);
    app.hub.emitProjectChanged(project, 'create');
    return { project };
  });

  app.get('/api/projects/:id', { preHandler: [auth] }, async (req, reply) => {
    const project = getProjectWithMembers(req.params.id);
    if (!project) return reply.code(404).send({ error: 'Not found' });
    return { project };
  });

  app.patch('/api/projects/:id', { preHandler: [auth, canWrite] }, async (req, reply) => {
    const { name, description, color, archived } = req.body || {};
    const p = get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!p) return reply.code(404).send({ error: 'Not found' });
    run(
      `UPDATE projects SET name = COALESCE(?, name), description = COALESCE(?, description),
       color = COALESCE(?, color), archived = COALESCE(?, archived) WHERE id = ?`,
      [name ?? null, description ?? null, color ?? null, archived == null ? null : (archived?1:0), req.params.id]
    );
    const updated = getProjectWithMembers(req.params.id);
    app.hub.emitProjectChanged(updated, 'update');
    return { project: updated };
  });

  app.delete('/api/projects/:id', { preHandler: [auth, canWrite] }, async (req, reply) => {
    run('DELETE FROM projects WHERE id = ?', [req.params.id]);
    app.hub.broadcast('project:delete', { projectId: req.params.id });
    return { ok: true };
  });

  app.post('/api/projects/:id/members', { preHandler: [auth, canWrite] }, async (req, reply) => {
    const { userId } = req.body || {};
    if (!userId) return reply.code(400).send({ error: 'userId required' });
    run(`INSERT OR IGNORE INTO project_members (project_id, user_id) VALUES (?, ?)`, [req.params.id, userId]);
    app.hub.publish('channel:project:' + req.params.id, {
      type: 'project:member-added', projectId: req.params.id, userId
    });
    return { project: getProjectWithMembers(req.params.id) };
  });

  app.delete('/api/projects/:id/members/:userId', { preHandler: [auth, canWrite] }, async (req) => {
    run(`DELETE FROM project_members WHERE project_id = ? AND user_id = ?`, [req.params.id, req.params.userId]);
    return { project: getProjectWithMembers(req.params.id) };
  });
}

function mapProject(p) {
  const members = all(
    `SELECT u.* FROM users u JOIN project_members pm ON pm.user_id = u.id WHERE pm.project_id = ?`, [p.id]
  ).map(publicUser);
  const owner = publicUser({ id: p.owner_id, name: p.owner_name });
  return {
    id: p.id, name: p.name, description: p.description, color: p.color,
    ownerId: p.owner_id, owner, members, createdAt: p.created_at, archived: !!p.archived
  };
}
function getProjectWithMembers(id) {
  const p = get(
    `SELECT p.*, u.name as owner_name FROM projects p JOIN users u ON u.id = p.owner_id WHERE p.id = ?`, [id]
  );
  return p ? mapProject(p) : null;
}
