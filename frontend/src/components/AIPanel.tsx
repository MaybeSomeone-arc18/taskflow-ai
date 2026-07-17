import React, { useState } from 'react';
import {
  getTaskBreakdown,
  getDailyPlan,
  getProjectHealth,
  getSprintSummary,
  ProjectHealthResponse,
  SprintSummaryResponse,
  DailyPlanResponse,
  TaskBreakdownResponse,
} from '../services/aiService';
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Heart,
  ListTodo,
  Loader2,
  RotateCcw,
  Sparkles,
  Zap,
  TrendingUp,
  Clock,
  ArrowRight,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Shield
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';

interface AIPanelProps {
  projectId: string;
}

type AIView = 'none' | 'health' | 'sprint' | 'plan' | 'breakdown';

const ACTION_BUTTONS: { view: AIView; icon: React.ReactNode; label: string; desc: string; color: string }[] = [
  { view: 'health', icon: <Heart className="h-4 w-4" />, label: 'Project Health', desc: 'Score the project health and risk level', color: 'text-emerald-400 bg-emerald-500/10' },
  { view: 'sprint', icon: <Zap className="h-4 w-4" />, label: 'Sprint Summary', desc: 'Achievements, risks, and next milestones', color: 'text-amber-400 bg-amber-500/10' },
  { view: 'plan', icon: <ListTodo className="h-4 w-4" />, label: 'Daily Plan', desc: 'Priority-sorted task schedule for today', color: 'text-blue-400 bg-blue-500/10' },
];

