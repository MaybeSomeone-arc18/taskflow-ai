import React from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-900/40 border border-indigo-500/60',
  secondary:
    'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80',
  ghost:
    'bg-transparent hover:bg-zinc-800/70 text-zinc-400 hover:text-zinc-200 border border-transparent',
  danger:
    'bg-red-600/90 hover:bg-red-500 text-white border border-red-500/60 shadow-sm shadow-red-900/30',
  outline:
    'bg-transparent border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100',
};

const sizes: Record<Size, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1.5',
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-10 px-5 text-sm gap-2',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, iconRight, children, className = '', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150',
          'btn-press focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60',
          'disabled:opacity-50 disabled:pointer-events-none select-none',
          variants[variant],
          sizes[size],
          className,
        ].join(' ')}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children && <span>{children}</span>}
        {iconRight && !loading && <span className="shrink-0">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
