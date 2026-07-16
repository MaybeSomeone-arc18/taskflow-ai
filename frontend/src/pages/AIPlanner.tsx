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
  Loader2,
  Sparkles,
  Zap,
} from 'lucide-react';

const HOW_IT_WORKS = [
  {
    icon: CheckCircle2,
    color: 'text-emerald-400 bg-emerald-500/10',
    title: 'Analyze Health',
    desc: 'Scans task priority loads and upcoming deadlines to score the project health.',
  },
  {
    icon: Zap,
    color: 'text-amber-400 bg-amber-500/10',
    title: 'Sprint Summary',
    desc: 'Formulates achievements and lists critical paths for next sprint plans.',
  },
  {
    icon: ListTodo,
    color: 'text-blue-400 bg-blue-500/10',
    title: 'Daily Plan',
    desc: 'Sequences active tasks chronologically based on priority and deadlines.',
  },
  {
    icon: Brain,
    color: 'text-indigo-400 bg-indigo-500/10',
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
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-8 w-56 rounded-lg" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="skeleton h-96 rounded-2xl" />
          <div className="md:col-span-2 skeleton h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/8 p-5 text-sm text-red-400 max-w-lg mx-auto my-12">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span>Error loading projects: {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-500" />
            AI Copilot Workspace
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Gemini-powered insights, sprint summaries, and intelligent task breakdown.
          </p>
        </div>

        {projects.length > 0 && (
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Project Scope</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm font-medium text-zinc-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              {projects.map((proj) => (
                <option key={proj._id} value={proj._id}>{proj.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-16 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30 max-w-lg mx-auto space-y-5 my-8">
          <div className="h-16 w-16 rounded-2xl bg-zinc-800/60 flex items-center justify-center">
            <FolderDot className="h-7 w-7 text-zinc-600" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-zinc-300">No active projects found</h3>
            <p className="text-xs text-zinc-600 max-w-xs leading-relaxed">
              Create at least one project to unlock all AI Copilot features including health analysis and daily plans.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {/* How it works panel */}
          <div className="md:col-span-1 space-y-4">
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900 overflow-hidden">
              <div className="flex items-center gap-2 p-4 border-b border-zinc-800/60">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-semibold text-zinc-200">How it works</span>
              </div>
              <div className="p-4 space-y-4">
                {HOW_IT_WORKS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className={`h-7 w-7 shrink-0 rounded-lg flex items-center justify-center ${item.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-200">{item.title}</p>
                        <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Project indicator */}
              <div className="border-t border-zinc-800/60 p-4">
                <div className="rounded-xl bg-zinc-800/50 border border-zinc-800 p-3 space-y-1.5">
                  <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Active Scope</p>
                  {projects.find((p) => p._id === selectedProjectId) && (
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-sm shrink-0"
                        style={{ backgroundColor: projects.find((p) => p._id === selectedProjectId)?.color }}
                      />
                      <p className="text-sm font-semibold text-zinc-200 truncate">
                        {projects.find((p) => p._id === selectedProjectId)?.title}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI Panel */}
          <div className="md:col-span-2">
            {selectedProjectId && <AIPanel projectId={selectedProjectId} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPlanner;
