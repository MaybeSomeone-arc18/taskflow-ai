import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || '';

// Initialize client if API Key exists
let genAI: GoogleGenerativeAI | null = null;
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

// Global execution wrapper with a single retry loop
const executeGeminiRequest = async (prompt: string): Promise<string> => {
  if (!genAI) {
    throw new Error('Gemini API key is not configured');
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  let attempts = 0;
  while (attempts < 2) {
    try {
      attempts++;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text) return text;
      throw new Error('Empty response received from Gemini API');
    } catch (err) {
      console.warn(`[GEMINI WARNING] Attempt ${attempts} failed: ${(err as Error).message}`);
      if (attempts >= 2) throw err;
    }
  }

  throw new Error('Gemini execution failed after retries');
};

// 1. Task Breakdown
export const breakdownTask = async (
  title: string,
  description?: string
): Promise<{
  subtasks: { title: string; estimatedHours: number }[];
  estimatedOrder: string[];
  estimatedEffort: string;
}> => {
  const prompt = `
    Analyze the following task and generate a structured checklist breakdown into specific subtasks.
    
    Task Title: "${title}"
    Task Description: "${description || 'No description provided.'}"

    Return a JSON object conforming exactly to this structure:
    {
      "subtasks": [
        { "title": "Subtask Name", "estimatedHours": 2 }
      ],
      "estimatedOrder": ["Subtask Name 1", "Subtask Name 2"],
      "estimatedEffort": "e.g. Medium (approx. 8 hours total)"
    }
    Do not return markdown format wrappers or conversational prefaces. Return the JSON object directly.
  `;

  try {
    const text = await executeGeminiRequest(prompt);
    return JSON.parse(text);
  } catch (err) {
    console.error('[GEMINI ERROR] Task breakdown fallback triggered:', (err as Error).message);
    // Graceful mock fallback
    return {
      subtasks: [
        { title: `Setup boilerplate logic for: ${title}`, estimatedHours: 2 },
        { title: 'Write core implementation scripts', estimatedHours: 3 },
        { title: 'Create unit testing validations', estimatedHours: 2 },
      ],
      estimatedOrder: [
        `Setup boilerplate logic for: ${title}`,
        'Write core implementation scripts',
        'Create unit testing validations',
      ],
      estimatedEffort: 'Low-Medium (approx. 7 hours total) - Fallback Estimate',
    };
  }
};

// 2. Daily Plan
export const generateDailyPlan = async (
  tasks: { title: string; priority: string; estimatedHours: number; dueDate?: Date }[]
): Promise<{
  plan: { title: string; reason: string; estimatedDuration: number }[];
}> => {
  const taskDetails = tasks
    .map(
      (t) =>
        `- Title: "${t.title}", Priority: "${t.priority}", Est Hours: ${t.estimatedHours}, Due: ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'None'}`
    )
    .join('\n');

  const prompt = `
    Organize the following pending task checklist into an optimized, highly productive chronological daily execution plan.
    Prioritize based on task critical status, priority level, and approaching due dates.
    
    Tasks List:
    ${taskDetails}

    Return a JSON object conforming exactly to this structure:
    {
      "plan": [
        { "title": "Task Title", "reason": "Short reason why this is prioritized now", "estimatedDuration": 3 }
      ]
    }
    Do not return markdown format wrappers or conversational text. Return the JSON object directly.
  `;

  try {
    const text = await executeGeminiRequest(prompt);
    return JSON.parse(text);
  } catch (err) {
    console.error('[GEMINI ERROR] Daily Plan fallback triggered:', (err as Error).message);
    // Graceful mock fallback
    return {
      plan: tasks.map((t) => ({
        title: t.title,
        reason: `Prioritized based on priority ${t.priority} and effort parameters. (Fallback Plan)`,
        estimatedDuration: t.estimatedHours || 2,
      })),
    };
  }
};

