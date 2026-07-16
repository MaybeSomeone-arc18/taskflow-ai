import React from 'react';
import { Activity } from 'lucide-react';

const Loading: React.FC = () => {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-900/50">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <div className="h-5 w-5 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
      </div>
    </div>
  );
};

export default Loading;
