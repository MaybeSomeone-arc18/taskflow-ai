import Project from '../models/Project';
import Task from '../models/Task';
import ActivityLog from '../models/ActivityLog';
import { Types } from 'mongoose';

export const getDashboardStats = async (userId: string) => {
  const userProjectDocs = await Project.find({ createdBy: new Types.ObjectId(userId) });
  const projectIds = userProjectDocs.map((p) => p._id);

  const totalProjects = userProjectDocs.length;

  if (projectIds.length === 0) {
    return {
      totalProjects: 0,
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0,
      completionPercentage: 0,
      todayTasks: [],
      upcomingDeadlines: [],
      recentActivity: [],
    };
  }

  // Task Counts
  const totalTasks = await Task.countDocuments({ projectId: { $in: projectIds } });
  const completedTasks = await Task.countDocuments({
    projectId: { $in: projectIds },
    status: 'Completed',
  });
  const pendingTasks = await Task.countDocuments({
    projectId: { $in: projectIds },
    status: { $in: ['Todo', 'In Progress'] },
  });

  // Overdue Tasks: not Completed and dueDate is in the past
  const now = new Date();
  const overdueTasks = await Task.countDocuments({
    projectId: { $in: projectIds },
    status: { $ne: 'Completed' },
    dueDate: { $lt: now },
  });

  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Today's Tasks
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const todayTasks = await Task.find({
    projectId: { $in: projectIds },
    dueDate: { $gte: startOfToday, $lte: endOfToday },
  }).populate('assignedTo', 'fullName email avatarUrl');

  // Upcoming Deadlines (due in next 7 days, excluding today's and completed)
  const endOfUpcoming = new Date();
  endOfUpcoming.setDate(endOfUpcoming.getDate() + 7);
  endOfUpcoming.setHours(23, 59, 59, 999);

  const upcomingDeadlines = await Task.find({
    projectId: { $in: projectIds },
    status: { $ne: 'Completed' },
    dueDate: { $gt: endOfToday, $lte: endOfUpcoming },
  })
    .sort({ dueDate: 1 })
    .limit(5)
    .populate('projectId', 'title color')
    .populate('assignedTo', 'fullName email avatarUrl');

  // Recent Activity (Activity logs fallback to recent task updates)
  let recentActivity = await ActivityLog.find({ projectId: { $in: projectIds } })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('userId', 'fullName avatarUrl');

  if (recentActivity.length === 0) {
    // Fallback: load recently updated tasks as activity items
    const recentTasks = await Task.find({ projectId: { $in: projectIds } })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('projectId', 'title');

    recentActivity = recentTasks.map((t) => ({
      _id: t._id,
      userId: { fullName: 'System', avatarUrl: '' } as any,
      projectId: t.projectId as any,
      action: t.createdAt.getTime() === t.updatedAt.getTime() ? 'Created Task' : 'Updated Task',
      details: `Task "${t.title}" was processed.`,
      createdAt: t.updatedAt,
      updatedAt: t.updatedAt,
    })) as any;
  }

  return {
    totalProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    completionPercentage,
    todayTasks,
    upcomingDeadlines,
    recentActivity,
  };
};

export const getChartData = async (userId: string) => {
  const userProjectDocs = await Project.find({ createdBy: new Types.ObjectId(userId) });
  const projectIds = userProjectDocs.map((p) => p._id);

  if (projectIds.length === 0) {
    return {
      statusData: [],
      priorityData: [],
      weeklyData: [],
      projectProgress: [],
      productivityScore: 0,
    };
  }

  // 1. Tasks by Status Aggregation
  const statusAggregation = await Task.aggregate([
    { $match: { projectId: { $in: projectIds } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const statusData = ['Todo', 'In Progress', 'Completed'].map((s) => {
    const agg = statusAggregation.find((a) => a._id === s);
    return { name: s, value: agg ? agg.count : 0 };
  });

  // 2. Tasks by Priority Aggregation
  const priorityAggregation = await Task.aggregate([
    { $match: { projectId: { $in: projectIds } } },
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ]);

  const priorityData = ['Low', 'Medium', 'High', 'Critical'].map((p) => {
    const agg = priorityAggregation.find((a) => a._id === p);
    return { name: p, value: agg ? agg.count : 0 };
  });

  // 3. Weekly Task Creation: count tasks created per day for last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const weeklyAggregation = await Task.aggregate([
    {
      $match: {
        projectId: { $in: projectIds },
        createdAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
  ]);

  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().substring(0, 10);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const agg = weeklyAggregation.find((a) => a._id === dateStr);
    weeklyData.push({
      date: dateStr,
      day: dayName,
      count: agg ? agg.count : 0,
    });
  }

  // 4. Project Completion Progress
  const projectProgress = [];
  for (const proj of userProjectDocs) {
    const total = await Task.countDocuments({ projectId: proj._id });
    const completed = await Task.countDocuments({ projectId: proj._id, status: 'Completed' });
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    projectProgress.push({
      _id: proj._id,
      title: proj.title,
      color: proj.color,
      totalTasks: total,
      completedTasks: completed,
      percentage,
    });
  }

  // 5. Productivity Score
  const totalTasks = await Task.countDocuments({ projectId: { $in: projectIds } });
  const completedTasks = await Task.countDocuments({
    projectId: { $in: projectIds },
    status: 'Completed',
  });
  const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    statusData,
    priorityData,
    weeklyData,
    projectProgress,
    productivityScore,
  };
};