// 3. Project Health
export const analyzeProjectHealth = async (
  project: { title: string; description?: string },
  tasks: { title: string; status: string; priority: string; dueDate?: Date }[],
  completionPercentage: number
): Promise<{
  healthScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  criticalTasks: string[];
  recommendations: string[];
  summary: string;
}> => {
  const taskDetails = tasks
    .map(
      (t) =>
        `- Title: "${t.title}", Status: "${t.status}", Priority: "${t.priority}", Due: ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'None'}`
    )
    .join('\n');

  const prompt = `
    Analyze the health, current velocity, risk exposures, and deadlines compliance for the following project.
    
    Project Title: "${project.title}"
    Project Description: "${project.description || 'No description'}"
    Current Task Done Percentage: ${completionPercentage}%
    
    Tasks List:
    ${taskDetails}

    Return a JSON object conforming exactly to this structure:
    {
      "healthScore": 85,
      "riskLevel": "Low", // must be Low, Medium, or High
      "criticalTasks": ["Task Title 1", "Task Title 2"],
      "recommendations": ["Recommendation item 1", "Recommendation item 2"],
      "summary": "Short analytical project summary overview."
    }
    Do not return markdown format wrappers or conversational text. Return the JSON object directly.
  `;

  try {
    const text = await executeGeminiRequest(prompt);
    return JSON.parse(text);
  } catch (err) {
    console.error('[GEMINI ERROR] Project Health fallback triggered:', (err as Error).message);
    // Graceful mock fallback
    const overdueTasksCount = tasks.filter(
      (t) => t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) < new Date()
    ).length;

    const risk = overdueTasksCount > 0 ? 'High' : completionPercentage < 40 ? 'Medium' : 'Low';
    const score = Math.max(10, Math.min(100, Math.round(completionPercentage - overdueTasksCount * 15)));

    return {
      healthScore: score,
      riskLevel: risk as any,
      criticalTasks: tasks.slice(0, 2).map((t) => t.title),
      recommendations: [
        'Close overdue tasks as early as possible.',
        'Consider splitting large milestones into smaller checks.',
      ],
      summary: `Project "${project.title}" is running with a ${completionPercentage}% completion rate. (Fallback Health Report)`,
    };
  }
};

// 4. Sprint Summary
export const generateSprintSummary = async (
  completedTasks: { title: string }[],
  pendingTasks: { title: string; status: string; priority: string }[]
): Promise<{
  achievements: string[];
  risks: string[];
  blockers: string[];
  nextSprintPlan: string[];
}> => {
  const completedDetails = completedTasks.map((t) => `- "${t.title}"`).join('\n');
  const pendingDetails = pendingTasks
    .map((t) => `- "${t.title}" (Status: ${t.status}, Priority: ${t.priority})`)
    .join('\n');

  const prompt = `
    Generate a concise Sprint Retrospective summary based on the following task list results.
    
    Completed Tasks in Sprint:
    ${completedDetails || 'None'}
    
    Pending Tasks remaining:
    ${pendingDetails || 'None'}

    Return a JSON object conforming exactly to this structure:
    {
      "achievements": ["Achievement bullet 1", "Achievement bullet 2"],
      "risks": ["Risk bullet 1", "Risk bullet 2"],
      "blockers": ["Blocker bullet 1", "Blocker bullet 2"],
      "nextSprintPlan": ["Next Sprint task item 1", "Next Sprint task item 2"]
    }
    Do not return markdown format wrappers or conversational text. Return the JSON object directly.
  `;

  try {
    const text = await executeGeminiRequest(prompt);
    return JSON.parse(text);
  } catch (err) {
    console.error('[GEMINI ERROR] Sprint Summary fallback triggered:', (err as Error).message);
    // Graceful mock fallback
    return {
      achievements: completedTasks.map((t) => `Completed: ${t.title}`),
      risks: pendingTasks.filter((t) => t.priority === 'Critical' || t.priority === 'High').map((t) => `Pending urgent item: ${t.title}`),
      blockers: ['Lack of active team scope indicators.'],
      nextSprintPlan: pendingTasks.map((t) => `Continue: ${t.title}`),
    };
  }
};
