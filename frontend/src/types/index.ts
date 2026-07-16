export interface User {
  _id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  color: string;
  status: 'Active' | 'Archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubTask {
  _id?: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  _id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate?: string;
  estimatedHours: number;
  actualHours: number;
  tags: string[];
  createdBy: string;
  assignedTo?: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  taskId: string;
  userId: User;
  content: string;
  createdAt: string;
}

export interface ActivityLog {
  _id: string;
  userId: User;
  projectId: string;
  action: string;
  details: string;
  createdAt: string;
}
