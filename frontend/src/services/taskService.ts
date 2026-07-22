import api from './api';
import { Task } from '../types';

interface TaskQueryParams {
  projectId?: string;
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedTasksResponse {
  tasks: Task[];
  total: number;
  pages: number;
}

export const getTasks = async (params?: TaskQueryParams): Promise<PaginatedTasksResponse> => {
  const response = await api.get('/tasks', { params });
  return response.data.data;
};

export const getProjectTasks = async (
  projectId: string,
  params?: Omit<TaskQueryParams, 'projectId'>
): Promise<PaginatedTasksResponse> => {
  const response = await api.get(`/projects/${projectId}/tasks`, { params });
  return response.data.data;
};

export const getTask = async (id: string): Promise<Task> => {
  const response = await api.get(`/tasks/${id}`);
  return response.data.data;
};

export const createTask = async (taskData: Partial<Task>): Promise<Task> => {
  const response = await api.post('/tasks', taskData);
  return response.data.data;
};

export const updateTask = async (id: string, taskData: Partial<Task>): Promise<Task> => {
  const response = await api.patch(`/tasks/${id}`, taskData);
  return response.data.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

export const importAITasks = async (projectId: string, tasks: Partial<Task>[]): Promise<Task[]> => {
  const response = await api.post('/tasks/import-ai', { projectId, tasks });
  return response.data.data;
};
