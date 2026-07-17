import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Activity, CheckCircle2, Zap, Brain, TrendingUp, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const FEATURES = [
  {
    icon: CheckCircle2,
    title: 'Project & Task Tracking',
    desc: 'Kanban boards with priority queues, due dates, and smart filters.',
  },
  {
    icon: Brain,
    title: 'AI Copilot Workspace',
    desc: 'Gemini-powered health analysis, sprint summaries, and daily plans.',
  },
  {
    icon: TrendingUp,
    title: 'Executive Analytics',
    desc: 'Real-time charts on project velocity, completion rates, and burndown.',
  },
  {
    icon: Zap,
    title: 'Fast & Reliable',
    desc: 'JWT-secured, MongoDB Atlas backed. Production-grade from day one.',
  },
];

const TESTIMONIALS = [
  { text: '"Cut our sprint planning time by 60%."', author: 'Product Manager' },
  { text: '"The AI daily plan feature is genuinely useful."', author: 'Full-Stack Developer' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
};

const lineVariants = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: { opacity: 1, scaleX: 1, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
};

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30, delay: 0.2 } },
};

export const AuthLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/40">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-content-muted" />
        </motion.div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen w-screen overflow-x-hidden text-content">
      {/* ===== LEFT MARKETING PANEL ===== */}
      <div className="relative hidden lg:flex flex-col justify-between w-[50%] max-w-[700px] shrink-0 overflow-hidden border-r border-border-subtle bg-background/50">
        {/* Background layers */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,1) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12 xl:p-16">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary-hover shadow-lg shadow-primary/40 border border-primary/50">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-content">TaskFlow AI</span>
          </motion.div>

          {/* Hero copy */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-20 mb-12 space-y-6 max-w-md"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary uppercase tracking-wider">AI-Powered Workspace</span>
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-5xl font-extrabold tracking-tight text-content leading-[1.1]">
              Ship projects <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover">smarter and faster.</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-base text-content-secondary leading-relaxed font-medium">
              A premium workspace for developers and teams. Track tasks, analyze progress, and let AI plan your next sprint.
            </motion.p>
          </motion.div>

          {/* Feature list */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5 mb-16"
          >
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <motion.div key={feat.title} variants={itemVariants} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface border border-border-subtle shadow-sm">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="pt-0.5">
                    <div className="text-sm font-semibold text-content">{feat.title}</div>
                    <div className="text-sm text-content-secondary mt-0.5 leading-relaxed">{feat.desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Footer */}
          <div className="mt-auto text-xs text-content-muted font-medium border-t border-border-subtle pt-6">
            © 2026 TaskFlow AI. Competing with the best.
          </div>
        </div>
      </div>

      {/* ===== RIGHT AUTH PANEL ===== */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10 relative">
        {/* Mobile logo */}
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-content">TaskFlow AI</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
          className="w-full max-w-[420px]"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
