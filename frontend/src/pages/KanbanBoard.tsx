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
import AIPanel from '../components/AIPanel';
import {
  AlertCircle,
  ArrowLeft,
  Filter,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Badge, getPriorityVariant, getStatusVariant } from '../components/ui/Badge';

const STATUS_COLUMNS: { name: Task['status']; dotColor: string; headerColor: string }[] = [
  { name: 'Todo',        dotColor: 'bg-indigo-400',  headerColor: 'text-indigo-400'  },
  { name: 'In Progress', dotColor: 'bg-amber-400',   headerColor: 'text-amber-400'   },
  { name: 'Completed',   dotColor: 'bg-emerald-400', headerColor: 'text-emerald-400' },
];

const PRIORITIES: Task['priority'][] = ['Low', 'Medium', 'High', 'Critical'];

const FIELD = 'w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all';
const LABEL = 'text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-1.5';

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

  const fetchTasksList = async () => {
    if (!projectId) return;
    setTasksLoading(true); setTasksError(null);
    try {
      const filters = { search: debouncedSearch.trim() || undefined, priority: priorityFilter !== 'All' ? priorityFilter : undefined, status: statusFilter !== 'All' ? statusFilter : undefined, page: currentPage, limit: 15, sortBy, sortOrder };
      const data = await getProjectTasks(projectId, filters);
      setTasks(data.tasks); setTotalPages(data.pages); setTotalCount(data.total);
    } catch (err) { setTasksError((err as Error).message); }
    finally { setTasksLoading(false); }
  };

  useEffect(() => { fetchTasksList(); }, [projectId, debouncedSearch, priorityFilter, statusFilter, sortBy, sortOrder, currentPage]);

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
      await createTask({ title: title.trim(), description: description.trim(), status, priority, dueDate: dueDate ? new Date(dueDate) as any : undefined, estimatedHours, actualHours, tags: parsedTags, projectId: projectId as any });
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
      await updateTask(selectedTask._id, { title: title.trim(), description: description.trim(), status, priority, dueDate: dueDate ? new Date(dueDate) as any : undefined, estimatedHours, actualHours, tags: parsedTags });
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
      setIsDeleteOpen(false); setSelectedTask(null); fetchTasksList();
    } catch (err) { setActionError((err as Error).message); }
    finally { setActionLoading(false); }
  };

  if (projLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
          <span className="text-xs text-zinc-500">Loading project...</span>
        </div>
      </div>
    );
  }

  if (projError || !project) {
    return (
      <div className="space-y-4 max-w-md mx-auto py-12">
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/8 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{projError || 'Project not found.'}</span>
        </div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Task form fields (reused in create + edit modal)
  const TaskFormFields = () => (
    <div className="space-y-4">
      {actionError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" /> {actionError}
        </div>
      )}
      <div>
        <label className={LABEL}>Task Title</label>
        <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Implement Register API" className={FIELD} />
      </div>
      <div>
        <label className={LABEL}>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details about task checkpoints..." rows={3} className={`${FIELD} resize-none`} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as Task['status'])} className={FIELD}>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])} className={FIELD}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Est. Hours</label>
          <input type="number" min={0} step="0.5" value={estimatedHours} onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 0)} className={FIELD} />
        </div>
        <div>
          <label className={LABEL}>Act. Hours</label>
          <input type="number" min={0} step="0.5" value={actualHours} onChange={(e) => setActualHours(parseFloat(e.target.value) || 0)} className={FIELD} />
        </div>
      </div>
      <div>
        <label className={LABEL}>Due Date</label>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={FIELD} />
      </div>
      <div>
        <label className={LABEL}>Tags <span className="text-zinc-700 normal-case font-normal">(comma-separated)</span></label>
        <input type="text" placeholder="e.g. backend, bug, milestone1" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className={FIELD} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ─── Project Header Card ─── */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900">
        {/* Color strip */}
        <div className="absolute top-0 inset-x-0 h-0.5" style={{ backgroundColor: project.color }} />
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: project.color }} />
                <h1 className="text-lg font-bold tracking-tight text-white">{project.title}</h1>
                <Badge variant="status-todo" dot>Active</Badge>
              </div>
              {project.description && (
                <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{project.description}</p>
              )}
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => { setActionError(null); setIsCreateOpen(true); }}
          >
            New Task
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4 items-start">
        {/* ─── Board + Filters (3/4) ─── */}
        <div className="lg:col-span-3 space-y-5">
          {/* Filter Bar */}
          <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900 p-4">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Filter className="h-3.5 w-3.5" />
              <span className="font-medium uppercase tracking-wider">Filters</span>
              {(priorityFilter !== 'All' || statusFilter !== 'All' || search) && (
                <button
                  onClick={() => { setPriorityFilter('All'); setStatusFilter('All'); setSearch(''); }}
                  className="ml-auto text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
              {/* Search */}
              <div className="relative sm:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
              {/* Priority */}
              <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }} className="rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-sm text-zinc-400 focus:border-indigo-500 focus:outline-none">
                <option value="All">All Priorities</option>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              {/* Status */}
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-sm text-zinc-400 focus:border-indigo-500 focus:outline-none">
                <option value="All">All Statuses</option>
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              {/* Sort */}
              <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }} className="rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-sm text-zinc-400 focus:border-indigo-500 focus:outline-none">
                <option value="createdAt">Created Date</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
              </select>
            </div>
            {totalCount > 0 && (
              <p className="text-[11px] text-zinc-600">
                {totalCount} task{totalCount !== 1 ? 's' : ''} found
              </p>
            )}
          </div>

          {/* Error banner */}
          {tasksError && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/8 p-4 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Error loading tasks: {tasksError}</span>
            </div>
          )}

          {/* Kanban Columns */}
          {tasksLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {STATUS_COLUMNS.map((col) => (
                <div key={col.name} className="rounded-2xl border border-zinc-800/80 bg-zinc-900 p-4 space-y-3">
                  <div className="skeleton h-5 w-24 rounded-lg" />
                  {Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {STATUS_COLUMNS.map((col) => {
                const colTasks = tasks.filter((t) => t.status === col.name);
                return (
                  <div key={col.name} className="flex flex-col rounded-2xl border border-zinc-800/80 bg-zinc-900 overflow-hidden">
                    {/* Column header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                        <span className={`text-xs font-semibold ${col.headerColor}`}>{col.name}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-800/60 border border-zinc-800 rounded-full px-2 py-0.5">
                        {colTasks.length}
                      </span>
                    </div>

                    {/* Task cards */}
                    <div className="flex-1 p-3 space-y-2.5 overflow-y-auto max-h-[580px] kanban-scroll">
                      {colTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                          <div className="h-10 w-10 rounded-xl bg-zinc-800/60 flex items-center justify-center">
                            <span className="text-lg">✓</span>
                          </div>
                          <p className="text-xs text-zinc-600">No tasks here.</p>
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

          {/* Pagination */}
          {!tasksLoading && totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-zinc-600">
                Page {currentPage} of {totalPages} · {totalCount} total
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="xs" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  Previous
                </Button>
                <Button variant="outline" size="xs" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ─── AI Panel (1/4) ─── */}
        <div className="lg:col-span-1">
          <AIPanel projectId={project._id} />
        </div>
      </div>

      {/* ─── Create Task Modal ─── */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="New Task"
        subtitle={`Adding to: ${project.title}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={actionLoading} onClick={handleCreateTaskSubmit as any}>
              Create Task
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateTaskSubmit}><TaskFormFields /></form>
      </Modal>

      {/* ─── Edit Task Modal ─── */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setSelectedTask(null); }}
        title="Edit Task"
        subtitle={`Editing: ${selectedTask?.title}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setIsEditOpen(false); setSelectedTask(null); }}>Cancel</Button>
            <Button variant="primary" size="sm" loading={actionLoading} onClick={handleUpdateTaskSubmit as any}>
              Save Changes
            </Button>
          </div>
        }
      >
        <form onSubmit={handleUpdateTaskSubmit}><TaskFormFields /></form>
      </Modal>

      {/* ─── Delete Task Modal ─── */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedTask(null); }}
        title="Delete Task"
        maxWidth="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" disabled={actionLoading} onClick={() => { setIsDeleteOpen(false); setSelectedTask(null); }}>Cancel</Button>
            <Button variant="danger" size="sm" loading={actionLoading} onClick={handleDeleteSubmit}>Delete</Button>
          </div>
        }
      >
        <div className="space-y-3">
          {actionError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" /> {actionError}
            </div>
          )}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <Trash2 className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-zinc-400">
              Permanently delete <strong className="text-zinc-200">"{selectedTask?.title}"</strong>? This cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default KanbanBoard;
