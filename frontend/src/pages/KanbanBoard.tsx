import React, { useEffect, useState, useCallback } from 'react';
import TaskCard from '../components/TaskCard';
import { useParams, Link } from 'react-router-dom';
import { getProject } from '../services/projectService';
import {
  getProjectTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../services/taskService';
import { Project, Task } from '../types';
import { eventBus } from '../utils/eventBus';
import AIPanel from '../components/AIPanel';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Filter,
  Plus,
  Search,
  Trash2,
  X,
  PlusCircle,
  FolderDot
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/LoadingSkeleton';
import { PageHeader } from '../components/ui/PageHeader';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

const STATUS_COLUMNS: { name: Task['status']; dotColor: string; headerColor: string; borderColor: string; bgColor: string }[] = [
  { name: 'Todo',        dotColor: 'bg-content-muted',  headerColor: 'text-content-secondary', borderColor: 'border-border-subtle', bgColor: 'bg-surface/50' },
  { name: 'In Progress', dotColor: 'bg-primary',  headerColor: 'text-primary', borderColor: 'border-primary/20', bgColor: 'bg-primary/5' },
  { name: 'Completed',   dotColor: 'bg-emerald-500', headerColor: 'text-emerald-500', borderColor: 'border-emerald-500/20', bgColor: 'bg-emerald-500/5' },
];

const PRIORITIES: Task['priority'][] = ['Low', 'Medium', 'High', 'Critical'];

const LABEL = 'text-xs font-semibold text-content-muted uppercase tracking-widest block mb-1.5';
const SELECT = 'flex h-11 w-full rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm text-content placeholder:text-content-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all duration-200';
const TEXTAREA = 'flex w-full rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm text-content placeholder:text-content-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all duration-200 resize-none';

export const KanbanBoard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [projLoading, setProjLoading] = useState(true);
  const [projError, setProjError] = useState<string | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>('Todo');
  const [priority, setPriority] = useState<Task['priority']>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number>(0);
  const [actualHours, setActualHours] = useState<number>(0);
  const [tagsInput, setTagsInput] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedSearch(search); setCurrentPage(1); }, 450);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch project
  useEffect(() => {
    if (!projectId) return;
    const fetchProjDetails = async () => {
      setProjLoading(true); setProjError(null);
      try { const data = await getProject(projectId); setProject(data); }
      catch (err) { setProjError((err as Error).message); }
      finally { setProjLoading(false); }
    };
    fetchProjDetails();
  }, [projectId]);

  const fetchTasksList = useCallback(async () => {
    if (!projectId) return;
    setTasksLoading(true); setTasksError(null);
    try {
      const filters = { search: debouncedSearch.trim() || undefined, priority: priorityFilter !== 'All' ? priorityFilter : undefined, status: statusFilter !== 'All' ? statusFilter : undefined, page: currentPage, limit: 30, sortBy, sortOrder };
      const data = await getProjectTasks(projectId, filters);
      setTasks(data.tasks); setTotalPages(data.pages); setTotalCount(data.total);
    } catch (err) { setTasksError((err as Error).message); }
    finally { setTasksLoading(false); }
  }, [projectId, debouncedSearch, priorityFilter, statusFilter, sortBy, sortOrder, currentPage]);

  useEffect(() => { fetchTasksList(); }, [fetchTasksList]);

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !title.trim()) return;
    if (dueDate) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (new Date(dueDate) < today) { setActionError('Due date cannot be before today'); return; }
    }
    setActionLoading(true); setActionError(null);
    try {
      const parsedTags = tagsInput.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
      const createdTask = await createTask({ title: title.trim(), description: description.trim(), status, priority, dueDate: dueDate ? new Date(dueDate) as any : undefined, estimatedHours, actualHours, tags: parsedTags, projectId: projectId as any });
      eventBus.emit('new_notification', {
        title: 'Task Created',
        message: `Task "${createdTask.title}" was successfully added to ${project?.title}.`,
        type: 'task',
        link: `/project/${projectId}`
      });
      eventBus.emit('refresh_dashboard');
      eventBus.emit('refresh_analytics');
      setIsCreateOpen(false);
      setTitle(''); setDescription(''); setStatus('Todo'); setPriority('Medium'); setDueDate(''); setEstimatedHours(0); setActualHours(0); setTagsInput('');
      fetchTasksList();
    } catch (err) { setActionError((err as Error).message); }
    finally { setActionLoading(false); }
  };

  const handleStatusQuickChange = useCallback(async (taskId: string, nextStatus: Task['status']) => {
    try {
      await updateTask(taskId, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status: nextStatus } : t)));
      if (nextStatus === 'Completed') {
        const t = tasks.find(x => x._id === taskId);
        if (t) {
          eventBus.emit('new_notification', {
            title: 'Task Completed',
            message: `Task "${t.title}" was marked as completed.`,
            type: 'task',
            link: `/project/${projectId}`
          });
        }
      }
      eventBus.emit('refresh_dashboard');
      eventBus.emit('refresh_analytics');
    } catch (err) { console.error('Failed to change status:', err); }
  }, []);

  const handleEditInit = useCallback((task: Task) => {
    setSelectedTask(task); setTitle(task.title); setDescription(task.description); setStatus(task.status); setPriority(task.priority);
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().substring(0, 10) : '');
    setEstimatedHours(task.estimatedHours); setActualHours(task.actualHours); setTagsInput(task.tags.join(', '));
    setIsEditOpen(true);
  }, []);

  const handleUpdateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !title.trim()) return;
    if (dueDate) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (new Date(dueDate) < today) { setActionError('Due date cannot be before today'); return; }
    }
    setActionLoading(true); setActionError(null);
    try {
      const parsedTags = tagsInput.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
      const updatedTask = await updateTask(selectedTask._id, { title: title.trim(), description: description.trim(), status, priority, dueDate: dueDate ? new Date(dueDate) as any : undefined, estimatedHours, actualHours, tags: parsedTags });
      if (status === 'Completed' && selectedTask.status !== 'Completed') {
        eventBus.emit('new_notification', {
          title: 'Task Completed',
          message: `Task "${updatedTask.title}" was marked as completed.`,
          type: 'task',
          link: `/project/${projectId}`
        });
      }
      eventBus.emit('refresh_dashboard');
      eventBus.emit('refresh_analytics');
      setIsEditOpen(false); setSelectedTask(null); fetchTasksList();
    } catch (err) { setActionError((err as Error).message); }
    finally { setActionLoading(false); }
  };

  const handleDeleteInit = useCallback((task: Task) => { setSelectedTask(task); setIsDeleteOpen(true); }, []);

  const handleDeleteSubmit = async () => {
    if (!selectedTask) return;
    setActionLoading(true); setActionError(null);
    try {
      await deleteTask(selectedTask._id);
      eventBus.emit('new_notification', {
        title: 'Task Deleted',
        message: `Task "${selectedTask.title}" was deleted.`,
        type: 'task',
        link: `/project/${projectId}`
      });
      eventBus.emit('refresh_dashboard');
      eventBus.emit('refresh_analytics');
      setIsDeleteOpen(false); setSelectedTask(null); fetchTasksList();
    } catch (err) { setActionError((err as Error).message); }
    finally { setActionLoading(false); }
  };

  if (projLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3 grid md:grid-cols-3 gap-4">
            <Skeleton className="h-[600px] rounded-2xl" />
            <Skeleton className="h-[600px] rounded-2xl" />
            <Skeleton className="h-[600px] rounded-2xl" />
          </div>
          <Skeleton className="h-[600px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (projError || !project) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Project not found"
        description={projError || "The project you're looking for doesn't exist or you don't have access."}
        action={{ label: "Back to Dashboard", onClick: () => window.history.back() }}
      />
    );
  }

  const renderTaskFormFields = () => (
    <div className="space-y-4">
      {actionError && (
        <div className="flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" /> {actionError}
        </div>
      )}
      <div>
        <label className={LABEL}>Task Title</label>
        <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Implement Register API" />
      </div>
      <div>
        <label className={LABEL}>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details about task checkpoints..." rows={3} className={TEXTAREA} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as Task['status'])} className={SELECT}>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])} className={SELECT}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Est. Hours</label>
          <Input type="number" min={0} step="0.5" value={estimatedHours} onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label className={LABEL}>Act. Hours</label>
          <Input type="number" min={0} step="0.5" value={actualHours} onChange={(e) => setActualHours(parseFloat(e.target.value) || 0)} />
        </div>
      </div>
      <div>
        <label className={LABEL}>Due Date</label>
        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>
      <div>
        <label className={LABEL}>Tags <span className="text-content-muted normal-case font-normal">(comma-separated)</span></label>
        <Input type="text" placeholder="e.g. backend, bug, milestone1" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 h-full flex flex-col"
    >
      {/* ─── Project Header ─── */}
      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface/50 shrink-0 shadow-lg">
        <div className="absolute top-0 inset-x-0 h-1" style={{ backgroundColor: project.color }} />
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-surface hover:bg-surface-hover text-content-muted hover:text-content transition-colors shadow-sm">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <div className="h-3 w-3 rounded-md shadow-sm" style={{ backgroundColor: project.color }} />
                <h1 className="text-xl font-bold tracking-tight text-content">{project.title}</h1>
                <Badge variant="status-todo" dot>Active Workspace</Badge>
              </div>
              {project.description && (
                <p className="text-sm text-content-secondary mt-1 max-w-2xl">{project.description}</p>
              )}
            </div>
          </div>
          <Button
            variant="primary"
            icon={<PlusCircle className="h-4 w-4" />}
            onClick={() => { setActionError(null); setIsCreateOpen(true); }}
          >
            Create Task
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid gap-6 lg:grid-cols-4 items-start">
        {/* ─── Board + Filters (3/4) ─── */}
        <div className="lg:col-span-3 flex flex-col h-full gap-5">
          {/* Filter Bar */}
          <div className="flex flex-col xl:flex-row gap-3 rounded-2xl border border-border-subtle bg-surface p-4 shrink-0">
            <div className="flex items-center gap-2 text-sm text-content-muted xl:w-24 shrink-0">
              <Filter className="h-4 w-4" />
              <span className="font-semibold uppercase tracking-widest text-[11px]">Filters</span>
            </div>
            
            <div className="flex-1 grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-5 items-center">
              <div className="relative sm:col-span-2">
                <Input
                  type="text"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>
              <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }} className={SELECT}>
                <option value="All">All Priorities</option>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className={SELECT}>
                <option value="All">All Statuses</option>
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }} className={SELECT}>
                <option value="createdAt">Created Date</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
              </select>
            </div>

            {(priorityFilter !== 'All' || statusFilter !== 'All' || search) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setPriorityFilter('All'); setStatusFilter('All'); setSearch(''); }}
                className="xl:ml-auto whitespace-nowrap"
                icon={<X className="h-4 w-4" />}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {tasksError && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger shrink-0">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Error loading tasks: {tasksError}</span>
            </div>
          )}

          {/* Kanban Columns */}
          <div className="flex-1 min-h-0">
            {tasksLoading ? (
              <div className="grid gap-4 md:grid-cols-3 h-full">
                {STATUS_COLUMNS.map((col) => (
                  <div key={col.name} className="rounded-2xl border border-border-subtle bg-surface/50 p-4 flex flex-col gap-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3 h-full">
                {STATUS_COLUMNS.map((col) => {
                  const colTasks = tasks.filter((t) => t.status === col.name);
                  return (
                    <div key={col.name} className={cn("flex flex-col rounded-2xl border h-full max-h-[800px]", col.borderColor, col.bgColor)}>
                      {/* Column header */}
                      <div className="flex items-center justify-between p-4 pb-3 border-b border-border-subtle shrink-0 sticky top-0 bg-inherit z-10 rounded-t-2xl">
                        <div className="flex items-center gap-2.5">
                          <div className={`h-2.5 w-2.5 rounded-full shadow-sm ${col.dotColor}`} />
                          <span className={cn("text-sm font-bold tracking-tight", col.headerColor)}>{col.name}</span>
                        </div>
                        <Badge variant="secondary" className="px-2 py-0.5 text-[10px]">{colTasks.length}</Badge>
                      </div>

                      {/* Task cards */}
                      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
                        {colTasks.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full py-10 gap-3 text-center opacity-60">
                            <div className="h-12 w-12 rounded-2xl border border-dashed border-border-subtle flex items-center justify-center bg-surface/50">
                              <CheckCircle2 className="h-5 w-5 text-content-muted" />
                            </div>
                            <p className="text-sm font-medium text-content-muted">Drop tasks here</p>
                          </div>
                        ) : (
                          colTasks.map((task) => (
                            <TaskCard
                              key={task._id}
                              task={task}
                              onEdit={handleEditInit}
                              onDelete={handleDeleteInit}
                              onStatusChange={handleStatusQuickChange}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border-subtle pt-4 shrink-0">
              <span className="text-sm text-content-muted font-medium">
                Showing page <strong className="text-content">{currentPage}</strong> of <strong className="text-content">{totalPages}</strong> ({totalCount} total tasks)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === 1 || tasksLoading}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === totalPages || tasksLoading}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ─── AI Panel (1/4) ─── */}
        <div className="lg:col-span-1 h-full">
          <AIPanel projectId={project._id} />
        </div>
      </div>

      {/* ─── Create Task Modal ─── */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="New Task"
        subtitle={`Adding to workspace: ${project.title}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={actionLoading} onClick={handleCreateTaskSubmit as any}>Create Task</Button>
          </div>
        }
      >
        <form onSubmit={handleCreateTaskSubmit} className="space-y-5">{renderTaskFormFields()}</form>
      </Modal>

      {/* ─── Edit Task Modal ─── */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setSelectedTask(null); }}
        title="Edit Task"
        subtitle={`Editing: ${selectedTask?.title}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => { setIsEditOpen(false); setSelectedTask(null); }}>Cancel</Button>
            <Button variant="primary" loading={actionLoading} onClick={handleUpdateTaskSubmit as any}>Save Changes</Button>
          </div>
        }
      >
        <form onSubmit={handleUpdateTaskSubmit} className="space-y-5">{renderTaskFormFields()}</form>
      </Modal>

      {/* ─── Delete Task Modal ─── */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedTask(null); }}
        title="Delete Task"
        maxWidth="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" disabled={actionLoading} onClick={() => { setIsDeleteOpen(false); setSelectedTask(null); }}>Cancel</Button>
            <Button variant="danger" loading={actionLoading} onClick={handleDeleteSubmit}>Delete Permanently</Button>
          </div>
        }
      >
        <div className="space-y-4">
          {actionError && (
            <div className="flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
              <AlertCircle className="h-4 w-4 shrink-0" /> {actionError}
            </div>
          )}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <Trash2 className="h-5 w-5 text-danger shrink-0 mt-0.5" />
            <p className="text-sm text-content-secondary">
              Permanently delete <strong className="text-content">"{selectedTask?.title}"</strong>? This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default KanbanBoard;
