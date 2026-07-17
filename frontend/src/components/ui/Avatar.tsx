import React from 'react';
import { cn } from '../../utils/cn';

interface AvatarProps {
  src?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
  xl: 'h-12 w-12 text-base',
};

export const Avatar: React.FC<AvatarProps> = ({ src, fallback, size = 'md', className }) => {
  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full border border-border-subtle bg-surface",
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt="Avatar"
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary font-semibold uppercase">
          {fallback.slice(0, 2)}
        </div>
      )}
    </div>
  );
};
