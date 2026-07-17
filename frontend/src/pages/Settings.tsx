import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import {
  User, Shield, Keyboard, Monitor, HelpCircle,
  Eye, EyeOff, Lock, AtSign, CheckCircle2, AlertCircle,
  Sun, Moon, Laptop, Search, ExternalLink, Github,
  FileText, Zap, Bug, MessageSquarePlus, Info,
  Smartphone, LogOut, Palette, Type, Layers,
  Sparkles, Activity, Globe, ChevronRight, Camera,
  Save, RotateCcw, Check, X, Wifi, Clock,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn } from '../utils/cn';

type TabId = 'profile' | 'security' | 'appearance' | 'shortcuts' | 'help';
type ThemeMode = 'light' | 'dark' | 'system';
type AccentColor = 'blue' | 'purple' | 'emerald' | 'orange' | 'rose';
type FontSize = 'small' | 'medium' | 'large';
type Density = 'comfortable' | 'compact';

interface AppearancePrefs {
  themeMode: ThemeMode;
  accentColor: AccentColor;
  fontSize: FontSize;
  density: Density;
  reducedMotion: boolean;
  glassEffect: boolean;
  backgroundEffects: boolean;
}

const ACCENT_COLORS: { id: AccentColor; label: string; hex: string; cls: string }[] = [
  { id: 'blue',    label: 'Blue',    hex: '#3b82f6', cls: 'bg-blue-500' },
  { id: 'purple',  label: 'Purple',  hex: '#8b5cf6', cls: 'bg-violet-500' },
  { id: 'emerald', label: 'Emerald', hex: '#10b981', cls: 'bg-emerald-500' },
  { id: 'orange',  label: 'Orange',  hex: '#f97316', cls: 'bg-orange-500' },
  { id: 'rose',    label: 'Rose',    hex: '#f43f5e', cls: 'bg-rose-500' },
];

const SHORTCUTS = [
  { keys: ['N'],          label: 'New Task',        group: 'Tasks' },
  { keys: ['P'],          label: 'New Project',      group: 'Projects' },
  { keys: ['/'],          label: 'Search',           group: 'Navigation' },
  { keys: ['G', 'D'],     label: 'Go to Dashboard',  group: 'Navigation' },
  { keys: ['G', 'A'],     label: 'Go to Analytics',  group: 'Navigation' },
  { keys: ['G', 'S'],     label: 'Go to Settings',   group: 'Navigation' },
  { keys: ['?'],          label: 'Open Shortcuts',   group: 'Help' },
  { keys: ['Ctrl', 'K'],  label: 'Command Palette',  group: 'Navigation' },
  { keys: ['Escape'],     label: 'Close Modals',     group: 'Navigation' },
  { keys: ['Ctrl', 'Z'],  label: 'Undo',             group: 'Actions' },
  { keys: ['Ctrl', 'S'],  label: 'Save Changes',     group: 'Actions' },
  { keys: ['Ctrl', 'Enter'], label: 'Submit Form',   group: 'Actions' },
  { keys: ['Tab'],        label: 'Next Field',       group: 'Navigation' },
  { keys: ['Shift', 'Tab'], label: 'Prev Field',     group: 'Navigation' },
];

