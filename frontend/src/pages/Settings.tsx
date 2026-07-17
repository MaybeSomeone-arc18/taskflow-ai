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
  ChevronRight,
  Monitor
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-4xl"
    >
      <PageHeader 
        title="Settings & Preferences" 
        description="Manage your account profile, appearance, and workspace configuration."
      />

      <div className="grid gap-8 md:grid-cols-4 items-start">
        {/* Nav panel */}
        <Card className="md:col-span-1 p-2 sticky top-4 border-border-subtle shadow-lg">
          <div className="space-y-1">
            {[
              { icon: User, label: 'Account Profile', active: true },
              { icon: Shield, label: 'Security', active: false },
              { icon: Keyboard, label: 'Keyboard Shortcuts', active: false },
              { icon: Monitor, label: 'Appearance', active: false },
              { icon: HelpCircle, label: 'Help & Docs', active: false },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={[
                    'w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all group',
                    item.active
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                      : 'text-content-muted hover:bg-surface-hover hover:text-content-secondary border border-transparent cursor-not-allowed',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 shrink-0 transition-colors ${item.active ? 'text-primary' : 'text-content-muted group-hover:text-content-secondary'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.active && <ChevronRight className="h-4 w-4 text-primary/50" />}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Content area */}
        <div className="md:col-span-3 space-y-6">
          {/* Profile Card */}
          <Card className="overflow-hidden border-border-subtle shadow-lg">
            <CardHeader className="pb-3 border-b border-border-subtle bg-surface/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-surface flex items-center justify-center border border-border-subtle">
                  <User className="h-4 w-4 text-content-muted" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-content">Account Details</CardTitle>
                  <p className="text-[11px] text-content-muted font-medium">Personal information and role</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Avatar + name row */}
              <div className="flex items-center gap-5 p-4 rounded-2xl bg-surface border border-border-subtle">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-2xl font-black text-content-inverse shadow-lg ring-4 ring-card">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-lg font-bold text-content tracking-tight">{user?.fullName || 'Guest User'}</p>
                  <p className="text-sm text-content-secondary font-medium">{user?.email || 'guest@example.com'}</p>
                </div>
                <div className="ml-auto hidden sm:block">
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary shadow-sm">
                    <Shield className="h-3.5 w-3.5" />
                    Workspace Owner
                  </span>
                </div>
              </div>

              {/* Info fields */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-content-muted uppercase tracking-widest flex items-center gap-1.5">
                    <User className="h-3 w-3" /> Full Name
                  </label>
                  <div className="rounded-xl border border-border-subtle bg-surface px-4 py-3 text-sm font-medium text-content select-all shadow-inner">
                    {user?.fullName || '—'}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-content-muted uppercase tracking-widest flex items-center gap-1.5">
                    <AtSign className="h-3 w-3" /> Email Address
                  </label>
                  <div className="rounded-xl border border-border-subtle bg-surface px-4 py-3 text-sm font-medium text-content select-all shadow-inner">
                    {user?.email || '—'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-400">Account Active</p>
                  <p className="text-xs text-emerald-500/80">Authenticated via secure JWT session.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card className="overflow-hidden border-border-subtle shadow-lg">
            <CardHeader className="pb-3 border-b border-border-subtle bg-surface/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-surface flex items-center justify-center border border-border-subtle">
                  <Sparkles className="h-4 w-4 text-content-muted" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-content">Workspace Preferences</CardTitle>
                  <p className="text-[11px] text-content-muted font-medium">Customize your experience</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {/* Theme toggle row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface border border-border-subtle">
                <div>
                  <p className="text-sm font-bold text-content">Interface Theme</p>
                  <p className="text-xs text-content-secondary font-medium mt-1">
                    Currently using <span className="text-content font-bold">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={toggleTheme}
                  icon={theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-blue-400" />}
                >
                  {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                </Button>
              </div>

              {/* Security indicators row */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface border border-border-subtle">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-content">Password</p>
                    <p className="text-[11px] text-content-secondary font-medium mt-0.5">Bcrypt salted hash</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface border border-border-subtle">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <Database className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-content">Database</p>
                    <p className="text-[11px] text-content-secondary font-medium mt-0.5">MongoDB Atlas cluster</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform info */}
          <Card className="overflow-hidden border-border-subtle shadow-lg">
            <CardHeader className="pb-3 border-b border-border-subtle bg-surface/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-surface flex items-center justify-center border border-border-subtle">
                  <Sparkles className="h-4 w-4 text-content-muted" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-content">Platform Information</CardTitle>
                  <p className="text-[11px] text-content-muted font-medium">System and stack details</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: 'Version', value: 'MVP v1.0' },
                  { label: 'Stack', value: 'MERN + AI' },
                  { label: 'Auth', value: 'JWT + Bcrypt' },
                  { label: 'AI Provider', value: 'Google Gemini' },
                  { label: 'Charts', value: 'Recharts' },
                  { label: 'Hosting', value: 'Local Dev' },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-surface border border-border-subtle p-4 hover:border-border-focus transition-colors">
                    <p className="text-[10px] font-bold text-content-muted uppercase tracking-widest">{item.label}</p>
                    <p className="font-bold text-content mt-1.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
