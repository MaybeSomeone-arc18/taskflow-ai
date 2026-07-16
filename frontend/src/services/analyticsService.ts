import api from './api';

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionPercentage: number;
  todayTasks: any[];
  upcomingDeadlines: any[];
  recentActivity: any[];
}

export interface ChartData {
  statusData: { name: string; value: number }[];
  priorityData: { name: string; value: number }[];
  weeklyData: { date: string; day: string; count: number }[];
  projectProgress: {
    _id: string;
    title: string;
    color: string;
    totalTasks: number;
    completedTasks: number;
    percentage: number;
  }[];
  productivityScore: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/analytics/dashboard');
  return response.data.data;
};

export const getChartData = async (): Promise<ChartData> => {
  const response = await api.get('/analytics/charts');
  return response.data.data;
};
