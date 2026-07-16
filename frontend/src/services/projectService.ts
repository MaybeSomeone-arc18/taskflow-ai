import api from './api';
import { Project } from '../types';

export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get('/projects');
  return response.data.data;
};

export const getProject = async (id: string): Promise<Project> => {
  const response = await api.get(`/projects/${id}`);
  return response.data.data;
};

export const createProject = async (projectData: {
  title: string;
  description?: string;
  color: string;
}): Promise<Project> => {
  const response = await api.post('/projects', projectData);
  return response.data.data;
};

export const updateProject = async (
  id: string,
  projectData: Partial<Project>
): Promise<Project> => {
  const response = await api.patch(`/projects/${id}`, projectData);
  return response.data.data;
};

export const deleteProject = async (id: string): Promise<void> => {
  await api.delete(`/projects/${id}`);
};
