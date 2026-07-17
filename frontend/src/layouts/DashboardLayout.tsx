import React, { useState, useEffect } from 'react';
import { getProjects } from '../services/projectService';
import { Project } from '../types';
import { Link, useLocation, useNavigate, useParams, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  BarChart3,
  Brain,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  X,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Settings as SettingsIcon,
} from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { GlobalSearch } from '../components/ui/GlobalSearch';
import { NotificationDropdown } from '../components/ui/NotificationDropdown';
import { cn } from '../utils/cn';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const fetched = await getProjects();
        setProjects(fetched.filter((p) => p.status === 'Active'));
      } catch (err) {
        console.error('Failed to load projects in sidebar:', err);
      }
    };
    loadProjects();
  }, [location.pathname]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'AI Planner', path: '/ai-planner', icon: Brain },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const crumbs: { label: string; path?: string }[] = [{ label: 'Home', path: '/' }];

    if (paths.length === 0) {
      crumbs.push({ label: 'Overview' });
      return crumbs;
    }

    if (paths[0] === 'analytics') crumbs.push({ label: 'Analytics' });
    else if (paths[0] === 'ai-planner') crumbs.push({ label: 'AI Planner' });
    else if (paths[0] === 'settings') crumbs.push({ label: 'Settings' });
    else if (paths[0] === 'projects' && paths[1]) {
      const activeProj = projects.find((p) => p._id === paths[1]);
      crumbs.push({ label: 'Projects', path: '/' });
      crumbs.push({ label: activeProj ? activeProj.title : 'Project Board' });
    } else {
      crumbs.push({ label: paths[0].charAt(0).toUpperCase() + paths[0].slice(1) });
    }
    return crumbs;
  };

  const renderSidebarContent = (forceOpenLabels = false) => {
    const showLabels = !isCollapsed || forceOpenLabels;

    return (
      <div className="flex h-full flex-col bg-transparent">
        {/* Logo area */}
        <div className={cn("flex items-center px-4 h-14 shrink-0 transition-all", showLabels ? "justify-between" : "justify-center")}>
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary shadow-md shadow-primary/30">
              <Activity className="h-4 w-4 text-content-inverse" />
            </div>
            {showLabels && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm font-bold tracking-tight text-content whitespace-nowrap"
              >
                TaskFlow AI
              </motion.span>
            )}
          </Link>
          {showLabels && !forceOpenLabels && (
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex items-center justify-center h-6 w-6 rounded-md hover:bg-surface-hover text-content-muted hover:text-content transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Nav section */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.path);
              
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    'relative flex items-center rounded-xl transition-all duration-300 group h-10',
                    showLabels ? 'px-3' : 'justify-center',
                    isActive
                      ? 'text-content bg-surface-hover font-medium shadow-sm border border-border-subtle'
                      : 'text-content-secondary hover:text-content hover:bg-surface hover:translate-x-[3px]'
                  )}
                  title={!showLabels ? link.name : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={cn('h-4 w-4 shrink-0 transition-colors', isActive ? 'text-primary' : 'text-content-muted group-hover:text-content-secondary')} />
                  {showLabels && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="ml-3 text-sm truncate"
                    >
                      {link.name}
                    </motion.span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Projects section */}
          <div className="space-y-1">
            {showLabels ? (
              <div className="px-3 mb-2 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-content-muted">Your Projects</span>
              </div>
            ) : (
              <div className="mx-3 h-px bg-border-subtle my-2" />
            )}

            <div className="max-h-64 overflow-y-auto space-y-1 scrollbar-none">
              {projects.map((proj) => {
                const isActive = projectId === proj._id;
                return (
                  <Link
                    key={proj._id}
                    to={`/projects/${proj._id}`}
                    className={cn(
                      'relative flex items-center rounded-xl transition-all duration-300 group h-10',
                      showLabels ? 'px-3' : 'justify-center',
                      isActive
                        ? 'bg-surface-hover text-content font-medium shadow-sm border border-border-subtle'
                        : 'text-content-secondary hover:text-content hover:bg-surface hover:translate-x-[3px]'
                    )}
                    title={proj.title}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeProject"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: proj.color, boxShadow: isActive ? `0 0 8px ${proj.color}80` : 'none' }}
                    />
                    {showLabels && (
                      <span className="ml-3 text-sm truncate">{proj.title}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer / User section */}
        <div className="border-t border-border-subtle p-3 shrink-0">
          <div className={cn("flex items-center", showLabels ? "justify-between" : "flex-col gap-3")}>
            <div className="flex items-center gap-3 min-w-0">
              <Avatar 
                fallback={user?.fullName || 'User'} 
                size="md" 
                className="ring-1 ring-border-subtle"
              />
              {showLabels && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-content truncate">
                    {user?.fullName || 'User'}
                  </p>
                  <p className="text-[10px] text-content-muted truncate">
                    Workspace Owner
                  </p>
                </div>
              )}
            </div>
            
            <div className={cn("flex items-center", showLabels ? "gap-2" : "flex-col gap-2")}>
              {isCollapsed && !forceOpenLabels ? (
                <button
                  onClick={toggleCollapse}
                  className="p-2.5 rounded-full hover:bg-surface-hover text-content-muted hover:text-content transition-colors apple-hover"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-full hover:bg-danger/10 text-content-muted hover:text-danger transition-colors apple-hover"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden text-content font-sans selection:bg-primary/30">
      {/* Desktop Sidebar (Floating effect) */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 88 : 260 }}
        className="hidden lg:flex shrink-0 h-full py-6 pl-6"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="w-full h-full rounded-[24px] border border-border-subtle bg-panel backdrop-blur-2xl overflow-hidden flex flex-col shadow-2xl">
          {renderSidebarContent()}
        </div>
      </motion.aside>

      {/* Main Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 relative">
        {/* Top Navbar */}
        <header className="flex h-16 shrink-0 items-center justify-between px-6 gap-4 z-10">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle text-content-muted hover:text-content hover:bg-surface-hover transition-colors lg:hidden shrink-0"
            >
              <Menu className="h-4 w-4" />
            </button>

            <nav className="hidden sm:flex items-center gap-2 text-sm text-content-secondary min-w-0 font-medium">
              {getBreadcrumbs().map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-content-muted" />}
                  {crumb.path ? (
                    <Link to={crumb.path} className="hover:text-content transition-colors truncate">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-content truncate">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:block">
              <GlobalSearch />
            </div>

            <Link
              to="/ai-planner"
              className="hidden sm:flex items-center gap-1.5 h-10 rounded-full border border-primary/20 bg-primary/10 hover:bg-primary/20 px-4 text-xs font-semibold text-primary transition-colors cursor-pointer shadow-sm apple-hover backdrop-blur-md"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Active</span>
            </Link>

            <NotificationDropdown />

            <button
              onClick={toggleTheme}
              className="p-2.5 h-10 w-10 flex items-center justify-center rounded-full bg-surface-hover backdrop-blur-md border border-border-subtle shadow-sm hover:bg-surface text-content-secondary hover:text-content transition-colors apple-hover"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 pt-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full max-w-[1600px] mx-auto rounded-[24px] border border-border-subtle bg-surface/60 overflow-hidden shadow-2xl relative backdrop-blur-md"
          >
            <div className="relative z-10 h-full overflow-y-auto custom-scrollbar p-8">
              <Outlet />
            </div>
          </motion.div>
        </main>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-[280px] h-full shadow-2xl shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {renderSidebarContent(true)}
            </motion.div>
            <div className="flex-1 flex items-start justify-end p-4">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="mt-2 p-2 rounded-full bg-surface border border-border-subtle text-content-secondary hover:text-content"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;
