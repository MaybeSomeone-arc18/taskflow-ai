import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import {
  Shield,
  Sparkles,
  Sun,
  Moon,
  User,
  Keyboard,
  HelpCircle,
  Lock,
  AtSign,
  CheckCircle2,
  Database,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Manage your account profile, preferences, and workspace configuration.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Nav panel */}
        <div className="md:col-span-1 space-y-1">
          {[
            { icon: User, label: 'Account Profile', active: true },
            { icon: Shield, label: 'Security', active: false },
            { icon: Keyboard, label: 'Keyboard Shortcuts', active: false },
            { icon: HelpCircle, label: 'Help & Docs', active: false },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={[
                  'w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors',
                  item.active
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 border border-transparent cursor-not-allowed',
                ].join(' ')}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Content area */}
        <div className="md:col-span-3 space-y-5">
          {/* Profile Card */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900 overflow-hidden">
            <div className="p-5 border-b border-zinc-800/60 flex items-center gap-2">
              <User className="h-4 w-4 text-zinc-500" />
              <h3 className="text-sm font-semibold text-zinc-200">Account Details</h3>
            </div>
            <div className="p-5 space-y-5">
              {/* Avatar + name row */}
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-lg font-bold text-white shadow-md">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-100">{user?.fullName || 'Guest User'}</p>
                  <p className="text-xs text-zinc-500">{user?.email || 'guest@example.com'}</p>
                </div>
                <div className="ml-auto">
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/25 bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-400">
                    <Shield className="h-3 w-3" />
                    Workspace Creator
                  </span>
                </div>
              </div>

              {/* Info fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="h-3 w-3" /> Full Name
                  </label>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-800/40 px-4 py-2.5 text-sm text-zinc-300 select-all">
                    {user?.fullName || '—'}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
                    <AtSign className="h-3 w-3" /> Email Address
                  </label>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-800/40 px-4 py-2.5 text-sm text-zinc-300 select-all">
                    {user?.email || '—'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-400">Account is active and authenticated via JWT session.</p>
              </div>
            </div>
          </div>

          {/* Preferences Card */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900 overflow-hidden">
            <div className="p-5 border-b border-zinc-800/60 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-zinc-500" />
              <h3 className="text-sm font-semibold text-zinc-200">Workspace Preferences</h3>
            </div>
            <div className="p-5 space-y-4">
              {/* Theme toggle row */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/40 border border-zinc-800">
                <div>
                  <p className="text-sm font-semibold text-zinc-200">Interface Theme</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Currently using <span className="text-zinc-400 font-medium">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-all"
                >
                  {theme === 'dark' ? (
                    <><Sun className="h-3.5 w-3.5 text-amber-400" /><span>Light Mode</span></>
                  ) : (
                    <><Moon className="h-3.5 w-3.5 text-indigo-400" /><span>Dark Mode</span></>
                  )}
                </button>
              </div>

              {/* Security indicators row */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/40 border border-zinc-800">
                  <Lock className="h-4 w-4 text-indigo-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-zinc-300">Password</p>
                    <p className="text-[10px] text-zinc-600">Bcrypt salted hash</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/40 border border-zinc-800">
                  <Database className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-zinc-300">Database</p>
                    <p className="text-[10px] text-zinc-600">MongoDB Atlas cluster</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Platform info */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Platform Information</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              {[
                { label: 'Version', value: 'MVP v1.0' },
                { label: 'Stack', value: 'MERN + AI' },
                { label: 'Auth', value: 'JWT + Bcrypt' },
                { label: 'AI Provider', value: 'Google Gemini' },
                { label: 'Charts', value: 'Recharts' },
                { label: 'Hosting', value: 'Local Dev' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-zinc-800/40 border border-zinc-800 px-3 py-2.5">
                  <p className="text-zinc-600">{item.label}</p>
                  <p className="font-semibold text-zinc-300 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