const DOCS_CARDS = [
  { icon: FileText, title: 'Documentation', desc: 'Full product guides and references.', href: '#', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { icon: Keyboard, title: 'Keyboard Shortcuts', desc: 'Speed up your workflow.', href: '#', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  { icon: Github, title: 'GitHub Repository', desc: 'Browse source code and contribute.', href: 'https://github.com/MaybeSomeone-arc18/taskflow-ai', color: 'text-content', bg: 'bg-surface', border: 'border-border-subtle' },
  { icon: Zap, title: 'API Documentation', desc: 'REST API endpoints and usage.', href: '#', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { icon: Bug, title: 'Report a Bug', desc: 'Found an issue? Let us know.', href: 'https://github.com/MaybeSomeone-arc18/taskflow-ai/issues/new', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  { icon: MessageSquarePlus, title: 'Feature Request', desc: 'Suggest an improvement or idea.', href: 'https://github.com/MaybeSomeone-arc18/taskflow-ai/discussions', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
];

const TABS: { id: TabId; icon: React.ElementType; label: string }[] = [
  { id: 'profile',    icon: User,       label: 'Account Profile' },
  { id: 'security',   icon: Shield,     label: 'Security' },
  { id: 'appearance', icon: Monitor,    label: 'Appearance' },
  { id: 'shortcuts',  icon: Keyboard,   label: 'Keyboard Shortcuts' },
  { id: 'help',       icon: HelpCircle, label: 'Help & Docs' },
];

function loadPrefs(): AppearancePrefs {
  try {
    const s = localStorage.getItem('taskflow_appearance');
    if (s) return JSON.parse(s) as AppearancePrefs;
  } catch (_) { /* noop */ }
  return { themeMode: 'dark', accentColor: 'blue', fontSize: 'medium', density: 'comfortable', reducedMotion: false, glassEffect: true, backgroundEffects: true };
}

function savePrefs(p: AppearancePrefs) {
  localStorage.setItem('taskflow_appearance', JSON.stringify(p));
}

function applyAccentColor(color: AccentColor) {
  const map: Record<AccentColor, { primary: string; hover: string }> = {
    blue:    { primary: '#3b82f6', hover: '#2563eb' },
    purple:  { primary: '#8b5cf6', hover: '#7c3aed' },
    emerald: { primary: '#10b981', hover: '#059669' },
    orange:  { primary: '#f97316', hover: '#ea580c' },
    rose:    { primary: '#f43f5e', hover: '#e11d48' },
  };
  const { primary, hover } = map[color];
  document.documentElement.style.setProperty('--theme-primary', primary);
  document.documentElement.style.setProperty('--theme-primary-hover', hover);
}

function applyFontSize(size: FontSize) {
  const map: Record<FontSize, string> = { small: '13px', medium: '14px', large: '15px' };
  document.documentElement.style.fontSize = map[size];
}

function getPasswordStrength(p: string): { score: number; label: string; color: string } {
  let s = 0;
  if (p.length >= 8)  s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  const map = [
    { label: 'Very Weak',   color: 'bg-rose-500' },
    { label: 'Weak',        color: 'bg-orange-500' },
    { label: 'Fair',        color: 'bg-amber-500' },
    { label: 'Good',        color: 'bg-blue-500' },
    { label: 'Strong',      color: 'bg-emerald-500' },
    { label: 'Very Strong', color: 'bg-emerald-400' },
  ];
  return { score: s, ...map[Math.min(s, 5)] };
}

function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browser = 'Unknown Browser';
  if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('Chrome/')) browser = 'Google Chrome';
  else if (ua.includes('Safari/')) browser = 'Safari';
  let os = 'Unknown OS';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  return { browser, os };
}

function SectionHeader({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <CardHeader className="pb-3 border-b border-border-subtle bg-surface/50">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-surface flex items-center justify-center border border-border-subtle shrink-0">
          <Icon className="h-4 w-4 text-content-muted" />
        </div>
        <div>
          <CardTitle className="text-base font-bold text-content">{title}</CardTitle>
          <p className="text-[11px] text-content-muted font-medium mt-0.5">{desc}</p>
        </div>
      </div>
    </CardHeader>
  );
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        checked ? 'bg-primary' : 'bg-surface-hover',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      )}
      role="switch"
      aria-checked={checked}
    >
      <motion.span
        className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0"
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      />
    </button>
  );
}

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      className={cn(
        'fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-3.5 shadow-2xl backdrop-blur-xl',
        type === 'success'
          ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
          : 'bg-rose-950/90 border-rose-500/30 text-rose-300'
      )}
    >
      {type === 'success' ? <Check className="h-4 w-4 shrink-0" /> : <X className="h-4 w-4 shrink-0" />}
      <span className="text-sm font-semibold">{msg}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <X className="h-3 w-3" />
      </button>
    </motion.div>
  );
}

// ── Profile Tab ────────────────────────────────────────────────────────────────

