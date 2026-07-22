import api from './api';

export interface TaskBreakdownResponse {
  subtasks: { 
    title: string; 
    estimatedHours: number;
    priority?: 'Low' | 'Medium' | 'High' | 'Critical';
    description?: string;
    tags?: string[];
    acceptanceCriteria?: string[];
  }[];
  estimatedOrder: string[];
  estimatedEffort: string;
}

export interface DailyPlanResponse {
  plan: { title: string; reason: string; estimatedDuration: number }[];
}

export interface ProjectHealthResponse {
  healthScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  criticalTasks: string[];
  recommendations: string[];
  summary: string;
}

export interface SprintSummaryResponse {
  achievements: string[];
  risks: string[];
  blockers: string[];
  nextSprintPlan: string[];
}

export const getTaskBreakdown = async (
  title: string,
  description?: string
): Promise<TaskBreakdownResponse> => {
  const response = await api.post('/ai/task-breakdown', { title, description });
  return response.data.data;
};

export const getDailyPlan = async (): Promise<DailyPlanResponse> => {
  const response = await api.post('/ai/daily-plan');
  return response.data.data;
};

export const getProjectHealth = async (projectId: string): Promise<ProjectHealthResponse> => {
  const response = await api.post('/ai/project-health', { projectId });
  return response.data.data;
};

export const getSprintSummary = async (projectId: string): Promise<SprintSummaryResponse> => {
  const response = await api.post('/ai/sprint-summary', { projectId });
  return response.data.data;
};
