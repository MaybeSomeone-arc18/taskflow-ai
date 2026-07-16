import React from 'react';

type BadgeVariant = 'priority-low' | 'priority-medium' | 'priority-high' | 'priority-critical'
  | 'status-todo' | 'status-inprogress' | 'status-done'
  | 'default' | 'indigo' | 'emerald' | 'amber' | 'rose';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const styles: Record<BadgeVariant, string> = {
  'priority-critical': 'bg-red-500/10 text-red-400 border-red-500/25',
  'priority-high':     'bg-amber-500/10 text-amber-400 border-amber-500/25',
  'priority-medium':   'bg-blue-500/10 text-blue-400 border-blue-500/25',
  'priority-low':      'bg-zinc-800/70 text-zinc-400 border-zinc-700/80',
  'status-todo':       'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
  'status-inprogress': 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  'status-done':       'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  'default':           'bg-zinc-800/70 text-zinc-400 border-zinc-700/80',
  'indigo':            'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
  'emerald':           'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  'amber':             'bg-amber-500/10 text-amber-400 border-amber-500/25',
  'rose':              'bg-rose-500/10 text-rose-400 border-rose-500/25',
};

const dotColors: Record<BadgeVariant, string> = {
  'priority-critical': 'bg-red-400',
  'priority-high':     'bg-amber-400',
  'priority-medium':   'bg-blue-400',
  'priority-low':      'bg-zinc-400',
  'status-todo':       'bg-indigo-400',
  'status-inprogress': 'bg-amber-400',
  'status-done':       'bg-emerald-400',
  'default':           'bg-zinc-400',
  'indigo':            'bg-indigo-400',
  'emerald':           'bg-emerald-400',
  'amber':             'bg-amber-400',
  'rose':              'bg-rose-400',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className = '', dot }) => {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5',
        'text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap',
        styles[variant],
        className,
      ].join(' ')}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};

export const getPriorityVariant = (p: string): BadgeVariant => {
  switch (p) {
    case 'Critical': return 'priority-critical';
    case 'High':     return 'priority-high';
    case 'Medium':   return 'priority-medium';
    default:         return 'priority-low';
  }
};

export const getStatusVariant = (s: string): BadgeVariant => {
  if (s === 'Completed') return 'status-done';
  if (s === 'In Progress') return 'status-inprogress';
  return 'status-todo';
};

export default Badge;
