import { Schema, model, Document, Types } from 'mongoose';

export interface IProjectMember {
  userId: Types.ObjectId;
  joinedAt: Date;
}

export interface IProject extends Document {
  title: string;
  description: string;
  color: string;
  status: 'Active' | 'Archived';
  createdBy: Types.ObjectId;
  members: IProjectMember[];
  invite?: {
    token: string;
    createdAt: Date;
    expiresAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      required: [true, 'Project color is required'],
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);
        },
        message: (props) => `${props.value} is not a valid hex color code!`,
      },
    },
    status: {
      type: String,
      enum: ['Active', 'Archived'],
      default: 'Active',
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    members: {
      type: [
        {
          userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
          joinedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    invite: {
      token: { type: String, index: true },
      createdAt: { type: Date },
      expiresAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

const Project = model<IProject>('Project', projectSchema);
export default Project;
