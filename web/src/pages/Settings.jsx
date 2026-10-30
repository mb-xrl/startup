import React, { useEffect, useState } from 'react';
import { Icon } from '../components/Icons.jsx';
import { Avatar } from './Dashboard.jsx';
import { useApp } from '../App.jsx';
import { api } from '../lib/api.js';

export default function Settings() {
  const { user, theme, toggleTheme, toast } = useApp();
  const isAdmin = user.role === 'owner' || user.role === 'admin';

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <div className="card p-5">
        <h3 className="font-semibold mb-4">Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Theme</div>
            <div className="text-xs text-muted">Switch between dark and light mode.</div>
          </div>
          <div className="flex gap-1 p-1 bg-surface2 rounded-lg">
            <button onClick={() => document.documentElement.classList.contains('dark') && toggleTheme()}
              className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-2 ${theme === 'light' ? 'bg-surface shadow-soft' : 'text-muted'}`}>
              <Icon name="sun" size={14}/> Light
            </button>
            <button onClick={() => !document.documentElement.classList.contains('dark') && toggleTheme()}
              className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-2 ${theme === 'dark' ? 'bg-surface shadow-soft' : 'text-muted'}`}>
              <Icon name="moon" size={14}/> Dark
            </button>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold mb-4">Your profile</h3>
        <div className="flex items-center gap-4">
          <Avatar user={user} size={60}/>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-muted">{user.email}</div>
            <div className="mt-1"><span className="chip capitalize">{user.role}</span></div>
          </div>
        </div>
        <p className="text-xs text-muted mt-4">Profile editing is coming soon. For now, ask an admin to change your name or role.</p>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold mb-2 flex items-center gap-2"><Icon name="zap" size={16}/> About Nexa</h3>
        <div className="text-sm text-muted space-y-2">
          <p>Nexa is a realtime workspace for companies: chat, file transfer, projects and tasks — all in one place.</p>
          <p className="text-xs">Version 0.1.0 · Built with Fastify, WebSockets and React · All messages and updates are pushed to your team in milliseconds.</p>
        </div>
      </div>

      {isAdmin && (
        <div className="card p-5">
          <h3 className="font-semibold mb-2 flex items-center gap-2"><Icon name="shield" size={16}/> Admin short cuts</h3>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button className="btn-outline justify-start" onClick={() => window.location.hash = '#/team'}>
              <Icon name="users" size={16}/> Manage team & roles
            </button>
            <button className="btn-outline justify-start" onClick={() => window.location.hash = '#/projects'}>
              <Icon name="folder" size={16}/> Manage projects
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
