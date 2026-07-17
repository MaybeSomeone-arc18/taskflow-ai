import React from 'react';
import { Task } from '../types';
import { Calendar, Clock, Edit2, Trash2, Hash } from 'lucide-react';
import { Badge, getPriorityVariant } from './ui/Badge';
import { motion } from 'framer-motion';

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
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative rounded-xl border border-border-subtle bg-surface p-4 hover:border-border-focus hover:bg-surface-hover transition-all duration-300 hover:shadow-xl hover:shadow-black/20 cursor-grab active:cursor-grabbing flex flex-col gap-3"
    >
      {/* Priority accent line */}
      <div
        className={[
          'absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-all duration-300',
          task.priority === 'Critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
          task.priority === 'High'     ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
          task.priority === 'Medium'   ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' :
                                         'bg-content-muted',
        ].join(' ')}
      />

      {/* Header: Title + Action buttons */}
      <div className="flex items-start justify-between gap-3 pl-2">
        <h4 className="text-sm font-semibold text-content leading-snug line-clamp-2 flex-1 group-hover:text-content transition-colors">
          {task.title}
        </h4>
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-surface-hover text-content-muted hover:text-content-secondary transition-colors"
            title="Edit task"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task); }}
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-danger/15 text-content-muted hover:text-danger transition-colors"
            title="Delete task"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="pl-2 text-xs text-content-secondary leading-relaxed line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Meta badges row */}
      <div className="pl-2 flex flex-wrap items-center gap-2">
        <Badge variant={getPriorityVariant(task.priority)}>
          {task.priority}
        </Badge>

        {/* Due date */}
        {task.dueDate && (
          <span className={[
            'inline-flex items-center gap-1 text-[10px] rounded-md px-1.5 py-0.5 border font-medium',
            overdue
              ? 'text-danger bg-danger/10 border-danger/20'
              : 'text-content-secondary bg-surface-hover border-border-subtle',
          ].join(' ')}>
            <Calendar className="h-3 w-3" />
            {overdue ? 'Overdue · ' : ''}
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
        
        {/* Hours */}
        {task.estimatedHours > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] text-content-secondary bg-surface-hover border border-border-subtle rounded-md px-1.5 py-0.5 font-medium">
            <Clock className="h-3 w-3" />
            {task.estimatedHours}h
            {task.actualHours > 0 && <span className="text-content-muted mx-0.5">/</span>}
            {task.actualHours > 0 && `${task.actualHours}h`}
          </span>
        )}
      </div>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="pl-2 flex flex-wrap gap-1.5 mt-1">
          {task.tags.map((tg) => (
            <span
              key={tg}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-primary/80 bg-primary/10 border border-primary/20 rounded-md px-1.5 py-0.5 max-w-[90px]"
            >
              <Hash className="h-2.5 w-2.5 shrink-0 opacity-70" />
              <span className="truncate">{tg}</span>
            </span>
          ))}
        </div>
      )}

      {/* Status selector */}
      <div className="mt-2 pl-2 pt-3 border-t border-border-subtle flex items-center justify-between">
        <span className="text-[10px] font-semibold text-content-muted uppercase tracking-wider">Status</span>
        <select
          value={task.status}
          onChange={(e) => { e.stopPropagation(); onStatusChange(task._id, e.target.value as Task['status']); }}
          className="bg-surface hover:bg-surface-hover border border-border-subtle rounded-lg px-2 py-1 text-xs font-medium text-content focus:outline-none focus:border-primary cursor-pointer transition-colors"
        >
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
    </motion.div>
  );
});

TaskCard.displayName = 'TaskCard';
export default TaskCard;