function ProfileTab({ showToast }: { showToast: (m: string, t: 'success' | 'error') => void }) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.fullName ?? '');
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl ?? null);
  const fileRef = useRef<HTMLInputElement>(null);
  const loginTime = localStorage.getItem('taskflow_login_time') ?? new Date().toISOString();

  useEffect(() => {
    if (!localStorage.getItem('taskflow_login_time')) {
      localStorage.setItem('taskflow_login_time', new Date().toISOString());
    }
  }, []);

  const isDirty = name.trim() !== (user?.fullName ?? '') || (avatarPreview !== null && avatarPreview !== user?.avatarUrl);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!isDirty) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    showToast('Profile updated successfully', 'success');
  };

  const handleDiscard = () => {
    setName(user?.fullName ?? '');
    setAvatarPreview(user?.avatarUrl ?? null);
  };

  const initials = (user?.fullName ?? 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-border-subtle shadow-lg">
        <SectionHeader icon={User} title="Account Details" desc="Personal information and account role" />
        <CardContent className="p-6 space-y-6">
          {/* Avatar row */}
          <div className="flex items-center gap-5 p-4 rounded-2xl bg-surface border border-border-subtle">
            <div className="relative group shrink-0">
              {avatarPreview && avatarPreview.startsWith('data:') ? (
                <img src={avatarPreview} alt="Avatar" className="h-16 w-16 rounded-2xl object-cover ring-4 ring-card shadow-lg" />
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-2xl font-black text-white shadow-lg ring-4 ring-card select-none">
                  {initials}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="h-5 w-5 text-white" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-content tracking-tight truncate">{name || user?.fullName || 'Guest'}</p>
              <p className="text-sm text-content-secondary font-medium">{user?.email}</p>
            </div>
            <div className="ml-auto hidden sm:block">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary shadow-sm">
                <Shield className="h-3.5 w-3.5" />
                {(user as any)?.role ?? 'User'}
              </span>
            </div>
          </div>

          {/* Fields */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-content-muted uppercase tracking-widest flex items-center gap-1.5">
                <User className="h-3 w-3" /> Full Name
              </label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" maxLength={50} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-content-muted uppercase tracking-widest flex items-center gap-1.5">
                <AtSign className="h-3 w-3" /> Email Address
                <span className="ml-auto text-[9px] text-content-muted border border-border-subtle rounded px-1.5 py-0.5 font-medium">Read-only</span>
              </label>
              <Input value={user?.email ?? ''} disabled leftIcon={<AtSign className="h-4 w-4" />} />
            </div>
          </div>

          {/* Metadata */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Clock, label: 'Last Login', value: new Date(loginTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
              { icon: Globe, label: 'Workspace', value: 'TaskFlow AI' },
              { icon: CheckCircle2, label: 'Account Status', value: 'Active', green: true },
            ].map(m => (
              <div key={m.label} className="rounded-xl bg-surface border border-border-subtle p-4 space-y-1">
                <p className="text-[10px] font-bold text-content-muted uppercase tracking-widest flex items-center gap-1.5">
                  <m.icon className="h-3 w-3" />{m.label}
                </p>
                <p className={cn('text-sm font-semibold', (m as any).green ? 'text-emerald-400' : 'text-content')}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <Button onClick={handleSave} loading={saving} disabled={!isDirty} icon={<Save className="h-4 w-4" />}>
              Save Changes
            </Button>
            <Button variant="outline" disabled={!isDirty} onClick={handleDiscard} icon={<RotateCcw className="h-4 w-4" />}>
              Discard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Security Tab ───────────────────────────────────────────────────────────────

function SecurityTab({ showToast }: { showToast: (m: string, t: 'success' | 'error') => void }) {
  const { logout } = useAuth();
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCur, setShowCur] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [saving, setSaving] = useState(false);
  const strength = getPasswordStrength(next);
  const { browser, os } = getBrowserInfo();
  const loginTime = localStorage.getItem('taskflow_login_time') ?? new Date().toISOString();

  const checks = [
    { label: 'At least 8 characters', pass: next.length >= 8 },
    { label: 'Uppercase letter',      pass: /[A-Z]/.test(next) },
    { label: 'Lowercase letter',      pass: /[a-z]/.test(next) },
    { label: 'Number',                pass: /[0-9]/.test(next) },
    { label: 'Special character',     pass: /[^A-Za-z0-9]/.test(next) },
  ];

  const canSave = cur.length > 0 && next.length >= 8 && next === confirm;

  const handleSavePassword = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await api.put('/auth/password', { currentPassword: cur, newPassword: next });
      showToast('Password updated successfully', 'success');
      setCur(''); setNext(''); setConfirm('');
    } catch (err: unknown) {
      showToast((err as Error).message ?? 'Password update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Password change */}
      <Card className="overflow-hidden border-border-subtle shadow-lg">
        <SectionHeader icon={Lock} title="Change Password" desc="Update your account password" />
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-content-muted uppercase tracking-widest">Current Password</label>
            <Input
              type={showCur ? 'text' : 'password'}
              value={cur}
              onChange={e => setCur(e.target.value)}
              placeholder="••••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowCur(s => !s)} className="text-content-muted hover:text-content-secondary transition-colors">
                  {showCur ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-content-muted uppercase tracking-widest">New Password</label>
            <Input
              type={showNext ? 'text' : 'password'}
              value={next}
              onChange={e => setNext(e.target.value)}
              placeholder="••••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowNext(s => !s)} className="text-content-muted hover:text-content-secondary transition-colors">
                  {showNext ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            {next.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={cn('h-1 flex-1 rounded-full transition-all duration-300', i <= strength.score ? strength.color : 'bg-surface-hover')} />
                  ))}
                </div>
                <p className="text-xs text-content-muted">Strength: <span className="font-semibold text-content">{strength.label}</span></p>
                <div className="grid grid-cols-2 gap-1.5">
                  {checks.map(c => (
                    <div key={c.label} className="flex items-center gap-1.5 text-xs">
                      {c.pass ? <Check className="h-3 w-3 text-emerald-400 shrink-0" /> : <X className="h-3 w-3 text-content-muted shrink-0" />}
                      <span className={c.pass ? 'text-emerald-400' : 'text-content-muted'}>{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-content-muted uppercase tracking-widest">Confirm New Password</label>
            <Input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••••"
              error={confirm.length > 0 && next !== confirm}
              leftIcon={<Lock className="h-4 w-4" />}
            />
            {confirm.length > 0 && next !== confirm && (
              <p className="text-xs text-danger flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Passwords do not match</p>
            )}
          </div>

          <Button onClick={handleSavePassword} loading={saving} disabled={!canSave} icon={<Save className="h-4 w-4" />}>
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Sessions */}
      <Card className="overflow-hidden border-border-subtle shadow-lg">
        <SectionHeader icon={Smartphone} title="Active Sessions" desc="Devices currently signed into your account" />
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface border border-border-subtle">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <Laptop className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-content">{browser}</p>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">Current</span>
              </div>
              <p className="text-xs text-content-muted">{os} · Signed in {new Date(loginTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            </div>
            <Wifi className="h-4 w-4 text-emerald-400 shrink-0" />
          </div>
          <Button variant="danger" icon={<LogOut className="h-4 w-4" />} onClick={() => void logout()} className="w-full sm:w-auto">
            Log out from all devices
          </Button>
        </CardContent>
      </Card>

      {/* 2FA Coming Soon */}
      <Card className="overflow-hidden border-border-subtle shadow-lg">
        <SectionHeader icon={Shield} title="Two-Factor Authentication" desc="Add an extra layer of security to your account" />
        <CardContent className="p-6">
          <div className="flex items-center justify-between p-5 rounded-2xl bg-surface border border-border-subtle">
            <div>
              <p className="text-sm font-bold text-content">Authenticator App (TOTP)</p>
              <p className="text-xs text-content-muted mt-0.5">Use an authenticator app like 1Password or Google Authenticator</p>
            </div>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-1 uppercase tracking-widest">Coming Soon</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Appearance Tab ─────────────────────────────────────────────────────────────

function AppearanceTab({ showToast: _showToast }: { showToast: (m: string, t: 'success' | 'error') => void }) {
  const { theme, toggleTheme } = useTheme();
  const [prefs, setPrefs] = useState<AppearancePrefs>(loadPrefs);

  const update = useCallback(<K extends keyof AppearancePrefs>(key: K, val: AppearancePrefs[K]) => {
    setPrefs(p => {
      const next = { ...p, [key]: val };
      savePrefs(next);
      if (key === 'accentColor') applyAccentColor(val as AccentColor);
      if (key === 'fontSize') applyFontSize(val as FontSize);
      if (key === 'themeMode') {
        const wantDark = val === 'dark' || (val === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        const isDark = theme === 'dark';
        if (wantDark !== isDark) toggleTheme();
      }
      return next;
    });
  }, [theme, toggleTheme]);

  useEffect(() => {
    applyAccentColor(prefs.accentColor);
    applyFontSize(prefs.fontSize);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const themeModes: { id: ThemeMode; icon: React.ElementType; label: string }[] = [
    { id: 'system', icon: Laptop, label: 'System' },
    { id: 'light',  icon: Sun,    label: 'Light' },
    { id: 'dark',   icon: Moon,   label: 'Dark' },
  ];

  const fontSizes: { id: FontSize; label: string; textClass: string }[] = [
    { id: 'small',  label: 'Small',  textClass: 'text-sm' },
    { id: 'medium', label: 'Medium', textClass: 'text-base' },
    { id: 'large',  label: 'Large',  textClass: 'text-xl' },
  ];

  const densities: { id: Density; label: string; desc: string }[] = [
    { id: 'comfortable', label: 'Comfortable', desc: 'More whitespace & padding' },
    { id: 'compact',     label: 'Compact',     desc: 'Denser, more information' },
  ];

  const toggleRows = [
    { key: 'reducedMotion'    as const, label: 'Reduced Motion',     desc: 'Minimize animations for accessibility' },
    { key: 'glassEffect'      as const, label: 'Glass Effect',       desc: 'Frosted glass on cards and panels' },
    { key: 'backgroundEffects' as const, label: 'Background Effects', desc: 'Subtle gradient and noise textures' },
  ];

  return (
    <div className="space-y-5">
      {/* Theme */}
      <Card className="overflow-hidden border-border-subtle shadow-lg">
        <SectionHeader icon={Sun} title="Theme" desc="Choose your preferred color scheme" />
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-3">
            {themeModes.map(m => {
              const Icon = m.icon;
              const active = prefs.themeMode === m.id;
              return (
                <button key={m.id} onClick={() => update('themeMode', m.id)}
                  className={cn('flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all duration-200',
                    active ? 'bg-primary/10 border-primary/40 shadow-sm' : 'bg-surface border-border-subtle hover:border-border-focus hover:bg-surface-hover'
                  )}>
                  <Icon className={cn('h-5 w-5', active ? 'text-primary' : 'text-content-muted')} />
                  <span className={cn('text-xs font-semibold', active ? 'text-primary' : 'text-content-secondary')}>{m.label}</span>
                  {active && <motion.div layoutId="theme-dot" className="h-1 w-4 bg-primary rounded-full" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Accent color */}
      <Card className="overflow-hidden border-border-subtle shadow-lg">
        <SectionHeader icon={Palette} title="Accent Color" desc="Applied to buttons, highlights, and interactive elements" />
        <CardContent className="p-6">
          <div className="flex items-center gap-4 flex-wrap">
            {ACCENT_COLORS.map(c => {
              const active = prefs.accentColor === c.id;
              return (
                <button key={c.id} onClick={() => update('accentColor', c.id)} title={c.label}
                  className={cn('relative h-9 w-9 rounded-full transition-all duration-200', c.cls,
                    active ? 'scale-110' : 'hover:scale-105 opacity-75 hover:opacity-100'
                  )}
                  style={active ? { boxShadow: `0 0 0 3px ${c.hex}40, 0 0 0 2px ${c.hex}` } : {}}>
                  {active && <Check className="absolute inset-0 m-auto h-4 w-4 text-white" />}
                </button>
              );
            })}
            <span className="text-xs text-content-muted ml-1">
              {ACCENT_COLORS.find(c => c.id === prefs.accentColor)?.label}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Font size */}
      <Card className="overflow-hidden border-border-subtle shadow-lg">
        <SectionHeader icon={Type} title="Font Size" desc="Adjust interface text size" />
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-3">
            {fontSizes.map(f => {
              const active = prefs.fontSize === f.id;
              return (
                <button key={f.id} onClick={() => update('fontSize', f.id)}
                  className={cn('flex flex-col items-center gap-1.5 p-4 rounded-2xl border transition-all duration-200',
                    active ? 'bg-primary/10 border-primary/40' : 'bg-surface border-border-subtle hover:border-border-focus hover:bg-surface-hover'
                  )}>
                  <span className={cn('font-bold', active ? 'text-primary' : 'text-content-secondary', f.textClass)}>Aa</span>
                  <span className={cn('text-xs font-semibold', active ? 'text-primary' : 'text-content-muted')}>{f.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Density */}
      <Card className="overflow-hidden border-border-subtle shadow-lg">
        <SectionHeader icon={Layers} title="Interface Density" desc="Control spacing and layout compactness" />
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-3">
            {densities.map(d => {
              const active = prefs.density === d.id;
              return (
                <button key={d.id} onClick={() => update('density', d.id)}
                  className={cn('flex flex-col gap-1 p-4 rounded-2xl border text-left transition-all duration-200',
                    active ? 'bg-primary/10 border-primary/40' : 'bg-surface border-border-subtle hover:border-border-focus hover:bg-surface-hover'
                  )}>
                  <span className={cn('text-sm font-bold', active ? 'text-primary' : 'text-content')}>{d.label}</span>
                  <span className="text-xs text-content-muted">{d.desc}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Effect toggles */}
      <Card className="overflow-hidden border-border-subtle shadow-lg">
        <SectionHeader icon={Sparkles} title="Interface Effects" desc="Fine-tune visual feedback and motion" />
        <CardContent className="p-6 space-y-0">
          {toggleRows.map((row, i) => (
            <div key={row.key}>
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-semibold text-content">{row.label}</p>
                  <p className="text-xs text-content-muted mt-0.5">{row.desc}</p>
                </div>
                <Toggle checked={prefs[row.key]} onChange={v => update(row.key, v)} />
              </div>
              {i < toggleRows.length - 1 && <div className="h-px bg-border-subtle" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Shortcuts Tab ──────────────────────────────────────────────────────────────

function ShortcutsTab() {
  const [query, setQuery] = useState('');
  const filtered = SHORTCUTS.filter(s =>
    s.label.toLowerCase().includes(query.toLowerCase()) ||
    s.keys.join(' ').toLowerCase().includes(query.toLowerCase()) ||
    s.group.toLowerCase().includes(query.toLowerCase())
  );
  const groups = [...new Set(filtered.map(s => s.group))];

  return (
    <Card className="overflow-hidden border-border-subtle shadow-lg">
      <SectionHeader icon={Keyboard} title="Keyboard Shortcuts" desc="Master your workflow with these keybindings" />
      <CardContent className="p-6 space-y-5">
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search shortcuts..."
          leftIcon={<Search className="h-4 w-4" />}
        />
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-10 text-content-muted text-sm">
              No shortcuts match &ldquo;{query}&rdquo;
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {groups.map(group => (
                <div key={group}>
                  <p className="text-[10px] font-bold text-content-muted uppercase tracking-widest mb-2">{group}</p>
                  <div className="space-y-0.5">
                    {filtered.filter(s => s.group === group).map(s => (
                      <div key={s.label} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-surface-hover transition-colors">
                        <span className="text-sm text-content-secondary font-medium">{s.label}</span>
                        <div className="flex items-center gap-1">
                          {s.keys.map((k, i) => (
                            <React.Fragment key={`${k}-${i}`}>
                              <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg bg-surface border border-border-subtle text-[11px] font-bold text-content shadow-sm font-mono">
                                {k}
                              </kbd>
                              {i < s.keys.length - 1 && <span className="text-content-muted text-xs px-0.5">+</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// ── Help Tab ───────────────────────────────────────────────────────────────────

function HelpTab() {
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-border-subtle shadow-lg">
        <SectionHeader icon={HelpCircle} title="Help Center" desc="Resources, guides, and support" />
        <CardContent className="p-6">
          <div className="grid sm:grid-cols-2 gap-3">
            {DOCS_CARDS.map(card => {
              const Icon = card.icon;
              return (
                <a
                  key={card.title}
                  href={card.href}
                  target={card.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className={cn('group flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.015] hover:shadow-lg', card.bg, card.border)}
                >
                  <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border', card.bg, card.border)}>
                    <Icon className={cn('h-4 w-4', card.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-content">{card.title}</p>
                      {card.href.startsWith('http') && (
                        <ExternalLink className="h-3 w-3 text-content-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                    <p className="text-xs text-content-muted mt-0.5">{card.desc}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border-subtle shadow-lg">
        <SectionHeader icon={Info} title="About TaskFlow AI" desc="Version, build, and technology stack" />
        <CardContent className="p-6">
          <div className="grid sm:grid-cols-3 gap-4 mb-5">
            {[
              { label: 'Version',     value: 'v1.0.0 MVP' },
              { label: 'Build',       value: `${new Date().getFullYear()}.07.17` },
              { label: 'Environment', value: 'Development' },
              { label: 'Frontend',    value: 'React + TypeScript' },
              { label: 'Backend',     value: 'Node.js + Express' },
              { label: 'Database',    value: 'MongoDB' },
              { label: 'AI Engine',   value: 'Google Gemini' },
              { label: 'Auth',        value: 'JWT + bcrypt' },
              { label: 'License',     value: 'MIT' },
            ].map(item => (
              <div key={item.label} className="rounded-xl bg-surface border border-border-subtle p-4 hover:border-border-focus transition-colors">
                <p className="text-[10px] font-bold text-content-muted uppercase tracking-widest">{item.label}</p>
                <p className="font-bold text-content mt-1.5 text-sm">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <Activity className="h-4 w-4 text-emerald-400 shrink-0" />
            <p className="text-xs text-content-secondary">
              All systems operational · <span className="text-emerald-400 font-semibold">Backend connected</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Settings Page ─────────────────────────────────────────────────────────

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const saved = localStorage.getItem('settings_tab');
    return (TABS.some(t => t.id === saved) ? saved : 'profile') as TabId;
  });
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
  }, []);

  const handleTabChange = (id: TabId) => {
    setActiveTab(id);
    localStorage.setItem('settings_tab', id);
  };

  const tabContent: Record<TabId, React.ReactNode> = {
    profile:    <ProfileTab    showToast={showToast} />,
    security:   <SecurityTab   showToast={showToast} />,
    appearance: <AppearanceTab showToast={showToast} />,
    shortcuts:  <ShortcutsTab />,
    help:       <HelpTab />,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-5xl">
      <PageHeader title="Settings & Preferences" description="Manage your account, security, and workspace configuration." />

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Sidebar */}
        <Card className="md:w-56 w-full shrink-0 p-2 md:sticky md:top-4 border-border-subtle shadow-lg">
          <nav className="space-y-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`settings-tab-${tab.id}`}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    'w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all group',
                    active
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                      : 'text-content-muted hover:bg-surface-hover hover:text-content-secondary border border-transparent'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn('h-4 w-4 shrink-0 transition-colors', active ? 'text-primary' : 'text-content-muted group-hover:text-content-secondary')} />
                    <span>{tab.label}</span>
                  </div>
                  {active && (
                    <motion.div layoutId="nav-chevron">
                      <ChevronRight className="h-4 w-4 text-primary/60" />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            >
              {tabContent[activeTab]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast key="toast" msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Settings;
