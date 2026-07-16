import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorProps {
  message?: string;
  onRetry?: () => void;
}

export const Error: React.FC<ErrorProps> = ({ message = 'An unexpected error occurred', onRetry }) => {
  return (
    <div className="flex h-full w-full min-h-[200px] flex-col items-center justify-center p-6 border border-destructive/20 bg-destructive/5 rounded-xl space-y-4">
      <div className="flex items-center space-x-2 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <span className="text-sm font-semibold">System Alert</span>
      </div>
      <p className="text-xs text-muted-foreground text-center max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-destructive px-4 py-1.5 text-xs font-semibold text-white hover:bg-destructive/90 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default Error;
