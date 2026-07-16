import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Activity, CheckCircle2, Zap, Brain, TrendingUp, Loader2 } from 'lucide-react';

const FEATURES = [
  {
    icon: CheckCircle2,
    title: 'Project & Task Tracking',
    desc: 'Kanban boards with priority queues, due dates, and smart filters.',
  },
  {
    icon: Brain,
    title: 'AI Copilot Workspace',
    desc: 'Gemini-powered health analysis, sprint summaries, and daily plans.',
  },
  {
    icon: TrendingUp,
    title: 'Executive Analytics',
    desc: 'Real-time charts on project velocity, completion rates, and burndown.',
  },
  {
    icon: Zap,
    title: 'Fast & Reliable',
    desc: 'JWT-secured, MongoDB Atlas backed. Production-grade from day one.',
  },
];

const TESTIMONIALS = [
  { text: '"Cut our sprint planning time by 60%."', author: 'Product Manager' },
  { text: '"The AI daily plan feature is genuinely useful."', author: 'Full-Stack Developer' },
];

export const AuthLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-900/50">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen w-screen bg-zinc-950 overflow-x-hidden">
      {/* ===== LEFT MARKETING PANEL ===== */}
      <div className="relative hidden lg:flex flex-col justify-between w-[52%] shrink-0 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-zinc-950 to-zinc-950" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-violet-600/8 blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-900/60">
              <Activity className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">TaskFlow AI</span>
          </div>

          {/* Hero copy */}
          <div className="mt-auto mb-12 space-y-5 max-w-[380px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3 py-1">
              <Zap className="h-3 w-3 text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-300">AI-Powered Project Management</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
              Ship projects
              <br />
              <span className="text-indigo-400">smarter and faster.</span>
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              A premium workspace for developers and teams. Track tasks, analyze progress, and let AI plan your next sprint—all in one place.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4 mb-12">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800/80 border border-zinc-700/60">
                    <Icon className="h-3.5 w-3.5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-200">{feat.title}</div>
                    <div className="text-xs text-zinc-500 leading-relaxed">{feat.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Testimonials */}
          <div className="space-y-2.5 border-t border-zinc-800/60 pt-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.author} className="flex flex-col gap-0.5">
                <p className="text-xs text-zinc-400 italic">{t.text}</p>
                <p className="text-[10px] text-zinc-600 font-medium">— {t.author}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 text-[11px] text-zinc-700">
            © 2026 TaskFlow AI Capstone. All rights reserved.
          </div>
        </div>
      </div>

      {/* ===== RIGHT AUTH PANEL ===== */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10 bg-zinc-950 border-l border-zinc-900">
        {/* Mobile logo */}
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-white">TaskFlow AI</span>
        </div>

        <div className="w-full max-w-[400px] animate-fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
