import { Schema, model, Document, Types } from 'mongoose';

export interface IWorkspaceMember extends Document {
  workspaceId: Types.ObjectId;
  userId: Types.ObjectId;
  role: 'Admin' | 'Member' | 'Viewer';
  createdAt: Date;
  updatedAt: Date;
}

const workspaceMemberSchema = new Schema<IWorkspaceMember>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['Admin', 'Member', 'Viewer'],
      default: 'Member',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness of user per workspace
workspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

const WorkspaceMember = model<IWorkspaceMember>('WorkspaceMember', workspaceMemberSchema);
export default WorkspaceMember;
