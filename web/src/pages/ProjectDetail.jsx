import React, { useEffect, useState, useCallback } from 'react';
import { Icon } from '../components/Icons.jsx';
import { Avatar } from './Dashboard.jsx';
import Modal from '../components/Modal.jsx';
import FileDropZone from '../components/FileDropZone.jsx';
import { api } from '../lib/api.js';
import { useApp } from '../App.jsx';
import { formatBytes, formatRelative } from '../lib/util.js';

const COLUMNS = [
  { id: 'todo', label: 'To do' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'done', label: 'Done' }
];

const PRIORITIES = { low: 'text-muted', medium: 'text-warn', high: 'text-danger' };

export default function ProjectDetail() {
  const { activeProjectId: id, setPage, rt, user, toast } = useApp();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [files, setFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('board'); // board, files
  const [newTaskOpen, setNewTaskOpen] = useState(false);

  const isAdmin = user.role === 'owner' || user.role === 'admin';

  const load = useCallback(async () => {
    if (!id) return;
    const [p, t, f, u] = await Promise.all([
      api.get(`/api/projects/${id}`),
      api.get(`/api/projects/${id}/tasks`),
      api.get(`/api/files?projectId=${id}`),
      api.get('/api/users')
    ]);
    setProject(p.project);
    setTasks(t.tasks);
    setFiles(f.files);
    setUsers(u.users);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Realtime subscription for project channel
  useEffect(() => {
    if (!id) return;
    const ch = 'project:' + id;
    rt.subscribe(ch);
    const off1 = rt.on('task:create', ev => { if (ev.task?.projectId === id) setTasks(t => [...t, ev.task]); });
    const off2 = rt.on('task:update', ev => { if (ev.task?.projectId === id) setTasks(t => t.map(x => x.id === ev.task.id ? ev.task : x)); });
    const off3 = rt.on('task:done', ev => { if (ev.task?.projectId === id) setTasks(t => t.map(x => x.id === ev.task.id ? ev.task : x)); toast(`Task completed by ${ev.actor.name} 🎉`, 'success'); });
    const off4 = rt.on('task:reopen', ev => { if (ev.task?.projectId === id) setTasks(t => t.map(x => x.id === ev.task.id ? ev.task : x)); });
    const off5 = rt.on('task:delete', ev => { if (ev.projectId === id) setTasks(t => t.filter(x => x.id !== ev.taskId)); });
    const off6 = rt.on('file:new', ev => { if (ev.file?.projectId === id) setFiles(f => [ev.file, ...f]); });
    const off7 = rt.on('file:delete', ev => setFiles(f => f.filter(x => x.id !== ev.fileId)));
    return () => { off1(); off2(); off3(); off4(); off5(); off6(); off7(); rt.unsubscribe(ch); };
  }, [id, rt, toast]);

  const moveTask = async (taskId, status) => {
    // optimistic
    setTasks(t => t.map(x => x.id === taskId ? { ...x, status } : x));
    await api.patch('/api/tasks/' + taskId, { status });
  };
  const toggleDone = async (taskId) => {
    const t = tasks.find(x => x.id === taskId);
    if (!t) return;
    const newStatus = t.status === 'done' ? 'todo' : 'done';
    setTasks(ts => ts.map(x => x.id === taskId ? { ...x, status: newStatus, doneAt: newStatus === 'done' ? Date.now() : null } : x));
    await api.post(`/api/tasks/${taskId}/done`);
  };
  const deleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    setTasks(t => t.filter(x => x.id !== taskId));
    await api.del('/api/tasks/' + taskId);
  };

  if (!project) return <div className="p-6 text-muted">Loading…</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button onClick={() => setPage('projects')} className="btn-ghost !px-2 mb-4"><Icon name="arrowLeft" size={16}/> Back</button>

      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-semibold" style={{ background: project.color }}>
            {project.name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
            {project.description && <p className="text-muted text-sm mt-1 max-w-2xl">{project.description}</p>}
            <div className="flex items-center gap-2 mt-2">
              <span className="chip"><Icon name="tasks" size={12}/> {tasks.length} tasks</span>
              <span className="chip"><Icon name="file" size={12}/> {files.length} files</span>
              <div className="flex -space-x-2">
                {project.members.map(m => <Avatar key={m.id} user={m} size={22} className="ring-2 ring-bg"/>)}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline" onClick={() => setTab(tab === 'board' ? 'files' : 'board')}>
            <Icon name={tab === 'board' ? 'file' : 'tasks'} size={16}/> {tab === 'board' ? 'Files' : 'Board'}
          </button>
          <button className="btn-primary" onClick={() => setNewTaskOpen(true)}><Icon name="plus" size={16}/> New task</button>
        </div>
      </div>

      {tab === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className="card p-3 bg-surface2/50" onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData('text/task-id');
                  if (id) moveTask(id, col.id);
                }}>
                <div className="flex items-center justify-between px-2 py-1 mb-2">
                  <div className="font-medium text-sm">{col.label} <span className="text-muted">({colTasks.length})</span></div>
                </div>
                <div className="space-y-2 min-h-[100px]">
                  {colTasks.length === 0 && <div className="text-xs text-muted text-center py-6">Drop tasks here</div>}
                  {colTasks.map(t => (
                    <div key={t.id} draggable onDragStart={e => e.dataTransfer.setData('text/task-id', t.id)}
                      className="card p-3 hover:border-primary/40 transition cursor-grab active:cursor-grabbing">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium ${t.status === 'done' ? 'line-through text-muted' : ''}`}>{t.title}</div>
                          {t.description && <div className="text-xs text-muted mt-1 line-clamp-2">{t.description}</div>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => toggleDone(t.id)} className="btn-ghost !p-1" title={t.status === 'done' ? 'Reopen' : 'Mark done'}>
                            <Icon name="check" size={14} className={t.status === 'done' ? 'text-success' : ''}/>
                          </button>
                          {isAdmin && <button onClick={() => deleteTask(t.id)} className="btn-ghost !p-1 text-danger"><Icon name="trash" size={14}/></button>}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-[11px] font-medium ${PRIORITIES[t.priority] || ''} capitalize`}>● {t.priority}</span>
                        {t.assignee ? <Avatar user={t.assignee} size={20} /> : <div className="w-5 h-5" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <FileDropZone projectId={id} />
          <div className="card overflow-hidden">
            <div className="divide-y divide-border">
              {files.length === 0 && <div className="p-8 text-center text-muted">No files yet. Drag & drop above to upload.</div>}
              {files.map(f => (
                <div key={f.id} className="flex items-center gap-3 p-3 hover:bg-surface2 transition">
                  <div className="w-9 h-9 rounded-lg bg-surface2 flex items-center justify-center">
                    <Icon name={f.mimeType.startsWith('image/') ? 'image' : 'file'} size={18}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{f.name}</div>
                    <div className="text-xs text-muted">{formatBytes(f.size)} · {f.uploader.name} · {formatRelative(f.createdAt)}</div>
                  </div>
                  <a className="btn-ghost !p-2" href={api.downloadUrl(f.id)} title="Download"><Icon name="download" size={16}/></a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <NewTaskModal open={newTaskOpen} onClose={() => setNewTaskOpen(false)} users={users} projectId={id}
        onCreated={() => { setNewTaskOpen(false); toast('Task created', 'success'); }} />
    </div>
  );
}

function NewTaskModal({ open, onClose, users, projectId, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await api.post(`/api/projects/${projectId}/tasks`, {
      title: title.trim(), description, priority,
      assigneeId: assigneeId || null
    });
    setTitle(''); setDescription(''); setPriority('medium'); setAssigneeId('');
    onCreated();
  };
  return (
    <Modal open={open} onClose={onClose} title="New task">
      <form onSubmit={submit} className="space-y-4">
        <input className="input" autoFocus placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} required/>
        <textarea className="input" rows={3} placeholder="Add details…" value={description} onChange={e => setDescription(e.target.value)}/>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-muted mb-1 block">Priority</label>
            <select className="input" value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-muted mb-1 block">Assignee</label>
            <select className="input" value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
              <option value="">Unassigned</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary">Create task</button>
        </div>
      </form>
    </Modal>
  );
}
