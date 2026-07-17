import React from 'react';
import { Card } from './Card';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  progress?: number;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, progress, className }) => {
  return (
    <Card className={cn("p-6 flex flex-col justify-between group hover:border-border-focus transition-colors duration-300", className)}>
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-medium text-content-secondary">{title}</p>
        {icon && (
          <div className="p-2 rounded-lg bg-surface-hover text-content-secondary group-hover:text-primary group-hover:bg-primary/10 transition-colors duration-300">
            {icon}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-bold text-content">{value}</h3>
        {trend && (
          <p className="text-xs mt-2 flex items-center gap-1.5 font-medium">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-1.5 py-0.5",
                trend.positive !== false
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-red-500/10 text-red-500"
              )}
            >
              {trend.positive !== false ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="text-content-muted">{trend.label}</span>
          </p>
        )}
        {progress !== undefined && (
          <div className="h-1.5 w-full bg-border-subtle rounded-full overflow-hidden mt-4">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-700" 
              style={{ width: `${Math.min(100, progress)}%` }} 
            />
          </div>
        )}
      </div>
    </Card>
  );
};
