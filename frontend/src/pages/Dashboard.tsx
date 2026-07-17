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
import { eventBus } from '../utils/eventBus';
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
  Plus,
  Sparkles,
  TrendingUp,
  PlusCircle,
  Folder,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { StatCard } from '../components/ui/StatCard';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionHeader } from '../components/ui/SectionHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/LoadingSkeleton';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';

const PRESETS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
];

const LABEL = 'text-xs font-semibold text-content-muted uppercase tracking-widest block mb-1.5';
const SELECT = 'flex h-11 w-full rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm text-content placeholder:text-content-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200';
const TEXTAREA = 'flex w-full rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm text-content placeholder:text-content-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none';

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

  useEffect(() => { 
    fetchDashboardData();
    const unsub = eventBus.on('refresh_dashboard', fetchDashboardData);
    return () => unsub();
  }, []);

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const created = await createProject({ title: projTitle.trim(), description: projDescription.trim(), color: projColor });
      setProjects((prev) => [created, ...prev]);
      eventBus.emit('new_notification', {
        title: 'Project Created',
        message: `Project "${created.title}" was successfully created.`,
        type: 'project'
      });
      eventBus.emit('refresh_analytics');
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
      const createdTask = await createTask({ title: taskTitle.trim(), description: taskDescription.trim(), priority: taskPriority, dueDate: taskDueDate ? new Date(taskDueDate) as any : undefined, estimatedHours: taskEstHours, projectId: taskTargetProj, status: 'Todo' });
      eventBus.emit('new_notification', {
        title: 'Task Created',
        message: `Task "${createdTask.title}" was successfully added.`,
        type: 'task'
      });
      eventBus.emit('refresh_analytics');
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
      eventBus.emit('new_notification', {
        title: 'Project Updated',
        message: `Project "${updated.title}" was successfully updated.`,
        type: 'project'
      });
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
      eventBus.emit('new_notification', {
        title: 'Project Archived',
        message: `Project "${selectedProj.title}" was archived.`,
        type: 'project'
      });
      eventBus.emit('refresh_analytics');
      setIsDeleteProjOpen(false); setSelectedProj(null);
      const refreshedStats = await getDashboardStats();
      setStats(refreshedStats);
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const activeProjectsList = projects.filter((p) => p.status === 'Active');
  const firstName = user?.fullName?.split(' ')[0] || 'there';
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });

  // ── Modal field shared components ──
  const renderProjectFormFields = () => (
    <div className="space-y-4">
      {actionError && (
        <div className="flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" /> {actionError}
        </div>
      )}
      <div>
        <label className={LABEL}>Project Title</label>
        <Input required value={projTitle} onChange={(e) => setProjTitle(e.target.value)} placeholder="e.g. NextGen API" />
      </div>
      <div>
        <label className={LABEL}>Description</label>
        <textarea value={projDescription} onChange={(e) => setProjDescription(e.target.value)} placeholder="What are the main goals of this project?" rows={3} className={TEXTAREA} />
      </div>
      <div>
        <label className={LABEL}>Theme Color</label>
        <div className="flex gap-3 mt-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setProjColor(preset.value)}
              style={{ backgroundColor: preset.value }}
              className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-110 ${projColor === preset.value ? 'border-content-inverse scale-110 ring-2 ring-content-inverse/20' : 'border-transparent opacity-70'}`}
              title={preset.name}
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (statsLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-2xl" />
          ))}
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="lg:col-span-2 h-[400px] rounded-2xl" />
          <Skeleton className="h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (statsError || !stats) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load dashboard"
        description={statsError || 'An unexpected error occurred while loading your data.'}
        action={{ label: 'Try Again', onClick: fetchDashboardData }}
      />
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* ═══ PAGE HEADER ═══ */}
      <PageHeader 
        title={`Good day, ${firstName} 👋`}
        description={today}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setIsCreateProjOpen(true)}
            >
              New Project
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<PlusCircle className="h-4 w-4" />}
              onClick={() => setIsCreateTaskOpen(true)}
              disabled={projects.length === 0}
            >
              New Task
            </Button>
          </>
        }
      />

      {/* ═══ KPI STAT CARDS ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Projects" value={stats.totalProjects} icon={<FolderDot className="h-5 w-5" />} />
        <StatCard title="Total Tasks" value={stats.totalTasks} icon={<ListTodo className="h-5 w-5" />} />
        <StatCard title="Completed" value={stats.completedTasks} icon={<CheckCircle2 className="h-5 w-5" />} trend={{ value: 12, label: 'vs last week' }} />
        <StatCard title="Pending" value={stats.pendingTasks} icon={<Clock className="h-5 w-5" />} />
        <StatCard title="Overdue" value={stats.overdueTasks} icon={<AlertCircle className="h-5 w-5 text-red-500" />} />
        <StatCard
          title="Done Rate"
          value={`${stats.completionPercentage}%`}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* ═══ MAIN CONTENT GRID ═══ */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Projects List (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <SectionHeader 
            title="Active Projects" 
            description={`${activeProjectsList.length} total projects tracking your team's work.`}
          />

          {activeProjectsList.length === 0 ? (
            <EmptyState
              icon={Folder}
              title="No active projects yet"
              description="Create your first project to start organizing tasks, tracking progress, and running AI analysis."
              action={{ label: 'Create Project', onClick: () => setIsCreateProjOpen(true) }}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <AnimatePresence>
                {activeProjectsList.map((proj, idx) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -15 }}
                    transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    key={proj._id}
                    onClick={() => navigate(`/projects/${proj._id}`)}
                    className="group relative rounded-[20px] border border-border-subtle bg-card p-6 backdrop-blur-[18px] hover:border-border-focus cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-black/40 flex flex-col gap-4 overflow-hidden apple-hover"
                  >
                    <div className="absolute top-0 inset-x-0 h-1" style={{ backgroundColor: proj.color }} />

                    <div className="flex items-start justify-between gap-3 pt-1">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border border-border-subtle" style={{ backgroundColor: `${proj.color}15` }}>
                          <Folder className="h-5 w-5" style={{ color: proj.color }} />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-content group-hover:text-content-secondary truncate">
                            {proj.title}
                          </h3>
                          <span className="text-[11px] text-content-muted">
                            Updated {new Date(proj.updatedAt || proj.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditProjInit(proj); }}
                          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-surface-hover text-content-muted hover:text-content transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteProjInit(proj); }}
                          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-danger/15 text-content-muted hover:text-danger transition-colors"
                          title="Archive"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-content-secondary leading-relaxed line-clamp-2 flex-1">
                      {proj.description || 'No description provided.'}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right column: quick actions + widgets */}
        <div className="space-y-6">
          
          <Card>
            <CardHeader className="pb-3 border-b border-border-subtle">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'New Project', icon: <Plus className="h-4 w-4 text-primary" />, onClick: () => setIsCreateProjOpen(true) },
                  { label: 'New Task', icon: <PlusCircle className="h-4 w-4 text-primary" />, onClick: () => setIsCreateTaskOpen(true), disabled: projects.length === 0 },
                  { label: 'Analytics', icon: <BarChart3 className="h-4 w-4 text-primary" />, onClick: () => navigate('/analytics') },
                  { label: 'AI Planner', icon: <Sparkles className="h-4 w-4 text-primary" />, onClick: () => navigate('/ai-planner') },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface hover:bg-surface-hover hover:border-border-focus py-4 px-2 text-xs font-medium text-content-secondary transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
                  >
                    <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      {action.icon}
                    </div>
                    {action.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Due Today */}
          <Card>
            <CardHeader className="pb-3 border-b border-border-subtle">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Due Today</CardTitle>
                <span className="text-[10px] font-semibold text-content-muted bg-surface-hover px-2 py-0.5 rounded-full">
                  {stats.todayTasks.length}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {stats.todayTasks.length === 0 ? (
                  <div className="flex flex-col items-center py-6 gap-2">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500/20" />
                    <p className="text-xs text-content-muted font-medium">All clear for today!</p>
                  </div>
                ) : (
                  stats.todayTasks.map((t) => (
                    <div
                      key={t._id}
                      onClick={() => navigate(`/projects/${t.projectId}`)}
                      className="group flex flex-col p-3 rounded-xl bg-surface border border-border-subtle hover:border-border-focus cursor-pointer transition-colors gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-content group-hover:text-primary transition-colors line-clamp-1">{t.title}</span>
                        <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">{t.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-content-muted" />
                <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                {stats.recentActivity.length === 0 ? (
                  <p className="text-xs text-content-muted text-center py-4">No recent activity logs.</p>
                ) : (
                  stats.recentActivity.map((log, idx) => (
                    <div key={log._id || idx} className="flex items-start gap-3 text-sm">
                      <div className="flex flex-col items-center shrink-0 mt-1">
                        <div className="h-2 w-2 rounded-full bg-primary shrink-0 ring-4 ring-surface" />
                        {idx < stats.recentActivity.length - 1 && <div className="w-px flex-1 bg-border-subtle mt-1 min-h-[24px]" />}
                      </div>
                      <div className="min-w-0 space-y-1 pb-1">
                        <p className="text-content-muted text-xs">
                          <strong className="text-content font-medium">{log.userId?.fullName || 'User'}</strong>{' '}
                          {log.action.toLowerCase()}
                        </p>
                        <p className="text-content-secondary text-xs truncate bg-surface px-2 py-1 rounded inline-block max-w-full">
                          {log.details}
                        </p>
                        <p className="text-content-muted text-[10px] font-medium">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ═══ MODALS ═══ */}
      <Modal
        isOpen={isCreateProjOpen}
        onClose={() => setIsCreateProjOpen(false)}
        title="Create Project"
        subtitle="Set up a new workspace to organize tasks and sprints."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsCreateProjOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={actionLoading} onClick={handleCreateProjectSubmit as any}>Create Project</Button>
          </div>
        }
      >
        <form onSubmit={handleCreateProjectSubmit}>{renderProjectFormFields()}</form>
      </Modal>

      <Modal
        isOpen={isEditProjOpen}
        onClose={() => { setIsEditProjOpen(false); setSelectedProj(null); }}
        title="Edit Project"
        subtitle={`Editing: ${selectedProj?.title}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => { setIsEditProjOpen(false); setSelectedProj(null); }}>Cancel</Button>
            <Button variant="primary" loading={actionLoading} onClick={handleUpdateProjectSubmit as any}>Save Changes</Button>
          </div>
        }
      >
        <form onSubmit={handleUpdateProjectSubmit}>{renderProjectFormFields()}</form>
      </Modal>

      <Modal
        isOpen={isDeleteProjOpen}
        onClose={() => { setIsDeleteProjOpen(false); setSelectedProj(null); }}
        title="Archive Project"
        maxWidth="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" disabled={actionLoading} onClick={() => { setIsDeleteProjOpen(false); setSelectedProj(null); }}>Cancel</Button>
            <Button variant="danger" loading={actionLoading} onClick={handleArchiveProject}>Archive Project</Button>
          </div>
        }
      >
        <div className="space-y-4">
          {actionError && (
            <div className="flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
              <AlertCircle className="h-4 w-4 shrink-0" /> {actionError}
            </div>
          )}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Archive className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-content-secondary">
              Are you sure you want to archive <strong className="text-content">"{selectedProj?.title}"</strong>? It will be removed from active views.
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        title="Quick Create Task"
        subtitle="Add a task to any active project instantly."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsCreateTaskOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={actionLoading} onClick={handleCreateTaskSubmit as any}>Create Task</Button>
          </div>
        }
      >
        <form onSubmit={handleCreateTaskSubmit} className="space-y-5">
          {actionError && (
            <div className="flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
              <AlertCircle className="h-4 w-4 shrink-0" /> {actionError}
            </div>
          )}
          <div>
            <label className={LABEL}>Target Project</label>
            <select required value={taskTargetProj} onChange={(e) => setTaskTargetProj(e.target.value)} className={SELECT}>
              {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL}>Task Title</label>
            <Input required value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="e.g. Write unit tests" />
          </div>
          <div>
            <label className={LABEL}>Description</label>
            <textarea value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} placeholder="Summarize requirements..." rows={3} className={TEXTAREA} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Priority</label>
              <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value as any)} className={SELECT}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Est. Hours</label>
              <Input type="number" min={0} value={taskEstHours} onChange={(e) => setTaskEstHours(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div>
            <label className={LABEL}>Due Date</label>
            <Input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} />
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default Dashboard;
