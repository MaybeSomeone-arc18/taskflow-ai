import Project, { IProject } from '../models/Project';

export const createProject = async (projectData: {
  title: string;
  description?: string;
  color: string;
  createdBy: string;
}): Promise<IProject> => {
  const project = await Project.create({
    title: projectData.title,
    description: projectData.description || '',
    color: projectData.color,
    createdBy: projectData.createdBy,
    status: 'Active',
  });
  return project;
};

export const getProjectsByUser = async (userId: string): Promise<IProject[]> => {
  return Project.find({ createdBy: userId }).sort({ createdAt: -1 });
};

export const getProjectById = async (projectId: string): Promise<IProject | null> => {
  return Project.findById(projectId);
};

export const updateProject = async (
  projectId: string,
  updateData: Partial<IProject>
): Promise<IProject | null> => {
  return Project.findByIdAndUpdate(projectId, updateData, { new: true, runValidators: true });
};

export const softDeleteProject = async (projectId: string): Promise<IProject | null> => {
  return Project.findByIdAndUpdate(projectId, { status: 'Archived' }, { new: true });
};
