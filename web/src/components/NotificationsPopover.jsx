import React from 'react';
import { Icon } from './Icons.jsx';
import { useApp } from '../App.jsx';
import { api } from '../lib/api.js';
import { formatRelative } from '../lib/util.js';

export default function NotificationsPopover({ onClose }) {
  const { notifications, setNotifications, markAllRead } = useApp();
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-80 card max-h-[60vh] overflow-hidden flex flex-col z-40 animate-fade-in">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="font-medium text-sm">Notifications</div>
          <button className="text-xs text-primary hover:underline" onClick={markAllRead}>Mark all read</button>
        </div>
        <div className="overflow-y-auto">
          {notifications.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted">
              <Icon name="bell" size={24} className="mx-auto mb-2 opacity-50" />
              <div>All caught up!</div>
            </div>
          )}
          {notifications.map(n => (
            <div key={n.id} className={`px-4 py-3 border-b border-border last:border-b-0 ${n.read ? 'opacity-70' : ''}`}>
              <div className="text-sm font-medium">{n.title}</div>
              {n.body && <div className="text-xs text-muted mt-0.5 line-clamp-2">{n.body}</div>}
              <div className="text-[11px] text-muted mt-1">{formatRelative(n.createdAt)}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
