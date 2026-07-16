import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Activity } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-zinc-950 p-6">
      <div className="flex flex-col items-center text-center max-w-sm space-y-6 animate-fade-in">
        {/* Logo */}
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-900/50">
          <Activity className="h-5 w-5 text-white" />
        </div>

        {/* 404 display */}
        <div className="space-y-2">
          <div className="text-8xl font-black tracking-tighter bg-gradient-to-br from-zinc-600 via-zinc-500 to-zinc-700 bg-clip-text text-transparent">
            404
          </div>
          <h1 className="text-xl font-bold text-zinc-100">Page not found</h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            This page doesn't exist or was moved. Head back to your workspace to continue.
          </p>
        </div>

        {/* CTA */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-all shadow-md shadow-indigo-900/30"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
