import React from 'react';
import { cn } from '../../utils/cn';
import { Button } from './Button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action, className }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-border-subtle rounded-2xl bg-surface/50", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-content-secondary mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-content">{title}</h3>
      <p className="mt-1 text-sm text-content-muted max-w-sm mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} variant="secondary">
          {action.label}
        </Button>
      )}
    </div>
  );
};
