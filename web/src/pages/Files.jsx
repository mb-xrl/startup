import React, { useEffect, useState } from 'react';
import { Icon } from '../components/Icons.jsx';
import { Avatar } from './Dashboard.jsx';
import FileDropZone from '../components/FileDropZone.jsx';
import { api } from '../lib/api.js';
import { useApp } from '../App.jsx';
import { formatBytes, formatRelative } from '../lib/util.js';

export default function Files() {
  const { toast } = useApp();
  const [files, setFiles] = useState([]);
  const [query, setQuery] = useState('');

  const load = async () => {
    const r = await api.get('/api/files');
    setFiles(r.files);
  };
  useEffect(() => { load();
    const off1 = useApp().rt.on('file:new', ev => setFiles(f => [ev.file, ...f]));
    const off2 = useApp().rt.on('file:delete', ev => setFiles(f => f.filter(x => x.id !== ev.fileId)));
    return () => { off1(); off2(); };
  }, []);

  const del = async (id, name) => {
    if (!confirm(`Delete ${name}?`)) return;
    await api.del('/api/files/' + id);
    setFiles(f => f.filter(x => x.id !== id));
    toast('File deleted', 'success');
  };

  const filtered = files.filter(f => !query || f.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Files</h1>
          <p className="text-muted text-sm mt-1">Fast file sharing across the team. Drag & drop to upload.</p>
        </div>
        <div className="relative">
          <Icon name="search" size={16} className="absolute left-2.5 top-2.5 text-muted" />
          <input className="input !pl-8 w-64" placeholder="Search files…" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
      </div>

      <FileDropZone />

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-muted">
            <Icon name="folder" size={32} className="mx-auto mb-2 opacity-50"/>
            No files yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-muted border-b border-border">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Uploaded by</th>
                <th className="px-4 py-3 font-semibold">Size</th>
                <th className="px-4 py-3 font-semibold">When</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(f => (
                <tr key={f.id} className="hover:bg-surface2/60 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-surface2 flex items-center justify-center shrink-0">
                        <Icon name={f.mimeType.startsWith('image/') ? 'image' : 'file'} size={16}/>
                      </div>
                      <div className="font-medium truncate">{f.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar user={f.uploader} size={22} />
                      <span>{f.uploader.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{formatBytes(f.size)}</td>
                  <td className="px-4 py-3 text-muted">{formatRelative(f.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <a className="btn-ghost !p-1.5" href={api.downloadUrl(f.id)} title="Download"><Icon name="download" size={16}/></a>
                      <button className="btn-ghost !p-1.5 text-danger" onClick={() => del(f.id, f.name)} title="Delete"><Icon name="trash" size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
