export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

export function formatTime(ts) {
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function formatRelative(ts) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff/60) + 'm ago';
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
  if (diff < 7*86400) return Math.floor(diff/86400) + 'd ago';
  return new Date(ts).toLocaleDateString();
}

export function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1024*1024) return (b/1024).toFixed(1) + ' KB';
  if (b < 1024*1024*1024) return (b/1024/1024).toFixed(1) + ' MB';
  return (b/1024/1024/1024).toFixed(2) + ' GB';
}

export function fileIcon(mime = '', name = '') {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'file';
  if (mime.startsWith('audio/')) return 'file';
  if (name.endsWith('.pdf')) return 'file';
  return 'file';
}

export function colorFromStatus(s) {
  return s === 'done' ? 'bg-success/20 text-success' :
         s === 'in_progress' ? 'bg-primary/20 text-primary' :
         'bg-surface2 text-muted';
}
