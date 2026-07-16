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
} from 'lucide-react';

interface AIPanelProps {
  projectId: string;
}

type AIView = 'none' | 'health' | 'sprint' | 'plan' | 'breakdown';

const ACTION_BUTTONS: { view: AIView; icon: React.ReactNode; label: string; desc: string }[] = [
  { view: 'health', icon: <Heart className="h-4 w-4" />, label: 'Project Health', desc: 'Score the project health and risk level' },
  { view: 'sprint', icon: <Zap className="h-4 w-4" />, label: 'Sprint Summary', desc: 'Achievements, risks, and next milestones' },
  { view: 'plan', icon: <ListTodo className="h-4 w-4" />, label: 'Daily Plan', desc: 'Priority-sorted task schedule for today' },
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
      case 'Low':    return { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25', bar: 'bg-emerald-500' };
      case 'Medium': return { color: 'text-amber-400 bg-amber-500/10 border-amber-500/25', bar: 'bg-amber-500' };
      case 'High':   return { color: 'text-red-400 bg-red-500/10 border-red-500/25', bar: 'bg-red-500' };
      default:       return { color: 'text-zinc-400 bg-zinc-800', bar: 'bg-zinc-500' };
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900 overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-800/60">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 border border-indigo-500/25">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-200">AI Copilot</p>
          <p className="text-[10px] text-zinc-600">Powered by Google Gemini</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Action buttons */}
        {ACTION_BUTTONS.map((btn) => (
          <button
            key={btn.view}
            onClick={() => handleAction(btn.view)}
            disabled={loading}
            className={[
              'w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-150',
              activeView === btn.view
                ? 'border-indigo-500/40 bg-indigo-500/8 text-indigo-300'
                : 'border-zinc-800 bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800',
              loading ? 'opacity-60 cursor-not-allowed' : '',
            ].join(' ')}
          >
            <div className={`shrink-0 ${activeView === btn.view ? 'text-indigo-400' : 'text-zinc-600'}`}>
              {btn.icon}
            </div>
            <div>
              <p className="text-xs font-semibold">{btn.label}</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">{btn.desc}</p>
            </div>
            {loading && activeView === btn.view && (
              <Loader2 className="h-3.5 w-3.5 animate-spin ml-auto text-indigo-400 shrink-0" />
            )}
          </button>
        ))}

        {/* Task Breakdown tool */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-3.5 space-y-2.5">
          <div className="flex items-center gap-2">
            <Brain className="h-3.5 w-3.5 text-zinc-600" />
            <span className="text-xs font-semibold text-zinc-400">Task Breakdown</span>
          </div>
          <input
            type="text"
            placeholder="e.g. Implement auth middleware"
            value={breakdownTitle}
            onChange={(e) => setBreakdownTitle(e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-700 focus:border-indigo-500 focus:outline-none transition-all disabled:opacity-50"
          />
          <button
            onClick={() => handleAction('breakdown')}
            disabled={loading || !breakdownTitle.trim()}
            className={[
              'w-full rounded-lg py-2 text-xs font-semibold transition-all',
              activeView === 'breakdown' && !loading
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300',
              'disabled:opacity-40 disabled:cursor-not-allowed',
            ].join(' ')}
          >
            {loading && activeView === 'breakdown' ? 'Analyzing...' : 'Break Down Task'}
          </button>
        </div>

        {/* Result output box */}
        {activeView !== 'none' && (
          <div className="border-t border-zinc-800/60 pt-3 space-y-3">
            {/* Result header */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">AI Output</span>
              {!loading && !error && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={copyToClipboard}
                    className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 transition-colors"
                    title="Copy"
                  >
                    {copied ? <ClipboardCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => handleAction(activeView)}
                    className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 transition-colors"
                    title="Regenerate"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center py-10 gap-3">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                </div>
                <p className="text-xs text-zinc-500 animate-pulse">Gemini analyzing...</p>
              </div>
            ) : error ? (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/8 p-3 text-xs text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-800/60 bg-zinc-950 p-4 space-y-4 max-h-72 overflow-y-auto kanban-scroll text-xs">
                {/* Health Result */}
                {activeView === 'health' && healthResult && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold text-white">{healthResult.healthScore}%</p>
                        <p className="text-[10px] text-zinc-500">Health Score</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${getRiskConfig(healthResult.riskLevel).color}`}>
                        {healthResult.riskLevel} Risk
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${getRiskConfig(healthResult.riskLevel).bar}`} style={{ width: `${healthResult.healthScore}%` }} />
                    </div>
                    <p className="text-zinc-400 leading-relaxed">{healthResult.summary}</p>
                    {healthResult.criticalTasks.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">Critical Tasks</p>
                        <ul className="space-y-1">
                          {healthResult.criticalTasks.map((t, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-zinc-400"><span className="text-zinc-700 shrink-0">•</span>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {healthResult.recommendations.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-zinc-900">
                        <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">Recommendations</p>
                        <ul className="space-y-1">
                          {healthResult.recommendations.map((r, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-zinc-400"><span className="text-zinc-700 shrink-0">→</span>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Sprint Summary */}
                {activeView === 'sprint' && sprintResult && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Achievements</p>
                      <ul className="space-y-1">
                        {sprintResult.achievements.map((a, i) => <li key={i} className="flex items-start gap-1.5 text-zinc-400"><CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />{a}</li>)}
                      </ul>
                    </div>
                    {(sprintResult.risks.length > 0 || sprintResult.blockers.length > 0) && (
                      <div className="space-y-1 pt-2 border-t border-zinc-900">
                        <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Risks & Blockers</p>
                        <ul className="space-y-1">
                          {sprintResult.risks.map((r, i) => <li key={i} className="text-zinc-400 flex items-start gap-1.5"><span className="text-amber-700">!</span>{r}</li>)}
                          {sprintResult.blockers.map((b, i) => <li key={i} className="text-red-400 flex items-start gap-1.5"><span className="text-red-700">✕</span>{b}</li>)}
                        </ul>
                      </div>
                    )}
                    {sprintResult.nextSprintPlan.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-zinc-900">
                        <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">Next Sprint</p>
                        <ul className="space-y-1">
                          {sprintResult.nextSprintPlan.map((n, i) => <li key={i} className="flex items-start gap-1.5 text-zinc-400"><TrendingUp className="h-3 w-3 text-indigo-500 shrink-0 mt-0.5" />{n}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Daily Plan */}
                {activeView === 'plan' && dailyPlanResult && (
                  <div className="space-y-2">
                    {dailyPlanResult.plan.length === 0 ? (
                      <div className="flex flex-col items-center py-6 gap-2">
                        <CheckCircle2 className="h-6 w-6 text-emerald-500/40" />
                        <p className="text-zinc-600">No pending tasks to schedule.</p>
                      </div>
                    ) : (
                      dailyPlanResult.plan.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                          <span className="text-[10px] font-bold text-indigo-400 shrink-0 mt-0.5 w-5">{i + 1}.</span>
                          <div className="min-w-0">
                            <p className="font-semibold text-zinc-200 truncate">{item.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1 text-zinc-600"><Clock className="h-2.5 w-2.5" />{item.estimatedDuration}h</span>
                              <span className="text-zinc-600 truncate">{item.reason}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Task Breakdown */}
                {activeView === 'breakdown' && breakdownResult && (
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Subtask Checklist</p>
                      <span className="text-xs font-semibold text-indigo-400">{breakdownResult.estimatedEffort}</span>
                    </div>
                    {breakdownResult.subtasks.map((sub, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                        <span className="text-zinc-300 font-medium truncate pr-2">{sub.title}</span>
                        <span className="text-zinc-600 shrink-0">{sub.estimatedHours}h</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPanel;
