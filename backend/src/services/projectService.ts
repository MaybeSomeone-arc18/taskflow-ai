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
    members: [{ userId: projectData.createdBy, joinedAt: new Date() }],
    status: 'Active',
  });
  return project;
};

export const getProjectsByUser = async (userId: string): Promise<IProject[]> => {
  const projects = await Project.find({
    $or: [
      { createdBy: userId },
      { 'members.userId': userId }
    ]
  }).sort({ createdAt: -1 });

  return projects.map((project) => {
    if (!project.members || project.members.length === 0) {
      project.members = [{ userId: project.createdBy, joinedAt: project.createdAt || new Date() }];
    }
    return project;
  });
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
