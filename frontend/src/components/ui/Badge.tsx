import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-surface text-content shadow-sm',
        secondary: 'border-transparent bg-surface-hover text-content-secondary',
        outline: 'text-content-secondary border-border-subtle',
        
        // Priority
        'priority-critical': 'border-danger/20 bg-danger/10 text-danger',
        'priority-high': 'border-amber-500/20 bg-amber-500/10 text-amber-500',
        'priority-medium': 'border-primary/20 bg-primary/10 text-primary',
        'priority-low': 'border-border-subtle bg-surface text-content-muted',
        
        // Status
        'status-todo': 'border-border-subtle bg-surface text-content-secondary',
        'status-inprogress': 'border-primary/20 bg-primary/10 text-primary',
        'status-done': 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

const dotColors: Record<string, string> = {
  'priority-critical': 'bg-red-500',
  'priority-high': 'bg-amber-500',
  'priority-medium': 'bg-blue-500',
  'priority-low': 'bg-content-muted',
  'status-todo': 'bg-content-secondary',
  'status-inprogress': 'bg-primary',
  'status-done': 'bg-emerald-500',
  'default': 'bg-content-secondary',
  'secondary': 'bg-content-muted',
  'outline': 'bg-content-muted',
};

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, dot, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props}>
        {dot && (
          <span
            className={cn("h-1.5 w-1.5 rounded-full shrink-0", variant ? dotColors[variant] : dotColors['default'])}
          />
        )}
        {children}
      </div>
    );
  }
);
Badge.displayName = 'Badge';

export const getPriorityVariant = (p: string) => {
  switch (p) {
    case 'Critical': return 'priority-critical';
    case 'High':     return 'priority-high';
    case 'Medium':   return 'priority-medium';
    default:         return 'priority-low';
  }
};

export const getStatusVariant = (s: string) => {
  if (s === 'Completed') return 'status-done';
  if (s === 'In Progress') return 'status-inprogress';
  return 'status-todo';
};

export default Badge;
