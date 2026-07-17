import React from 'react';
import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-focus disabled:pointer-events-none disabled:opacity-50 select-none btn-press',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-content-inverse shadow-sm hover:bg-primary-hover border border-primary/30',
        secondary: 'bg-surface backdrop-blur-md text-content shadow-sm hover:bg-surface-hover border border-border-subtle',
        danger: 'bg-danger text-content-inverse shadow-sm hover:bg-danger-hover border border-danger/30',
        outline: 'border border-border-subtle bg-transparent shadow-sm hover:bg-surface-hover text-content-secondary hover:text-content',
        ghost: 'hover:bg-surface-hover hover:text-content text-content-secondary',
        link: 'text-content underline-offset-4 hover:underline',
      },
      size: {
        xs: 'h-7 rounded-lg px-2 text-xs',
        sm: 'h-8 rounded-lg px-3 text-xs',
        md: 'h-9 px-4 py-2',
        lg: 'h-10 rounded-xl px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, icon, iconRight, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />
        ) : icon ? (
          <span className="shrink-0 mr-2">{icon}</span>
        ) : null}
        {children}
        {iconRight && !loading && <span className="shrink-0 ml-2">{iconRight}</span>}
      </button>
    );
  }
);
Button.displayName = 'Button';
export default Button;
