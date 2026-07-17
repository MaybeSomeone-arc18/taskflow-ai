import React, { useEffect, useState } from 'react';
import { getProjects } from '../services/projectService';
import { Project } from '../types';
import AIPanel from '../components/AIPanel';
import {
  AlertCircle,
  Brain,
  CheckCircle2,
  FolderDot,
  ListTodo,
  Sparkles,
  Zap,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/LoadingSkeleton';
import { Card, CardContent } from '../components/ui/Card';
import { motion } from 'framer-motion';

const HOW_IT_WORKS = [
  {
    icon: CheckCircle2,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    title: 'Analyze Health',
    desc: 'Scans task priority loads and upcoming deadlines to score the project health.',
  },
  {
    icon: Zap,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    title: 'Sprint Summary',
    desc: 'Formulates achievements and lists critical paths for next sprint plans.',
  },
  {
    icon: ListTodo,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    title: 'Daily Plan',
    desc: 'Sequences active tasks chronologically based on priority and deadlines.',
  },
  {
    icon: Brain,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    title: 'Task Breakdown',
    desc: 'Generates actionable subtask checklists for any given task title.',
  },
];

export const AIPlanner: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true); setError(null);
      try {
        const fetched = await getProjects();
        const active = fetched.filter((p) => p.status === 'Active');
        setProjects(active);
        if (active.length > 0) setSelectedProjectId(active[0]._id);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 h-full flex flex-col">
        <Skeleton className="h-20 w-[400px]" />
        <div className="grid md:grid-cols-3 gap-6 flex-1">
          <Skeleton className="h-full rounded-2xl" />
          <div className="md:col-span-2">
            <Skeleton className="h-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load projects"
        description={error}
        action={{ label: "Try Again", onClick: () => window.location.reload() }}
      />
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 h-full flex flex-col"
    >
      {/* Header */}
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-500" />
            AI Copilot Workspace
          </span>
        }
        description="Gemini-powered insights, sprint summaries, and intelligent task breakdown."
        actions={
          projects.length > 0 && (
            <div className="flex items-center gap-3 bg-surface p-1.5 rounded-xl border border-border-subtle">
              <span className="text-[10px] font-bold text-content-muted uppercase tracking-widest pl-2">Scope</span>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-surface-hover border-none rounded-lg px-3 py-1.5 text-sm font-medium text-content focus:ring-2 focus:ring-primary/50 outline-none cursor-pointer"
              >
                {projects.map((proj) => (
                  <option key={proj._id} value={proj._id}>{proj.title}</option>
                ))}
              </select>
            </div>
          )
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderDot}
          title="No active projects found"
          description="Create at least one project to unlock all AI Copilot features including health analysis and daily plans."
          action={{ label: "Go to Dashboard", onClick: () => window.location.href = '/' }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-3 flex-1 min-h-0 items-start">
          {/* How it works panel */}
          <div className="md:col-span-1 flex flex-col gap-6 sticky top-0">
            <Card className="overflow-hidden border-border-subtle shadow-lg">
              <div className="flex items-center gap-2.5 p-5 border-b border-border-subtle bg-surface/50">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-content">AI Capabilities</h3>
                  <p className="text-[11px] text-content-muted font-medium">How Copilot helps you build</p>
                </div>
              </div>
              
              <CardContent className="p-0">
                <div className="divide-y divide-border-subtle">
                  {HOW_IT_WORKS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="flex items-start gap-4 p-5 hover:bg-surface-hover/30 transition-colors group">
                        <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110 ${item.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1 mt-0.5">
                          <p className="text-sm font-bold text-content group-hover:text-content-secondary transition-colors">{item.title}</p>
                          <p className="text-xs text-content-muted leading-relaxed group-hover:text-content-secondary transition-colors">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Active Project Indicator */}
            {selectedProjectId && (
              <Card className="border-border-subtle shadow-md overflow-hidden group hover:border-border-focus transition-colors">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-surface flex items-center justify-center border border-border-subtle group-hover:border-border-focus transition-colors">
                    <FolderDot className="h-6 w-6 text-content-muted" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <p className="text-[10px] font-bold text-content-muted uppercase tracking-widest">Currently Analyzing</p>
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-2.5 w-2.5 rounded shadow-sm"
                        style={{ backgroundColor: projects.find((p) => p._id === selectedProjectId)?.color }}
                      />
                      <p className="text-sm font-bold text-content truncate group-hover:text-content-secondary transition-colors">
                        {projects.find((p) => p._id === selectedProjectId)?.title}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* AI Panel */}
          <div className="md:col-span-2 h-[calc(100vh-140px)] min-h-[600px]">
            {selectedProjectId && <AIPanel projectId={selectedProjectId} />}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AIPlanner;
