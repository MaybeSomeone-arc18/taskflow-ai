import React, { useEffect, useState, useMemo } from 'react';
import { getChartData, ChartData } from '../services/analyticsService';
import { eventBus } from '../utils/eventBus';
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
  FolderDot,
  ListTodo,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Skeleton } from '../components/ui/LoadingSkeleton';
import { motion } from 'framer-motion';

const STATUS_COLORS = ['#3b82f6', '#f59e0b', '#10b981']; // Blue, Amber, Emerald
const PRIORITY_COLORS = {
  Low: '#71717a',
  Medium: '#3b82f6',
  High: '#f59e0b',
  Critical: '#ef4444',
};

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--theme-surface)',
  borderColor: 'var(--theme-border-subtle)',
  borderRadius: '12px',
  color: 'var(--theme-content)',
  fontSize: '12px',
  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
  padding: '12px',
};

export const Analytics: React.FC = () => {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusData = useMemo(() => data?.statusData || [], [data]);
  const priorityData = useMemo(() => data?.priorityData || [], [data]);
  const weeklyData = useMemo(() => data?.weeklyData || [], [data]);
  const projectProgress = useMemo(() => data?.projectProgress || [], [data]);

  const fetchAnalytics = async () => {
    setLoading(true); setError(null);
    try { const result = await getChartData(); setData(result); }
    catch (err) { setError((err as Error).message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAnalytics();
    const unsub = eventBus.on('refresh_analytics', fetchAnalytics);
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-20 w-[300px]" />
        <div className="grid sm:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] rounded-2xl" />
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-[350px] rounded-2xl" />
            <Skeleton className="h-[350px] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load analytics"
        description={error || 'No datasets returned.'}
        action={{ label: 'Try Again', onClick: fetchAnalytics }}
      />
    );
  }

  const isStatsEmpty = statusData.every((s) => s.value === 0) && projectProgress.length === 0;
  const totalTasksCount = statusData.reduce((acc, curr) => acc + curr.value, 0);
  const completedTasksCount = statusData.find((s) => s.name === 'Completed')?.value || 0;
  const activeProjectsCount = projectProgress.length;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <PageHeader 
        title="Analytics & Reports" 
        description="Real-time productivity metrics, delivery rates, and project performance."
      />

      {isStatsEmpty ? (
        <EmptyState
          icon={Brain}
          title="No analytics data yet"
          description="Create projects and complete tasks to generate visual charts and performance metrics."
        />
      ) : (
        <div className="space-y-6">
          {/* KPI Row */}
          <div className="grid sm:grid-cols-3 gap-6">
            <StatCard 
              title="Productivity Score" 
              value={`${data.productivityScore}%`}
              icon={<CheckCircle2 className="h-5 w-5 text-blue-500" />}
              progress={data.productivityScore}
              trend={{ value: 5, label: 'vs last month' }}
            />
            
            <StatCard 
              title="Active Workspaces" 
              value={activeProjectsCount}
              icon={<FolderDot className="h-5 w-5 text-emerald-500" />}
            />
            
            <StatCard 
              title="Closed Volume" 
              value={`${completedTasksCount} / ${totalTasksCount}`}
              icon={<ListTodo className="h-5 w-5 text-amber-500" />}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-3 items-start">
            {/* Left column */}
            <div className="space-y-6">
              {/* Donut chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Task Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={statusData} 
                          dataKey="value" 
                          nameKey="name" 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={60} 
                          outerRadius={80} 
                          paddingAngle={5} 
                          strokeWidth={0}
                        >
                          {statusData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={STATUS_COLORS[idx % STATUS_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#e4e4e7' }} />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36} 
                          iconType="circle" 
                          iconSize={8} 
                          formatter={(val) => <span className="text-xs text-content font-medium ml-1">{val}</span>} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Project Progress */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Project Delivery Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 mt-2">
                    {projectProgress.length === 0 ? (
                      <p className="text-xs text-content-muted text-center py-4">No project progress data.</p>
                    ) : (
                      projectProgress.map((proj) => (
                        <div key={proj._id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="h-2 w-2 rounded-sm shrink-0" style={{ backgroundColor: proj.color }} />
                              <span className="text-xs font-medium text-content truncate max-w-[140px]">{proj.title}</span>
                            </div>
                            <span className="text-[11px] font-medium text-content-secondary shrink-0 ml-2">
                              {proj.percentage}% · {proj.completedTasks}/{proj.totalTasks}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-border-subtle rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${proj.percentage}%`, backgroundColor: proj.color }} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right columns: bar + line charts */}
            <div className="md:col-span-2 space-y-6">
              {/* Priority Bar Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Task Priority Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border-subtle)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--theme-content-muted)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                        <YAxis stroke="var(--theme-content-muted)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} dx={-10} />
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={TOOLTIP_STYLE} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                          {priorityData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] || '#3b82f6'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Line Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Weekly Task Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border-subtle)" vertical={false} />
                        <XAxis dataKey="day" stroke="var(--theme-content-muted)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                        <YAxis stroke="var(--theme-content-muted)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} dx={-10} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#18181b', stroke: '#3b82f6', strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Analytics;
