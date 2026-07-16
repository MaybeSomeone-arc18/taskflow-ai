import React, { useEffect, useState, useMemo } from 'react';
import { getChartData, ChartData } from '../services/analyticsService';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  AlertCircle,
  BarChart3,
  Brain,
  CheckCircle2,
  Loader2,
  TrendingUp,
  FolderDot,
  ListTodo,
} from 'lucide-react';

const STATUS_COLORS = ['#6366f1', '#f59e0b', '#10b981'];
const PRIORITY_COLORS = {
  Low: '#3f3f46',
  Medium: '#3b82f6',
  High: '#f59e0b',
  Critical: '#ef4444',
};

const TOOLTIP_STYLE = {
  backgroundColor: '#09090b',
  borderColor: '#27272a',
  borderRadius: '10px',
  color: '#e4e4e7',
  fontSize: '12px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
};

const ChartCard: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; accent?: string }> = ({
  title, subtitle, children, accent,
}) => (
  <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900 overflow-hidden">
    {accent && <div className="h-0.5 w-full" style={{ backgroundColor: accent }} />}
    <div className="p-5 border-b border-zinc-800/60">
      <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
      {subtitle && <p className="text-xs text-zinc-600 mt-0.5">{subtitle}</p>}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

export const Analytics: React.FC = () => {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusData = useMemo(() => data?.statusData || [], [data]);
  const priorityData = useMemo(() => data?.priorityData || [], [data]);
  const weeklyData = useMemo(() => data?.weeklyData || [], [data]);
  const projectProgress = useMemo(() => data?.projectProgress || [], [data]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true); setError(null);
      try { const result = await getChartData(); setData(result); }
      catch (err) { setError((err as Error).message); }
      finally { setLoading(false); }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="grid sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="skeleton h-80 rounded-2xl" />
          <div className="md:col-span-2 space-y-6">
            <div className="skeleton h-72 rounded-2xl" />
            <div className="skeleton h-72 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/8 p-5 text-sm text-red-400 max-w-lg mx-auto my-12">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span>Error loading analytics: {error || 'No datasets returned.'}</span>
      </div>
    );
  }

  const isStatsEmpty = statusData.every((s) => s.value === 0) && projectProgress.length === 0;
  const totalTasksCount = statusData.reduce((acc, curr) => acc + curr.value, 0);
  const completedTasksCount = statusData.find((s) => s.name === 'Completed')?.value || 0;
  const activeProjectsCount = projectProgress.length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-500" />
          Analytics
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Real-time productivity metrics, delivery rates, and project performance.
        </p>
      </div>

      {isStatsEmpty ? (
        <div className="flex flex-col items-center justify-center text-center p-16 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30 max-w-lg mx-auto space-y-5 my-8">
          <div className="h-16 w-16 rounded-2xl bg-zinc-800/60 flex items-center justify-center">
            <Brain className="h-7 w-7 text-zinc-600" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-zinc-300">No analytics data yet</h3>
            <p className="text-xs text-zinc-600 max-w-xs leading-relaxed">
              Create projects and complete tasks to generate visual charts and performance metrics.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Row */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900 p-5 space-y-3">
              <div className="absolute top-0 inset-x-0 h-0.5 bg-indigo-500" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Productivity Score</span>
                <CheckCircle2 className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white">{data.productivityScore}%</div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${data.productivityScore}%` }} />
              </div>
              <p className="text-xs text-zinc-600">Completion efficiency index</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900 p-5 space-y-3">
              <div className="absolute top-0 inset-x-0 h-0.5 bg-emerald-500" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Active Workspaces</span>
                <FolderDot className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">{activeProjectsCount}</div>
              <p className="text-xs text-zinc-600">Projects currently tracked</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900 p-5 space-y-3">
              <div className="absolute top-0 inset-x-0 h-0.5 bg-amber-500" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Closed Volume</span>
                <ListTodo className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {completedTasksCount}
                <span className="text-base font-normal text-zinc-600"> / {totalTasksCount}</span>
              </div>
              <p className="text-xs text-zinc-600">Tasks delivered to completion</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Left column */}
            <div className="space-y-6">
              {/* Donut chart */}
              <ChartCard title="Task Status Distribution" subtitle="Todo · In Progress · Completed" accent="#6366f1">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={52} outerRadius={72} paddingAngle={4} strokeWidth={0}>
                        {statusData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={STATUS_COLORS[idx % STATUS_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={(val) => <span className="text-xs text-zinc-400 font-medium">{val}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              {/* Project Progress */}
              <ChartCard title="Project Delivery Rates" subtitle="Completion % per project">
                <div className="space-y-4 max-h-64 overflow-y-auto kanban-scroll">
                  {projectProgress.length === 0 ? (
                    <p className="text-xs text-zinc-600 text-center py-4">No project progress data.</p>
                  ) : (
                    projectProgress.map((proj) => (
                      <div key={proj._id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="h-2 w-2 rounded-sm shrink-0" style={{ backgroundColor: proj.color }} />
                            <span className="text-xs font-medium text-zinc-300 truncate max-w-[110px]">{proj.title}</span>
                          </div>
                          <span className="text-[11px] text-zinc-500 shrink-0 ml-2">
                            {proj.percentage}% · {proj.completedTasks}/{proj.totalTasks}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${proj.percentage}%`, backgroundColor: proj.color }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ChartCard>
            </div>

            {/* Right columns: bar + line charts */}
            <div className="md:col-span-2 space-y-6">
              {/* Priority Bar Chart */}
              <ChartCard title="Task Priority Distribution" subtitle="Count of tasks by urgency level" accent="#f59e0b">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priorityData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={TOOLTIP_STYLE} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {priorityData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] || '#6366f1'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              {/* Weekly Line Chart */}
              <ChartCard title="Weekly Task Volume" subtitle="Tasks created over the past 7 days" accent="#10b981">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="day" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#818cf8' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
