import React, { useEffect, useState } from 'react';
import { Icon } from '../components/Icons.jsx';
import { Avatar } from './Dashboard.jsx';
import Modal from '../components/Modal.jsx';
import { api } from '../lib/api.js';
import { useApp } from '../App.jsx';
import { formatRelative } from '../lib/util.js';

export default function Team() {
  const { user, toast, onlineUsers } = useApp();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const isAdmin = user.role === 'owner' || user.role === 'admin';

  const load = async () => {
    const [u, r] = await Promise.all([api.get('/api/users'), api.get('/api/roles')]);
    setUsers(u.users);
    setRoles(r.roles);
  };
  useEffect(() => { load(); }, []);

  const remove = async (u) => {
    if (!confirm(`Remove ${u.name} from the team?`)) return;
    await api.del('/api/users/' + u.id);
    setUsers(xs => xs.filter(x => x.id !== u.id));
    toast('Member removed', 'success');
  };
  const changeRole = async (u, role) => {
    await api.patch('/api/users/' + u.id, { role });
    setUsers(xs => xs.map(x => x.id === u.id ? { ...x, role } : x));
    toast('Role updated', 'success');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
          <p className="text-muted text-sm mt-1">{users.length} members · {onlineUsers.size} online now</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setOpen(true)}><Icon name="plus" size={16}/> Invite member</button>
        )}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-muted border-b border-border">
              <th className="px-4 py-3 font-semibold">Member</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map(u => {
              const online = onlineUsers.has(u.id);
              return (
                <tr key={u.id} className="hover:bg-surface2/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar user={u} size={36}/>
                        {online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full ring-2 ring-surface"/>}
                      </div>
                      <div>
                        <div className="font-medium">{u.name} {u.id === user.id && <span className="text-xs text-muted">(you)</span>}</div>
                        <div className="text-xs text-muted">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {isAdmin && u.id !== user.id ? (
                      <select className="input !py-1 !w-32 capitalize" value={u.role} onChange={e => changeRole(u, e.target.value)}>
                        {roles.map(r => <option key={r.name} value={r.name} className="capitalize">{r.name}</option>)}
                      </select>
                    ) : (
                      <span className="chip capitalize">{u.role}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${online ? 'text-success' : 'text-muted'}`}>● {online ? 'Online' : 'Offline'}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isAdmin && u.id !== user.id && (
                      <button className="btn-ghost !p-1.5 text-danger" onClick={() => remove(u)} title="Remove"><Icon name="trash" size={16}/></button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isAdmin && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2"><Icon name="shield" size={16}/> Roles & permissions</h3>
            <button className="btn-outline" onClick={() => setEditRole({ name: '', permissions: [] })}><Icon name="plus" size={16}/> New role</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {roles.map(r => (
              <div key={r.name} className="p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div className="font-medium capitalize">{r.name}</div>
                  <button className="btn-ghost !p-1.5" onClick={() => setEditRole(r)}><Icon name="edit" size={14}/></button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(JSON.parse(r.permissions || '[]')).map(p => <span key={p} className="chip !py-0 text-[11px]">{p}</span>)}
                  {r.permissions === '["*"]' || r.permissions === '[\"*\"]' && <span className="chip !py-0 text-[11px]">Full access</span>}
                  {r.permissions === '[]' && <span className="text-xs text-muted">No permissions</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <InviteModal open={open} onClose={() => setOpen(false)} roles={roles} onCreated={load} />
      <RoleModal open={!!editRole} role={editRole} onClose={() => setEditRole(null)} onSaved={() => { setEditRole(null); load(); toast('Role saved', 'success'); }}/>
    </div>
  );
}

function InviteModal({ open, onClose, roles, onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' });
  const submit = async (e) => {
    e.preventDefault();
    await api.post('/api/users', form);
    setForm({ name: '', email: '', password: '', role: 'employee' });
    onCreated(); onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Invite team member">
      <form onSubmit={submit} className="space-y-4">
        <input className="input" placeholder="Full name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required autoFocus/>
        <input type="email" className="input" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required/>
        <input type="password" className="input" placeholder="Temporary password (min 6 chars)" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6}/>
        <div>
          <label className="text-sm text-muted mb-1 block">Role</label>
          <select className="input capitalize" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
            {roles.map(r => <option key={r.name} value={r.name} className="capitalize">{r.name}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary">Create member</button>
        </div>
      </form>
    </Modal>
  );
}

const PERMISSIONS = ['projects.write','tasks.write','chat.write','files.write','members.manage'];

function RoleModal({ open, role, onClose, onSaved }) {
  const [name, setName] = useState('');
  const [perms, setPerms] = useState([]);
  const [isNew, setIsNew] = useState(true);
  useEffect(() => {
    if (role) {
      setName(role.name || '');
      try {
        const p = JSON.parse(role.permissions || '[]');
        setPerms(Array.isArray(p) ? p : []);
      } catch { setPerms([]); }
      setIsNew(!role.name);
    }
  }, [role]);
  const save = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (isNew) await api.post('/api/roles', { name, permissions: perms });
    else await api.patch('/api/roles/' + name, { permissions: perms });
    onSaved();
  };
  const toggle = (p) => setPerms(xs => xs.includes(p) ? xs.filter(x => x !== p) : [...xs, p]);
  const canDelete = !['owner','admin','manager','employee','viewer'].includes(name);
  const del = async () => {
    if (!canDelete) return;
    if (!confirm('Delete this role?')) return;
    await api.del('/api/roles/' + name);
    onSaved();
  };
  return (
    <Modal open={open} onClose={onClose} title={isNew ? 'New role' : `Edit role: ${name}`}>
      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="text-sm text-muted mb-1 block">Role name</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} disabled={!isNew} required placeholder="e.g. designer"/>
        </div>
        <div>
          <label className="text-sm text-muted mb-2 block">Permissions</label>
          <div className="space-y-2">
            {PERMISSIONS.map(p => (
              <label key={p} className="flex items-center gap-2 p-2 rounded-lg border border-border cursor-pointer hover:bg-surface2">
                <input type="checkbox" checked={perms.includes(p)} onChange={() => toggle(p)}/>
                <span className="text-sm font-mono">{p}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-between gap-2 pt-2">
          {!isNew && canDelete && <button type="button" className="btn-danger" onClick={del}><Icon name="trash" size={16}/> Delete</button>}
          <div className="flex gap-2 ml-auto">
            <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn-primary">Save</button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
