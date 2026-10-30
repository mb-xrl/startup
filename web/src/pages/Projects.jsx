import React, { useEffect, useState } from 'react';
import { Icon } from '../components/Icons.jsx';
import { Avatar } from './Dashboard.jsx';
import Modal from '../components/Modal.jsx';
import { api } from '../lib/api.js';
import { useApp } from '../App.jsx';

const COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#06b6d4','#8b5cf6','#ef4444','#14b8a6'];

export default function Projects() {
  const { setPage, setActiveProjectId, toast, user } = useApp();
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const isAdmin = user.role === 'owner' || user.role === 'admin';

  const load = async () => {
    const r = await api.get('/api/projects');
    setProjects(r.projects);
  };
  useEffect(() => {
    load();
    api.get('/api/users').then(r => setUsers(r.users)).catch(()=>{});
  }, []);

  const colors = ['bg-primary/10 text-primary','bg-accent/10 text-accent','bg-success/10 text-success','bg-warn/10 text-warn','bg-danger/10 text-danger'];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-muted text-sm mt-1">Organize work, assign tasks, share files with your team.</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setOpen(true)}>
            <Icon name="plus" size={16}/> New project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="card p-10 text-center">
          <Icon name="folder" size={36} className="mx-auto mb-3 text-muted opacity-50"/>
          <div className="font-medium">No projects yet</div>
          <div className="text-muted text-sm mt-1">Create your first project to start organizing tasks and files.</div>
          {isAdmin && (
            <button className="btn-primary mt-4" onClick={() => setOpen(true)}>
              <Icon name="plus" size={16}/> New project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p, i) => (
            <div key={p.id} className="card p-5 hover:border-primary/40 transition cursor-pointer" onClick={() => { setActiveProjectId(p.id); setPage('project'); }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold" style={{ background: p.color }}>
                  {p.name[0].toUpperCase()}
                </div>
                {p.owner && <Avatar user={p.owner} size={24} />}
              </div>
              <div className="font-semibold">{p.name}</div>
              {p.description && <div className="text-sm text-muted mt-1 line-clamp-2">{p.description}</div>}
              <div className="flex items-center justify-between mt-4">
                <div className="flex -space-x-2">
                  {p.members.slice(0,5).map(m => <Avatar key={m.id} user={m} size={24} className="ring-2 ring-surface"/>)}
                  {p.members.length > 5 && <div className="w-6 h-6 rounded-full bg-surface2 text-xs flex items-center justify-center ring-2 ring-surface">+{p.members.length-5}</div>}
                </div>
                <button className="btn-ghost !p-1.5"><Icon name="arrowLeft" size={16} style={{ transform: 'rotate(180deg)' }}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <NewProjectModal open={open} onClose={() => setOpen(false)} users={users} onCreated={() => { load(); setOpen(false); toast('Project created', 'success'); }} />
    </div>
  );
}

function NewProjectModal({ open, onClose, users, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [memberIds, setMemberIds] = useState([]);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await api.post('/api/projects', { name: name.trim(), description, color, memberIds });
    setName(''); setDescription(''); setColor(COLORS[0]); setMemberIds([]);
    onCreated();
  };

  return (
    <Modal open={open} onClose={onClose} title="New project">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm text-muted mb-1 block">Name</label>
          <input className="input" autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Marketing website" required />
        </div>
        <div>
          <label className="text-sm text-muted mb-1 block">Description</label>
          <textarea className="input" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this project about?" />
        </div>
        <div>
          <label className="text-sm text-muted mb-2 block">Color</label>
          <div className="flex gap-2">
            {COLORS.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition ${color === c ? 'ring-2 ring-offset-2 ring-offset-surface ring-fg' : ''}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm text-muted mb-2 block">Members</label>
          <div className="flex flex-wrap gap-2">
            {users.map(u => {
              const on = memberIds.includes(u.id);
              return (
                <button type="button" key={u.id} onClick={() => setMemberIds(ids => on ? ids.filter(x => x !== u.id) : [...ids, u.id])}
                  className={`chip px-2 py-1 cursor-pointer transition ${on ? 'bg-primary/20 text-primary border-primary/40' : ''}`}>
                  <Avatar user={u} size={18} /> {u.name}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary">Create project</button>
        </div>
      </form>
    </Modal>
  );
}
