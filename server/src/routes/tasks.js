import { all, get, run } from '../db/index.js';
import { nanoid } from 'nanoid';
import { publicUser } from '../hub.js';

export async function taskRoutes(app) {
  const auth = app.authenticate;
  const canWrite = app.requirePerm('tasks.write');

  app.get('/api/projects/:id/tasks', { preHandler: [auth] }, async (req) => {
    const tasks = all(
      `SELECT t.*, u.name as assignee_name, u.avatar_color as assignee_color,
              c.name as creator_name
       FROM tasks t
       LEFT JOIN users u ON u.id = t.assignee_id
       JOIN users c ON c.id = t.creator_id
       WHERE t.project_id = ? ORDER BY t.status, t.position, t.created_at`,
      [req.params.id]
    ).map(mapTask);
    return { tasks };
  });

  app.post('/api/projects/:id/tasks', { preHandler: [auth, canWrite] }, async (req, reply) => {
    const { title, description = '', priority = 'medium', assigneeId = null, dueDate = null } = req.body || {};
    if (!title) return reply.code(400).send({ error: 'title required' });
    const id = nanoid(12);
    const now = Date.now();
    const pos = (get('SELECT COALESCE(MAX(position), 0) + 1 as p FROM tasks WHERE project_id = ?', [req.params.id]) || {}).p || 1;
    run(
      `INSERT INTO tasks (id, project_id, title, description, status, priority, assignee_id, creator_id, due_date, created_at, position)
       VALUES (?, ?, ?, ?, 'todo', ?, ?, ?, ?, ?, ?)`,
      [id, req.params.id, title.trim(), description, priority, assigneeId, req.user.id, dueDate, now, pos]
    );
    const task = getTask(id);
    app.hub.emitTaskChanged(req.params.id, task, req.user, 'create');
    return { task };
  });

  app.patch('/api/tasks/:id', { preHandler: [auth] }, async (req, reply) => {
    const t = get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!t) return reply.code(404).send({ error: 'Not found' });
    const { title, description, priority, status, assigneeId, dueDate, position } = req.body || {};
    const newStatus = status ?? t.status;
    const doneAt = newStatus === 'done' && t.status !== 'done' ? Date.now() :
                   newStatus !== 'done' ? null : t.done_at;
    run(
      `UPDATE tasks SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        priority = COALESCE(?, priority),
        status = COALESCE(?, status),
        assignee_id = ?,
        due_date = ?,
        position = COALESCE(?, position),
        done_at = ?
       WHERE id = ?`,
      [
        title ?? null, description ?? null, priority ?? null, status ?? null,
        assigneeId === undefined ? t.assignee_id : assigneeId,
        dueDate === undefined ? t.due_date : dueDate,
        position ?? null, doneAt, req.params.id
      ]
    );
    const updated = getTask(req.params.id);
    app.hub.emitTaskChanged(t.project_id, updated, req.user, newStatus === 'done' && t.status !== 'done' ? 'done' : 'update');
    return { task: updated };
  });

  app.delete('/api/tasks/:id', { preHandler: [auth] }, async (req) => {
    const t = get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!t) return { ok: true };
    run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    app.hub.publish('channel:project:' + t.project_id, { type: 'task:delete', taskId: req.params.id, projectId: t.project_id });
    return { ok: true };
  });

  app.post('/api/tasks/:id/done', { preHandler: [auth] }, async (req, reply) => {
    const t = get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!t) return reply.code(404).send({ error: 'Not found' });
    const newStatus = t.status === 'done' ? 'todo' : 'done';
    const doneAt = newStatus === 'done' ? Date.now() : null;
    run('UPDATE tasks SET status = ?, done_at = ? WHERE id = ?', [newStatus, doneAt, req.params.id]);
    const updated = getTask(req.params.id);
    app.hub.emitTaskChanged(t.project_id, updated, req.user, newStatus === 'done' ? 'done' : 'reopen');
    return { task: updated };
  });
}

function mapTask(t) {
  return {
    id: t.id, projectId: t.project_id, title: t.title, description: t.description,
    status: t.status, priority: t.priority,
    assigneeId: t.assignee_id,
    assignee: t.assignee_id ? { id: t.assignee_id, name: t.assignee_name, avatarColor: t.assignee_color } : null,
    creatorId: t.creator_id, creatorName: t.creator_name,
    dueDate: t.due_date, createdAt: t.created_at, doneAt: t.done_at, position: t.position
  };
}
function getTask(id) {
  const t = get(
    `SELECT t.*, u.name as assignee_name, u.avatar_color as assignee_color, c.name as creator_name
     FROM tasks t LEFT JOIN users u ON u.id = t.assignee_id
     JOIN users c ON c.id = t.creator_id WHERE t.id = ?`, [id]
  );
  return t ? mapTask(t) : null;
}