export const AIPanel: React.FC<AIPanelProps> = ({ projectId }) => {
  const [activeView, setActiveView] = useState<AIView>('none');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [healthResult, setHealthResult] = useState<ProjectHealthResponse | null>(null);
  const [sprintResult, setSprintResult] = useState<SprintSummaryResponse | null>(null);
  const [dailyPlanResult, setDailyPlanResult] = useState<DailyPlanResponse | null>(null);
  const [breakdownResult, setBreakdownResult] = useState<TaskBreakdownResponse | null>(null);

  const [breakdownTitle, setBreakdownTitle] = useState('');
  const [breakdownDesc, setBreakdownDesc] = useState('');

  const resetResults = () => { setError(null); setCopied(false); };

  const handleAction = async (actionType: AIView) => {
    setLoading(true);
    resetResults();
    setActiveView(actionType);
    try {
      if (actionType === 'health') { const res = await getProjectHealth(projectId); setHealthResult(res); }
      else if (actionType === 'sprint') { const res = await getSprintSummary(projectId); setSprintResult(res); }
      else if (actionType === 'plan') { const res = await getDailyPlan(); setDailyPlanResult(res); }
      else if (actionType === 'breakdown') {
        if (!breakdownTitle.trim()) { setError('Please provide a task title to break down'); setLoading(false); return; }
        const res = await getTaskBreakdown(breakdownTitle.trim(), breakdownDesc.trim());
        setBreakdownResult(res);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    let textToCopy = '';
    if (activeView === 'health' && healthResult) {
      textToCopy = `Project Health\nScore: ${healthResult.healthScore}%\nRisk: ${healthResult.riskLevel}\nSummary: ${healthResult.summary}\nRecommendations:\n${healthResult.recommendations.join('\n')}`;
    } else if (activeView === 'sprint' && sprintResult) {
      textToCopy = `Sprint Summary\nAchievements:\n${sprintResult.achievements.join('\n')}\nRisks:\n${sprintResult.risks.join('\n')}`;
    } else if (activeView === 'plan' && dailyPlanResult) {
      textToCopy = `Daily Plan\n${dailyPlanResult.plan.map((p, i) => `${i + 1}. ${p.title} (${p.estimatedDuration}h)`).join('\n')}`;
    } else if (activeView === 'breakdown' && breakdownResult) {
      textToCopy = `Task Breakdown\nEffort: ${breakdownResult.estimatedEffort}\n${breakdownResult.subtasks.map((s) => `- ${s.title} (${s.estimatedHours}h)`).join('\n')}`;
    }
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getRiskConfig = (risk: string) => {
    switch (risk) {
      case 'Low':    return { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', bar: 'bg-emerald-500', icon: ShieldCheck };
      case 'Medium': return { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', bar: 'bg-amber-500', icon: Shield };
      case 'High':   return { color: 'text-red-400 bg-red-500/10 border-red-500/20', bar: 'bg-red-500', icon: ShieldAlert };
      default:       return { color: 'text-content-muted bg-surface-hover border-border-subtle', bar: 'bg-content-muted', icon: Shield };
    }
  };

  return (
    <Card glass className="flex flex-col h-full overflow-hidden border-border-subtle">
      {/* Panel header */}
      <CardHeader className="pb-3 border-b border-border-subtle bg-surface/50">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shadow-inner">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-content">AI Copilot</CardTitle>
            <p className="text-[10px] font-medium text-primary/80 tracking-wide uppercase mt-0.5">Powered by Google Gemini</p>
          </div>
        </div>
      </CardHeader>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 space-y-5">
          {/* Action buttons */}
          <div className="space-y-2.5">
            {ACTION_BUTTONS.map((btn) => (
              <button
                key={btn.view}
                onClick={() => handleAction(btn.view)}
                disabled={loading}
                className={[
                  'w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-300 group',
                  activeView === btn.view
                    ? 'border-primary/50 bg-primary/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                    : 'border-border-subtle bg-surface/30 hover:bg-surface-hover hover:border-border-focus',
                  loading ? 'opacity-50 cursor-not-allowed' : '',
                ].join(' ')}
              >
                <div className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center transition-colors ${activeView === btn.view ? btn.color : 'bg-surface border border-border-subtle text-content-muted group-hover:text-content group-hover:bg-surface-hover'}`}>
                  {btn.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold transition-colors ${activeView === btn.view ? 'text-primary' : 'text-content'}`}>{btn.label}</p>
                  <p className="text-[11px] text-content-secondary mt-0.5 truncate">{btn.desc}</p>
                </div>
                {loading && activeView === btn.view ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                ) : (
                  <ChevronRight className={`h-4 w-4 shrink-0 transition-all ${activeView === btn.view ? 'text-primary translate-x-1' : 'text-content-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2'}`} />
                )}
              </button>
            ))}
          </div>

          {/* Task Breakdown tool */}
          <div className="rounded-xl border border-border-subtle bg-surface/40 p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-6 w-6 rounded flex items-center justify-center bg-primary/10 text-primary">
                <Brain className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-semibold text-content">Task Breakdown</span>
            </div>
            <Input
              type="text"
              placeholder="e.g. Implement auth middleware"
              value={breakdownTitle}
              onChange={(e) => setBreakdownTitle(e.target.value)}
              disabled={loading}
              className="bg-background/50"
            />
            <Button
              onClick={() => handleAction('breakdown')}
              disabled={loading || !breakdownTitle.trim()}
              className="w-full"
              variant={activeView === 'breakdown' && !loading ? 'primary' : 'secondary'}
            >
              {loading && activeView === 'breakdown' ? 'Analyzing...' : 'Break Down Task'}
            </Button>
          </div>

          {/* Result output box */}
          <AnimatePresence mode="wait">
            {activeView !== 'none' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-2"
              >
                {/* Result header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-bold text-content-muted uppercase tracking-widest">AI Insights</span>
                  </div>
                  {!loading && !error && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={copyToClipboard}
                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-surface-hover text-content-muted hover:text-content-secondary transition-colors"
                        title="Copy to clipboard"
                      >
                        {copied ? <ClipboardCheck className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleAction(activeView)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-surface-hover text-content-muted hover:text-content-secondary transition-colors"
                        title="Regenerate insights"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4 rounded-xl border border-border-subtle bg-surface/30">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                      <div className="relative h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                      <Sparkles className="absolute h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-content-secondary animate-pulse">Analyzing workspace data...</p>
                  </div>
                ) : error ? (
                  <div className="flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border-subtle bg-background p-5 space-y-5 text-sm shadow-inner"
                  >
                    {/* Health Result */}
                    {activeView === 'health' && healthResult && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-end gap-1">
                              <span className="text-3xl font-black tracking-tighter text-content leading-none">{healthResult.healthScore}</span>
                              <span className="text-sm font-bold text-content-secondary mb-1">%</span>
                            </div>
                            <p className="text-[10px] font-semibold text-content-muted uppercase tracking-widest mt-1">Health Score</p>
                          </div>
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold text-xs ${getRiskConfig(healthResult.riskLevel).color}`}>
                            {React.createElement(getRiskConfig(healthResult.riskLevel).icon, { className: "h-3.5 w-3.5" })}
                            {healthResult.riskLevel} Risk
                          </div>
                        </div>
                        <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border-subtle">
                          <div className={`h-full rounded-full transition-all duration-1000 ${getRiskConfig(healthResult.riskLevel).bar}`} style={{ width: `${healthResult.healthScore}%` }} />
                        </div>
                        <p className="text-content-secondary leading-relaxed text-sm bg-surface p-3 rounded-lg border border-border-subtle">{healthResult.summary}</p>
                        
                        {healthResult.criticalTasks.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                              <p className="text-[11px] font-bold text-red-400 uppercase tracking-widest">Critical Tasks</p>
                            </div>
                            <ul className="space-y-1.5 bg-danger/5 border border-danger/10 rounded-lg p-3">
                              {healthResult.criticalTasks.map((t, i) => (
                                <li key={i} className="flex items-start gap-2 text-content text-xs leading-relaxed">
                                  <span className="text-danger shrink-0 mt-0.5">•</span>
                                  {t}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {healthResult.recommendations.length > 0 && (
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                              <p className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">Recommendations</p>
                            </div>
                            <ul className="space-y-2">
                              {healthResult.recommendations.map((r, i) => (
                                <li key={i} className="flex items-start gap-2 text-content-secondary text-xs leading-relaxed">
                                  <ArrowRight className="h-3.5 w-3.5 text-primary/50 shrink-0 mt-0.5" />
                                  <span className="text-content">{r}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Sprint Summary */}
                    {activeView === 'sprint' && sprintResult && (
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Achievements</p>
                          </div>
                          <ul className="space-y-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
                            {sprintResult.achievements.map((a, i) => (
                              <li key={i} className="flex items-start gap-2 text-content text-sm">
                                <span className="text-emerald-500 font-bold shrink-0">·</span>{a}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {(sprintResult.risks.length > 0 || sprintResult.blockers.length > 0) && (
                          <div className="space-y-2 pt-2">
                            <div className="flex items-center gap-2">
                              <ShieldAlert className="h-4 w-4 text-amber-400" />
                              <p className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">Risks & Blockers</p>
                            </div>
                            <ul className="space-y-2">
                              {sprintResult.risks.map((r, i) => (
                                <li key={`risk-${i}`} className="flex items-start gap-2 text-content text-sm bg-amber-500/5 border border-amber-500/10 p-2 rounded">
                                  <span className="text-amber-500 font-bold shrink-0 mt-0.5">!</span>{r}
                                </li>
                              ))}
                              {sprintResult.blockers.map((b, i) => (
                                <li key={`block-${i}`} className="flex items-start gap-2 text-content text-sm bg-danger/5 border border-danger/10 p-2 rounded">
                                  <span className="text-danger font-bold shrink-0 mt-0.5">✕</span>{b}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {sprintResult.nextSprintPlan.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-blue-400" />
                              <p className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">Next Sprint Focus</p>
                            </div>
                            <ul className="space-y-2">
                              {sprintResult.nextSprintPlan.map((n, i) => (
                                <li key={i} className="flex items-start gap-2 text-content text-sm">
                                  <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />{n}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Daily Plan */}
                    {activeView === 'plan' && dailyPlanResult && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-content-muted">Suggested Schedule</p>
                          <Badge variant="secondary" className="px-2 py-0.5 text-[10px]">{dailyPlanResult.plan.length} tasks</Badge>
                        </div>
                        {dailyPlanResult.plan.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 gap-3 border border-dashed border-border-subtle rounded-xl bg-surface/30">
                            <CheckCircle2 className="h-8 w-8 text-emerald-500/30" />
                            <p className="text-sm font-medium text-content-secondary">No pending tasks to schedule today.</p>
                          </div>
                        ) : (
                          <div className="relative space-y-3">
                            <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border-subtle" />
                            {dailyPlanResult.plan.map((item, i) => (
                              <div key={i} className="relative flex items-start gap-3">
                                <div className="h-8 w-8 rounded-full bg-surface border-2 border-border-subtle flex items-center justify-center shrink-0 z-10 shadow-sm text-xs font-bold text-primary">
                                  {i + 1}
                                </div>
                                <div className="flex-1 min-w-0 p-3 rounded-xl bg-surface border border-border-subtle hover:border-border-focus transition-colors">
                                  <p className="text-sm font-semibold text-content mb-1.5">{item.title}</p>
                                  <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                                      <Clock className="h-3 w-3" />
                                      {item.estimatedDuration}h
                                    </span>
                                    <span className="text-xs text-content-secondary truncate flex-1">{item.reason}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Task Breakdown */}
                    {activeView === 'breakdown' && breakdownResult && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-end border-b border-border-subtle pb-3">
                          <div>
                            <p className="text-[10px] font-bold text-content-muted uppercase tracking-widest mb-1">Generated Checklist</p>
                            <p className="text-sm font-medium text-content">{breakdownResult.subtasks.length} subtasks identified</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-content-muted uppercase tracking-widest mb-1">Total Effort</p>
                            <span className="text-sm font-bold text-primary">{breakdownResult.estimatedEffort}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 pt-1">
                          {breakdownResult.subtasks.map((sub, i) => (
                            <div key={i} className="group flex items-start gap-3 p-3 rounded-xl bg-surface border border-border-subtle hover:border-primary/30 transition-colors">
                              <div className="mt-0.5 h-4 w-4 rounded flex items-center justify-center border border-border-subtle bg-background shrink-0 text-content-muted group-hover:border-primary/50 group-hover:text-primary transition-colors">
                                <CheckCircle2 className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-content font-medium leading-snug">{sub.title}</p>
                              </div>
                              <span className="text-xs font-medium text-content-secondary bg-background px-2 py-1 rounded-md border border-border-subtle shrink-0">
                                {sub.estimatedHours}h
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
};

export default AIPanel;
