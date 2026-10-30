// All SVG icons inline (no external icon fonts, no hardcoded icon packs).
// Consistent 1.5 stroke, rounded line caps.
import React from 'react';

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  width: 18,
  height: 18
};

export const Icon = ({ name, size = 18, className = '', ...rest }) => {
  const Comp = icons[name];
  if (!Comp) return null;
  return <Comp width={size} height={size} className={className} {...rest} />;
};

const make = (paths) => (props) => (
  <svg {...base} {...props}>
    {typeof paths === 'function' ? paths(props) : paths}
  </svg>
);

export const icons = {
  logo: make(<>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <path d="M8 8l6 6-6 6M14 8l6 6-6 6" />
  </>),
  home: make(<><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>),
  chat: make(<path d="M21 12a8 8 0 1 1-3.2-6.4L21 4l-1 3.5A8 8 0 0 1 21 12z" />),
  folder: make(<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />),
  tasks: make(<><path d="M9 11l3 3 8-8" /><path d="M20 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" /></>),
  users: make(<><circle cx="9" cy="8" r="4" /><path d="M17 11a3 3 0 1 0 0-6" /><path d="M2 21a7 7 0 0 1 14 0" /><path d="M22 21a6 6 0 0 0-4-5.7" /></>),
  settings: make(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>),
  bell: make(<><path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16l-2-2z" /><path d="M10 20a2 2 0 0 0 4 0" /></>),
  search: make(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>),
  plus: make(<><path d="M12 5v14M5 12h14" /></>),
  send: make(<><path d="M22 2 11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></>),
  upload: make(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" /></>),
  download: make(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></>),
  trash: make(<><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></>),
  check: make(<path d="M5 12l5 5L20 7" />),
  x: make(<><path d="M18 6 6 18M6 6l12 12" /></>),
  moon: make(<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />),
  sun: make(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>),
  logout: make(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>),
  edit: make(<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></>),
  file: make(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></>),
  image: make(<><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></>),
  arrowLeft: make(<><path d="M19 12H5M12 19l-7-7 7-7" /></>),
  more: make(<><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></>),
  shield: make(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />),
  pin: make(<><path d="M12 17v5" /><path d="M9 10V4h6v6l3 3H6l3-3z" /></>),
  hash: make(<><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" /></>),
  chevron: make(<path d="m6 9 6 6 6-6" />),
  clock: make(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>),
  paperclip: make(<path d="M21 11.5 12.5 20a5.5 5.5 0 0 1-7.8-7.8l9-9a4 4 0 0 1 5.6 5.6l-9 9a2.5 2.5 0 1 1-3.5-3.5L15 7.5" />),
  smile: make(<><circle cx="12" cy="12" r="9" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></>),
  reply: make(<><path d="M9 17l-5-5 5-5" /><path d="M4 12h12a6 6 0 0 1 6 6v2" /></>),
  lock: make(<><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 1 1 8 0v4" /></>),
  mail: make(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>),
  sparkle: make(<path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M5 19l4-4M15 9l4-4" />),
  zap: make(<path d="M13 2 3 14h9l-1 8 10-12h-9z" />)
};
