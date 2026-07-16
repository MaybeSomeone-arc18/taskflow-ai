import React from 'react';
import { Task } from '../types';
import { Calendar, Clock, Edit2, Tag, Trash2, ArrowUpRight } from 'lucide-react';
import { Badge, getPriorityVariant } from './ui/Badge';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, nextStatus: Task['status']) => void;
}

const isOverdue = (dueDate?: string) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

export const TaskCard: React.FC<TaskCardProps> = React.memo(({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const overdue = isOverdue(task.dueDate) && task.status !== 'Completed';

  return (
    <div className="group relative rounded-xl border border-zinc-800/80 bg-zinc-900 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/30 cursor-default">
      {/* Priority accent line */}
      <div
        className={[
          'absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full transition-all duration-200',
          task.priority === 'Critical' ? 'bg-red-500' :
          task.priority === 'High'     ? 'bg-amber-500' :
          task.priority === 'Medium'   ? 'bg-blue-500' :
                                         'bg-zinc-700',
        ].join(' ')}
      />

      {/* Header: Title + Action buttons */}
      <div className="flex items-start justify-between gap-2 pl-1">
        <h4 className="text-sm font-semibold text-zinc-100 leading-snug line-clamp-2 flex-1">
          {task.title}
        </h4>
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={() => onEdit(task)}
            className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Edit task"
          >
            <Edit2 className="h-3 w-3" />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-red-500/15 text-zinc-500 hover:text-red-400 transition-colors"
            title="Delete task"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="mt-1.5 pl-1 text-xs text-zinc-500 leading-relaxed line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Meta badges row */}
      <div className="mt-3 pl-1 flex flex-wrap items-center gap-1.5">
        <Badge variant={getPriorityVariant(task.priority)}>
          {task.priority}
        </Badge>

        {/* Hours */}
        {task.estimatedHours > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500 bg-zinc-800/60 border border-zinc-800 rounded-md px-1.5 py-0.5">
            <Clock className="h-2.5 w-2.5" />
            {task.estimatedHours}h est
            {task.actualHours > 0 && ` / ${task.actualHours}h act`}
          </span>
        )}

        {/* Due date */}
        {task.dueDate && (
          <span className={[
            'inline-flex items-center gap-1 text-[10px] rounded-md px-1.5 py-0.5 border',
            overdue
              ? 'text-red-400 bg-red-500/10 border-red-500/25'
              : 'text-zinc-500 bg-zinc-800/60 border-zinc-800',
          ].join(' ')}>
            <Calendar className="h-2.5 w-2.5" />
            {overdue ? 'Overdue · ' : ''}
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="mt-2 pl-1 flex flex-wrap gap-1">
          {task.tags.map((tg) => (
            <span
              key={tg}
              className="inline-flex items-center gap-1 text-[10px] text-zinc-600 bg-zinc-800/50 border border-zinc-800/80 rounded-md px-1.5 py-0.5 max-w-[80px]"
            >
              <Hash className="h-2 w-2 shrink-0" />
              <span className="truncate">{tg}</span>
            </span>
          ))}
        </div>
      )}

      {/* Status selector */}
      <div className="mt-3 pl-1 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
        <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Status</span>
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value as Task['status'])}
          className="bg-zinc-800/80 border border-zinc-700/80 rounded-lg px-2.5 py-1 text-[11px] font-medium text-zinc-300 focus:outline-none focus:border-indigo-500 cursor-pointer transition-colors hover:border-zinc-600"
        >
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
    </div>
  );
});

TaskCard.displayName = 'TaskCard';
export default TaskCard;
