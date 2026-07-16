import { Schema, model, Document, Types } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate?: Date;
  estimatedHours: number;
  actualHours: number;
  tags: string[];
  projectId: Types.ObjectId;
  createdBy: Types.ObjectId;
  assignedTo?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Todo', 'In Progress', 'Completed'],
      default: 'Todo',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
      index: true,
    },
    dueDate: {
      type: Date,
    },
    estimatedHours: {
      type: Number,
      default: 0,
      min: [0, 'Estimated hours must be greater than or equal to 0'],
    },
    actualHours: {
      type: Number,
      default: 0,
      min: [0, 'Actual hours must be greater than or equal to 0'],
    },
    tags: {
      type: [String],
      default: [],
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Search indexes
taskSchema.index({ title: 'text', description: 'text' });
taskSchema.index({ projectId: 1, status: 1, priority: 1, dueDate: 1 });
taskSchema.index({ dueDate: 1 });

const Task = model<ITask>('Task', taskSchema);
export default Task;
