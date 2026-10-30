import React from 'react';
import { Icon, icons } from '../components/Icons.jsx';

export default function Landing({ onSignIn, onStartTrial }) {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <Nav onSignIn={onSignIn} onStartTrial={onStartTrial} />
      <Hero onSignIn={onSignIn} onStartTrial={onStartTrial} />
      <LogoCloud />
      <Features />
      <ShowcaseChat />
      <Workflow />
      <Testimonials />
      <Pricing onStartTrial={onStartTrial} />
      <FAQ />
      <CTA onStartTrial={onStartTrial} />
      <Footer />
    </div>
  );
}

function Nav({ onSignIn, onStartTrial }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/70 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
            <Icon name="logo" size={16} />
          </div>
          <span className="font-semibold tracking-tight text-lg">Nexa</span>
          <span className="chip !py-0 !text-[10px]">Beta</span>
        </div>
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted">
          <a href="#features" className="hover:text-fg transition">Features</a>
          <a href="#chat" className="hover:text-fg transition">Chat</a>
          <a href="#workflow" className="hover:text-fg transition">Workflow</a>
          <a href="#pricing" className="hover:text-fg transition">Pricing</a>
          <a href="#faq" className="hover:text-fg transition">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={onSignIn} className="btn-ghost">Sign in</button>
          <button onClick={onStartTrial} className="btn-primary">
            Start free <Icon name="arrowLeft" size={14} style={{ transform: 'rotate(180deg)' }} />
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero({ onStartTrial, onSignIn }) {
  return (
    <section className="relative overflow-hidden">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 blur-3xl rounded-full" />
        <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-accent/20 blur-3xl rounded-full" />
      </div>
      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      />
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <a href="#features" className="inline-flex items-center gap-2 chip hover:border-primary/40 transition mb-6">
          <Icon name="sparkle" size={12} className="text-accent" />
          <span>New: Realtime kanban with drag-and-drop</span>
        </a>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]">
          The workspace where
          <br />
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            teams actually ship.
          </span>
        </h1>
        <p className="mt-6 text-lg text-muted max-w-2xl mx-auto">
          Chat, files, projects and tasks — all in one place, all updating in real time.
          Nexa is the blazingly fast collaboration hub your company has been waiting for.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={onStartTrial} className="btn-primary !px-5 !py-2.5 text-base">
            Start free — no card required
            <Icon name="arrowLeft" size={16} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <button onClick={onSignIn} className="btn-outline !px-5 !py-2.5 text-base">
            I already have an account
          </button>
        </div>
        <div className="mt-4 text-xs text-muted">Free for up to 10 members · Deploy in 1 minute</div>

        {/* Preview window */}
        <div className="mt-16 relative max-w-5xl mx-auto">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-accent/5 to-transparent blur-2xl rounded-3xl" />
          <div className="card overflow-hidden shadow-2xl border-primary/20">
            <div className="h-8 bg-surface2 border-b border-border flex items-center gap-1.5 px-3">
              <span className="w-3 h-3 rounded-full bg-danger/70" />
              <span className="w-3 h-3 rounded-full bg-warn/70" />
              <span className="w-3 h-3 rounded-full bg-success/70" />
              <span className="text-xs text-muted ml-3">nexa.app/dashboard</span>
            </div>
            <div className="grid grid-cols-12 bg-bg h-[460px]">
              {/* Sidebar mock */}
              <div className="col-span-2 border-r border-border bg-surface p-3 space-y-1 text-xs">
                <div className="flex items-center gap-2 px-2 py-2 rounded-md bg-surface2 font-medium">
                  <Icon name="home" size={14}/> Home
                </div>
                {['chat','folder','tasks','file','users','settings'].map((i,k) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-surface2 text-muted">
                    <Icon name={i} size={14}/> <span className="capitalize">{i === 'folder' ? 'projects' : i === 'file' ? 'files' : i === 'users' ? 'team' : i}</span>
                  </div>
                ))}
              </div>
              {/* Kanban mock */}
              <div className="col-span-10 p-5 bg-bg overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-muted">Project</div>
                    <div className="font-semibold">Launch Q4</div>
                  </div>
                  <div className="flex gap-2">
                    <div className="chip"><Icon name="tasks" size={12}/> 24 tasks</div>
                    <div className="chip"><Icon name="file" size={12}/> 12 files</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { t:'To do', c:'text-muted', items:['Design landing','Write copy','Review PR','Plan launch'] },
                    { t:'In progress', c:'text-primary', items:['Build chat UI','Refactor DB'] },
                    { t:'Done', c:'text-success', items:['Auth flow','WS hub','Kanban board'] }
                  ].map(col => (
                    <div key={col.t} className="rounded-lg bg-surface2/60 border border-border p-2">
                      <div className={`text-[11px] font-semibold uppercase px-2 py-1 ${col.c}`}>{col.t}</div>
                      <div className="space-y-2 mt-2">
                        {col.items.map(t => (
                          <div key={t} className="rounded-md bg-surface border border-border p-2 text-xs">
                            <div className="font-medium">{t}</div>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-[10px] text-muted">● medium</span>
                              <div className="w-4 h-4 rounded-full bg-accent/30" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LogoCloud() {
  const companies = ['Acme','Linear','Stripe','Vercel','Notion','Figma','Raycast','Supabase'];
  return (
    <section className="py-12 border-y border-border/60">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs uppercase tracking-widest text-muted mb-6">
          Trusted by fast-moving teams at
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 items-center opacity-70">
          {companies.map(c => (
            <div key={c} className="text-center font-semibold tracking-tight text-muted text-xl">
              {c}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const feats = [
    { icon:'zap', title:'Millisecond realtime', desc:'Native WebSocket bus with optimistic updates. Mark a task done and everyone sees it instantly.' },
    { icon:'chat', title:'Built-in chat', desc:'Global channels, per-project rooms, typing indicators, read receipts and presence dots out of the box.' },
    { icon:'upload', title:'Blazing-fast file transfer', desc:'Drag and drop files up to 500MB. Chunked uploads, streaming downloads, instant sharing.' },
    { icon:'tasks', title:'Kanban projects', desc:'Drag-and-drop boards, assignees, priorities and due dates. Everything syncs live across tabs.' },
    { icon:'shield', title:'Roles & permissions', desc:'Custom roles with granular permissions. Invite employees, revoke access, audit everything.' },
    { icon:'bell', title:'Smart notifications', desc:'Get pinged only on what matters: mentions, assignments, replies. In-app, no spam.' }
  ];
  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="chip mb-3"><Icon name="sparkle" size={12}/> Everything you need</div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">One app, not ten.</h2>
          <p className="text-muted mt-4 text-lg">Stop paying for Slack, Notion, Drive, Asana and three more tools. Nexa replaces them all with a single, cohesive workspace.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feats.map(f => (
            <div key={f.title} className="card p-6 hover:border-primary/30 transition group">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Icon name={f.icon} size={20}/>
              </div>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="text-sm text-muted mt-2 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShowcaseChat() {
  return (
    <section id="chat" className="py-24 bg-surface/60 border-y border-border/60">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="chip mb-3"><Icon name="chat" size={12}/> Messaging</div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Chat that feels like a text with your team.</h2>
          <p className="text-muted mt-4 text-lg leading-relaxed">
            Global channels, per-project rooms, typing bubbles, presence dots, read receipts, threaded replies — everything you expect from a modern messaging app, built directly into your workspace.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              'WhatsApp-style grouped messages',
              'Online/offline presence in realtime',
              'Typing indicators across channels',
              'Per-project channels, auto-created for every project',
              'Emoji reactions & replies (coming soon)'
            ].map(x => (
              <li key={x} className="flex items-start gap-2">
                <Icon name="check" size={18} className="text-success mt-0.5 shrink-0"/> <span>{x}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-5 shadow-soft">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <Icon name="hash" size={18}/>
            <div>
              <div className="font-semibold text-sm">#general</div>
              <div className="text-xs text-muted">12 members · 3 online</div>
            </div>
          </div>
          <div className="py-4 space-y-4 max-h-72 overflow-hidden">
            <Msg color="#6366f1" name="Alex" time="09:42" text="Just pushed the new landing page — review?"/>
            <Msg color="#ec4899" name="Sara" time="09:43" text="Looks fire 🔥 I'll add the CTA in 5"/>
            <Msg color="#10b981" name="Dev" time="09:45" text="Deployment is green on prod, going out now"/>
            <div className="flex gap-3 pl-12 text-xs text-muted">
              <span className="dots"><span/><span/><span/></span>
              <span>Alex is typing…</span>
            </div>
          </div>
          <div className="pt-3 border-t border-border flex items-center gap-2">
            <div className="flex-1 bg-surface2 rounded-lg px-3 py-2 text-sm text-muted">Message #general…</div>
            <button className="btn-primary !p-2"><Icon name="send" size={16}/></button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Msg({ color, name, time, text }) {
  return (
    <div className="flex gap-3">
      <div className="w-9 h-9 rounded-full text-white text-sm font-semibold flex items-center justify-center shrink-0" style={{background:color}}>
        {name[0]}
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="font-medium text-sm">{name}</span>
          <span className="text-[11px] text-muted">{time}</span>
        </div>
        <div className="text-sm mt-0.5">{text}</div>
      </div>
    </div>
  );
}

function Workflow() {
  const steps = [
    { icon:'folder', title:'1. Create a project', desc:'Pick a color, add members, invite your team in seconds.' },
    { icon:'tasks', title:'2. Assign tasks', desc:'Drag cards between columns. Assignees see them instantly.' },
    { icon:'upload', title:'3. Share files', desc:'Drop designs, specs, contracts — they are attached to the project forever.' },
    { icon:'chat', title:'4. Ship together', desc:'Debate in the project channel. Mark done. Celebrate 🎉' }
  ];
  return (
    <section id="workflow" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="chip mb-3"><Icon name="zap" size={12}/> Workflow</div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">From zero to shipped in four steps.</h2>
          <p className="text-muted mt-4 text-lg">No onboarding calls. No 30-page docs. Just open the dashboard and go.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((s,i) => (
            <div key={s.title} className="card p-6 relative">
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-primaryFg flex items-center justify-center text-xs font-bold">
                {i+1}
              </div>
              <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                <Icon name={s.icon} size={20}/>
              </div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-sm text-muted mt-2">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    { name:'Léa Dubois', role:'CEO, Relay', text:'We replaced 5 tools with Nexa and saved $40k/year. The realtime feels telepathic.' },
    { name:'James Park', role:'Eng Lead, Tonic', text:'The kanban drag-and-drop is the smoothest I have used on any web app. Period.' },
    { name:'Maya Fares', role:'Design Director, Kite', text:'Finally a workspace that is actually fast. File uploads feel like AirDrop.' }
  ];
  return (
    <section className="py-24 bg-surface/60 border-y border-border/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Teams ship faster with Nexa.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quotes.map(q => (
            <div key={q.name} className="card p-6">
              <div className="text-3xl text-primary/60 font-serif leading-none">“</div>
              <p className="text-sm leading-relaxed -mt-4">{q.text}</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent" />
                <div>
                  <div className="text-sm font-medium">{q.name}</div>
                  <div className="text-xs text-muted">{q.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing({ onStartTrial }) {
  const plans = [
    { name:'Free', price:'$0', desc:'For small teams getting started.', features:['Up to 10 members','1 GB storage','All core features','Community support'], cta:'Start free', featured:false },
    { name:'Pro', price:'$8', desc:'For growing teams who need speed.', features:['Unlimited members','100 GB storage','Custom roles','Priority support','Audit logs'], cta:'Start 14-day trial', featured:true },
    { name:'Enterprise', price:'Custom', desc:'For companies with serious requirements.', features:['SSO / SAML','Unlimited storage','Dedicated support','SLA 99.99%','On-prem option'], cta:'Contact sales', featured:false }
  ];
  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="chip mb-3"><Icon name="sparkle" size={12}/> Pricing</div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Simple, fair pricing.</h2>
          <p className="text-muted mt-4 text-lg">Per member, per month. No hidden fees. Cancel anytime.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {plans.map(p => (
            <div key={p.name} className={`card p-6 relative ${p.featured ? 'border-primary shadow-soft ring-2 ring-primary/30' : ''}`}>
              {p.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 chip bg-primary text-primaryFg border-primary/40">Most popular</div>}
              <h3 className="font-semibold text-lg">{p.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">{p.price}</span>
                {p.price !== 'Custom' && <span className="text-muted text-sm">/user/mo</span>}
              </div>
              <p className="text-sm text-muted mt-2">{p.desc}</p>
              <button onClick={onStartTrial} className={`w-full mt-5 ${p.featured ? 'btn-primary' : 'btn-outline'}`}>{p.cta}</button>
              <ul className="mt-5 space-y-2 text-sm">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <Icon name="check" size={16} className="text-success mt-0.5 shrink-0"/> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const qs = [
    { q:'Do I need a credit card to start?', a:'No. The Free tier is free forever, no card required.' },
    { q:'Can I self-host Nexa?', a:'Yes. Nexa is MIT-licensed and a single `npm start` runs the whole stack on any Linux box.' },
    { q:'Is my data encrypted?', a:'All connections are TLS 1.3. Passwords are hashed with bcrypt. End-to-end encryption for files is on the roadmap.' },
    { q:'Does it integrate with Slack / GitHub / Linear?', a:'Webhook integrations are shipping in v1.1. The API is fully documented today.' },
    { q:'How realtime is "realtime"?', a:'Native WebSockets with <10ms broadcast latency under normal network conditions.' }
  ];
  const [open, setOpen] = React.useState(0);
  return (
    <section id="faq" className="py-24 bg-surface/60 border-y border-border/60">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Frequently asked questions</h2>
        </div>
        <div className="space-y-2">
          {qs.map((item,i) => (
            <div key={item.q} className="card overflow-hidden">
              <button className="w-full px-5 py-4 flex items-center justify-between text-left" onClick={() => setOpen(open === i ? -1 : i)}>
                <span className="font-medium">{item.q}</span>
                <Icon name="chevron" size={16} className={`transition ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && <div className="px-5 pb-4 text-sm text-muted leading-relaxed">{item.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA({ onStartTrial }) {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="card p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Ready to ship faster?</h2>
          <p className="text-muted mt-4 text-lg max-w-xl mx-auto">
            Your team is 2 minutes away from the workspace they will actually love.
          </p>
          <button onClick={onStartTrial} className="btn-primary mt-6 !px-6 !py-3 text-base">
            Create your workspace — it's free
            <Icon name="arrowLeft" size={16} style={{ transform: 'rotate(180deg)' }}/>
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
              <Icon name="logo" size={14}/>
            </div>
            <span className="font-semibold">Nexa</span>
          </div>
          <p className="text-muted mt-3 max-w-xs">The realtime workspace for modern companies. Built with obsession, shipped with love.</p>
        </div>
        <FooterCol title="Product" items={['Features','Chat','Projects','Files','Pricing']}/>
        <FooterCol title="Company" items={['About','Blog','Careers','Press','Contact']}/>
        <FooterCol title="Legal" items={['Privacy','Terms','Security','DPA']}/>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-border flex items-center justify-between text-xs text-muted">
        <div>© {new Date().getFullYear()} Nexa Labs, Inc.</div>
        <div>Made with <span className="text-danger">♥</span> for teams that ship.</div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }) {
  return (
    <div>
      <div className="font-semibold mb-3">{title}</div>
      <ul className="space-y-2 text-muted">
        {items.map(i => <li key={i}><a href="#" className="hover:text-fg transition">{i}</a></li>)}
      </ul>
    </div>
  );
}
