import ActivityLog from '../models/ActivityLog';

export const logActivity = async (
  projectId: string,
  userId: string,
  action: string,
  details: string,
  taskId?: string
) => {
  try {
    await ActivityLog.create({
      projectId,
      userId,
      action,
      details,
      taskId: taskId || undefined,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
