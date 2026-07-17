import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Activity } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-background p-6">
      <div className="flex flex-col items-center text-center max-w-sm space-y-6 animate-fade-in">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
          <Activity className="h-5 w-5 text-content-inverse" />
        </div>

        {/* 404 display */}
        <div className="space-y-2">
          <div className="text-8xl font-black tracking-tighter text-content-muted">
            404
          </div>
          <h1 className="text-xl font-bold text-content">Page not found</h1>
          <p className="text-sm text-content-secondary leading-relaxed">
            This page doesn't exist or was moved. Head back to your workspace to continue.
          </p>
        </div>

        {/* CTA */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-5 py-2.5 text-sm font-semibold text-content-inverse transition-all shadow-md shadow-primary/30"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
