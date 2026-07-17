import React from 'react';
import { Activity } from 'lucide-react';

const Loading: React.FC = () => {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
          <Activity className="h-5 w-5 text-content-inverse" />
        </div>
        <div className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    </div>
  );
};

export default Loading;
