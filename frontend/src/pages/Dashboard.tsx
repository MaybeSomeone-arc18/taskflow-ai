import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../services/projectService';
import { getDashboardStats, DashboardStats } from '../services/analyticsService';
import { createTask } from '../services/taskService';
import { Project } from '../types';
import {
  AlertCircle,
  Archive,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  FolderDot,
  History,
  ListTodo,
  Loader2,
  Plus,
  Sparkles,
  TrendingUp,
  X,
  PlusCircle,
  Folder,
  ArrowRight,
  Activity,
  Zap,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const PRESETS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
];

const FIELD = 'w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all';
const LABEL = 'text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-1.5';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'default' | 'emerald' | 'amber' | 'red' | 'indigo';
  sub?: string;
  progress?: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color = 'default', sub, progress }) => {
  const valueColor = {
    default: 'text-zinc-100',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    indigo: 'text-indigo-400',
  }[color];

  return (
    <div className="group rounded-2xl border border-zinc-800/80 bg-zinc-900 p-5 hover:border-zinc-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
        <div className="text-zinc-600 group-hover:text-zinc-400 transition-colors">{icon}</div>
      </div>
      <div>
        <div className={`text-2xl font-bold tracking-tight ${valueColor}`}>{value}</div>
        {sub && <p className="text-xs text-zinc-600 mt-0.5">{sub}</p>}
      </div>
      {progress !== undefined && (
        <div className="space-y-1.5">
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);

  const [isCreateProjOpen, setIsCreateProjOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isEditProjOpen, setIsEditProjOpen] = useState(false);
  const [isDeleteProjOpen, setIsDeleteProjOpen] = useState(false);
  const [selectedProj, setSelectedProj] = useState<Project | null>(null);

  const [projTitle, setProjTitle] = useState('');
  const [projDescription, setProjDescription] = useState('');
  const [projColor, setProjColor] = useState(PRESETS[0].value);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskEstHours, setTaskEstHours] = useState(0);
  const [taskTargetProj, setTaskTargetProj] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const dashboardStats = await getDashboardStats();
      const userProjects = await getProjects();
      setStats(dashboardStats);
      setProjects(userProjects);
      if (userProjects.length > 0) {
        setTaskTargetProj(userProjects[0]._id);
      }
    } catch (err) {
      setStatsError((err as Error).message);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const created = await createProject({ title: projTitle.trim(), description: projDescription.trim(), color: projColor });
      setProjects((prev) => [created, ...prev]);
      setIsCreateProjOpen(false);
      setProjTitle(''); setProjDescription(''); setProjColor(PRESETS[0].value);
      const refreshedStats = await getDashboardStats();
      setStats(refreshedStats);
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskTargetProj) return;
    if (taskDueDate) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (new Date(taskDueDate) < today) { setActionError('Due date cannot be before today'); return; }
    }
    setActionLoading(true); setActionError(null);
    try {
      await createTask({ title: taskTitle.trim(), description: taskDescription.trim(), priority: taskPriority, dueDate: taskDueDate ? new Date(taskDueDate) as any : undefined, estimatedHours: taskEstHours, projectId: taskTargetProj, status: 'Todo' });
      setIsCreateTaskOpen(false);
      setTaskTitle(''); setTaskDescription(''); setTaskPriority('Medium'); setTaskDueDate(''); setTaskEstHours(0);
      const refreshedStats = await getDashboardStats();
      setStats(refreshedStats);
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditProjInit = (proj: Project) => {
    setSelectedProj(proj); setProjTitle(proj.title); setProjDescription(proj.description); setProjColor(proj.color);
    setIsEditProjOpen(true);
  };

  const handleUpdateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProj || !projTitle.trim()) return;
    setActionLoading(true); setActionError(null);
    try {
      const updated = await updateProject(selectedProj._id, { title: projTitle.trim(), description: projDescription.trim(), color: projColor });
      setProjects((prev) => prev.map((p) => (p._id === selectedProj._id ? updated : p)));
      setIsEditProjOpen(false); setSelectedProj(null); setProjTitle(''); setProjDescription('');
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProjInit = (proj: Project) => { setSelectedProj(proj); setIsDeleteProjOpen(true); };

  const handleArchiveProject = async () => {
    if (!selectedProj) return;
    setActionLoading(true); setActionError(null);
    try {
      await deleteProject(selectedProj._id);
      setProjects((prev) => prev.map((p) => (p._id === selectedProj._id ? { ...p, status: 'Archived' } : p)));
      setIsDeleteProjOpen(false); setSelectedProj(null);
      const refreshedStats = await getDashboardStats();
      setStats(refreshedStats);
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  if (statsLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Skeleton header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton h-7 w-48 rounded-lg" />
            <div className="skeleton h-4 w-64 rounded-md" />
          </div>
          <div className="skeleton h-9 w-32 rounded-xl" />
        </div>
        {/* Skeleton stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 skeleton h-64 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (statsError || !stats) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/8 p-5 text-sm text-red-400 max-w-lg mx-auto my-12">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span>Error loading dashboard: {statsError || 'Invalid response.'}</span>
      </div>
    );
  }

  const activeProjectsList = projects.filter((p) => p.status === 'Active');
  const firstName = user?.fullName?.split(' ')[0] || 'there';
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });

  // ── Modal field shared components ──
  const ProjectFormFields = () => (
    <div className="space-y-4">
      {actionError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" /> {actionError}
        </div>
      )}
      <div>
        <label className={LABEL}>Project Title</label>
        <input type="text" required value={projTitle} onChange={(e) => setProjTitle(e.target.value)} placeholder="e.g. Capstone App" className={FIELD} />
      </div>
      <div>
        <label className={LABEL}>Description</label>
        <textarea value={projDescription} onChange={(e) => setProjDescription(e.target.value)} placeholder="What are the main goals of this project?" rows={3} className={`${FIELD} resize-none`} />
      </div>
      <div>
        <label className={LABEL}>Theme Color</label>
        <div className="flex gap-2.5 mt-1">
          {PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setProjColor(preset.value)}
              style={{ backgroundColor: preset.value }}
              className={`h-7 w-7 rounded-full border-2 transition-all hover:scale-110 ${projColor === preset.value ? 'border-white scale-110 ring-2 ring-white/30' : 'border-transparent opacity-70'}`}
              title={preset.name}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ═══ PAGE HEADER ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Good day, <span className="text-indigo-400">{firstName}</span> 👋
          </h1>
          <p className="text-sm text-zinc-500 mt-1">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => setIsCreateProjOpen(true)}
          >
            New Project
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<PlusCircle className="h-3.5 w-3.5" />}
            onClick={() => setIsCreateTaskOpen(true)}
            disabled={projects.length === 0}
          >
            New Task
          </Button>
        </div>
      </div>

      {/* ═══ KPI STAT CARDS ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Projects" value={stats.totalProjects} sub="Active workspaces" icon={<FolderDot className="h-4 w-4" />} />
        <StatCard label="Total Tasks" value={stats.totalTasks} sub="All combined" icon={<ListTodo className="h-4 w-4" />} />
        <StatCard label="Completed" value={stats.completedTasks} sub="Closed milestones" icon={<CheckCircle2 className="h-4 w-4" />} color="emerald" />
        <StatCard label="Pending" value={stats.pendingTasks} sub="Active in-progress" icon={<Clock className="h-4 w-4" />} color="amber" />
        <StatCard label="Overdue" value={stats.overdueTasks} sub="Missed deadlines" icon={<AlertCircle className="h-4 w-4" />} color="red" />
        <StatCard
          label="Done Rate"
          value={`${stats.completionPercentage}%`}
          sub="Completion efficiency"
          icon={<TrendingUp className="h-4 w-4" />}
          color="indigo"
          progress={stats.completionPercentage}
        />
      </div>

      {/* ═══ MAIN CONTENT GRID ═══ */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Projects List (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300">Active Projects</h2>
            <span className="text-xs text-zinc-600">{activeProjectsList.length} projects</span>
          </div>

          {activeProjectsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-16 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30 space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-zinc-800/60 flex items-center justify-center">
                <Folder className="h-6 w-6 text-zinc-600" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-zinc-300">No active projects yet</h3>
                <p className="text-xs text-zinc-600 max-w-xs">
                  Create your first project to start organizing tasks, tracking progress, and running AI analysis.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => setIsCreateProjOpen(true)}
              >
                Create Project
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {activeProjectsList.map((proj) => (
                <div
                  key={proj._id}
                  onClick={() => navigate(`/projects/${proj._id}`)}
                  className="group relative rounded-2xl border border-zinc-800/80 bg-zinc-900 p-5 hover:border-zinc-700 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 flex flex-col gap-3 overflow-hidden"
                >
                  {/* Color accent top bar */}
                  <div className="absolute top-0 inset-x-0 h-0.5" style={{ backgroundColor: proj.color }} />

                  <div className="flex items-start justify-between gap-3 pt-0.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-2 w-2 rounded-sm shrink-0 mt-0.5" style={{ backgroundColor: proj.color }} />
                      <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white truncate">
                        {proj.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditProjInit(proj); }}
                        className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteProjInit(proj); }}
                        className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-red-500/15 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Archive"
                      >
                        <Archive className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 flex-1">
                    {proj.description || 'No description provided.'}
                  </p>

                  <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800/60">
                    <span className="text-[11px] text-zinc-600">
                      {new Date(proj.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Active</span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400 ml-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: quick actions + widgets */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900 p-5 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'New Project', icon: <Plus className="h-3.5 w-3.5 text-indigo-400" />, onClick: () => setIsCreateProjOpen(true) },
                { label: 'New Task', icon: <PlusCircle className="h-3.5 w-3.5 text-indigo-400" />, onClick: () => setIsCreateTaskOpen(true), disabled: projects.length === 0 },
                { label: 'Analytics', icon: <BarChart3 className="h-3.5 w-3.5 text-indigo-400" />, onClick: () => navigate('/analytics') },
                { label: 'AI Suite', icon: <Sparkles className="h-3.5 w-3.5 text-indigo-400" />, onClick: () => navigate('/ai-planner') },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800 hover:border-zinc-700 py-2.5 px-3 text-xs font-medium text-zinc-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due Today */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Due Today</h3>
              <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-800 border border-zinc-700/60 px-2 py-0.5 rounded-full">
                {stats.todayTasks.length}
              </span>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto kanban-scroll">
              {stats.todayTasks.length === 0 ? (
                <div className="flex flex-col items-center py-6 gap-2">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500/40" />
                  <p className="text-xs text-zinc-600">All clear for today!</p>
                </div>
              ) : (
                stats.todayTasks.map((t) => (
                  <div
                    key={t._id}
                    onClick={() => navigate(`/projects/${t.projectId}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors gap-2"
                  >
                    <span className="text-xs font-medium text-zinc-300 truncate">{t.title}</span>
                    <span className="text-[10px] font-medium text-indigo-400 shrink-0">{t.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Upcoming Deadlines</h3>
              <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-800 border border-zinc-700/60 px-2 py-0.5 rounded-full">
                {stats.upcomingDeadlines.length}
              </span>
            </div>
            <div className="space-y-2 max-h-44 overflow-y-auto kanban-scroll">
              {stats.upcomingDeadlines.length === 0 ? (
                <p className="text-xs text-zinc-600 text-center py-5">No upcoming deadlines.</p>
              ) : (
                stats.upcomingDeadlines.map((t) => (
                  <div
                    key={t._id}
                    onClick={() => navigate(`/projects/${t.projectId._id}`)}
                    className="p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-zinc-300 truncate">{t.title}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 shrink-0">
                        <Calendar className="h-2.5 w-2.5" />
                        {new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                      <span className="h-1.5 w-1.5 rounded-sm" style={{ backgroundColor: t.projectId?.color }} />
                      <span>{t.projectId?.title}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <History className="h-3.5 w-3.5 text-zinc-600" />
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Recent Activity</h3>
            </div>
            <div className="space-y-3 max-h-52 overflow-y-auto kanban-scroll">
              {stats.recentActivity.length === 0 ? (
                <p className="text-xs text-zinc-600 text-center py-4">No recent activity logs.</p>
              ) : (
                stats.recentActivity.map((log, idx) => (
                  <div key={log._id || idx} className="flex items-start gap-2.5 text-xs">
                    <div className="flex flex-col items-center shrink-0 mt-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                      {idx < stats.recentActivity.length - 1 && <div className="w-px flex-1 bg-zinc-800 mt-1 min-h-[20px]" />}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-zinc-400 leading-snug">
                        <strong className="text-zinc-200 font-semibold">{log.userId?.fullName || 'User'}</strong>{' '}
                        {log.action.toLowerCase()}
                      </p>
                      <p className="text-zinc-600 text-[10px] truncate">{log.details}</p>
                      <p className="text-zinc-700 text-[10px]">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MODALS ═══ */}
      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateProjOpen}
        onClose={() => setIsCreateProjOpen(false)}
        title="Create Project"
        subtitle="Set up a new workspace to organize tasks and sprints."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsCreateProjOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={actionLoading} onClick={handleCreateProjectSubmit as any} type="submit">
              Create Project
            </Button>
          </div>
        }
      >
        <form id="create-proj-form" onSubmit={handleCreateProjectSubmit}>
          <ProjectFormFields />
        </form>
      </Modal>

      {/* Edit Project Modal */}
      <Modal
        isOpen={isEditProjOpen}
        onClose={() => { setIsEditProjOpen(false); setSelectedProj(null); }}
        title="Edit Project"
        subtitle={`Editing: ${selectedProj?.title}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setIsEditProjOpen(false); setSelectedProj(null); }}>Cancel</Button>
            <Button variant="primary" size="sm" loading={actionLoading} onClick={handleUpdateProjectSubmit as any}>
              Save Changes
            </Button>
          </div>
        }
      >
        <form onSubmit={handleUpdateProjectSubmit}>
          <ProjectFormFields />
        </form>
      </Modal>

      {/* Archive Project Modal */}
      <Modal
        isOpen={isDeleteProjOpen}
        onClose={() => { setIsDeleteProjOpen(false); setSelectedProj(null); }}
        title="Archive Project"
        maxWidth="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" disabled={actionLoading} onClick={() => { setIsDeleteProjOpen(false); setSelectedProj(null); }}>Cancel</Button>
            <Button variant="danger" size="sm" loading={actionLoading} onClick={handleArchiveProject}>Archive</Button>
          </div>
        }
      >
        <div className="space-y-3">
          {actionError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" /> {actionError}
            </div>
          )}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <Archive className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-zinc-400">
              Archive <strong className="text-zinc-200">"{selectedProj?.title}"</strong>? This will remove it from active dashboards but preserve all data.
            </p>
          </div>
        </div>
      </Modal>

      {/* Quick Create Task Modal */}
      <Modal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        title="Quick Create Task"
        subtitle="Add a task to any active project instantly."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsCreateTaskOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={actionLoading} onClick={handleCreateTaskSubmit as any}>
              Create Task
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateTaskSubmit} className="space-y-4">
          {actionError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" /> {actionError}
            </div>
          )}
          <div>
            <label className={LABEL}>Target Project</label>
            <select required value={taskTargetProj} onChange={(e) => setTaskTargetProj(e.target.value)} className={FIELD}>
              {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL}>Task Title</label>
            <input type="text" required value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="e.g. Write unit tests" className={FIELD} />
          </div>
          <div>
            <label className={LABEL}>Description</label>
            <textarea value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} placeholder="Summarize requirements..." rows={2} className={`${FIELD} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Priority</label>
              <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value as any)} className={FIELD}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Est. Hours</label>
              <input type="number" min={0} value={taskEstHours} onChange={(e) => setTaskEstHours(parseFloat(e.target.value) || 0)} className={FIELD} />
            </div>
          </div>
          <div>
            <label className={LABEL}>Due Date</label>
            <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} className={FIELD} />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
