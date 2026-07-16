import React, { useState, useEffect } from 'react';
import { getProjects } from '../services/projectService';
import { Project } from '../types';
import { Link, useLocation, useNavigate, useParams, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import {
  Activity,
  BarChart3,
  Brain,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Plus,
  Settings as SettingsIcon,
  Sun,
  X,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FolderOpen,
  Hash,
} from 'lucide-react';

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
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'AI Suite', path: '/ai-planner', icon: Brain },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const crumbs: { label: string; path?: string }[] = [{ label: 'Home', path: '/' }];

    if (paths.length === 0) {
      crumbs.push({ label: 'Dashboard' });
      return crumbs;
    }

    if (paths[0] === 'analytics') crumbs.push({ label: 'Analytics' });
    else if (paths[0] === 'ai-planner') crumbs.push({ label: 'AI Suite' });
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

  const userInitial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';

  const SidebarContent = ({ forceOpenLabels = false }: { forceOpenLabels?: boolean }) => {
    const showLabels = !isCollapsed || forceOpenLabels;

    return (
      <div className="flex h-full flex-col bg-zinc-950 border-r border-zinc-900">
        {/* Logo area */}
        <div className={`flex items-center ${showLabels ? 'justify-between' : 'justify-center'} px-4 h-14 border-b border-zinc-900 shrink-0`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 shadow-md shadow-indigo-900/50">
              <Activity className="h-3.5 w-3.5 text-white" />
            </div>
            {showLabels && (
              <span className="text-sm font-bold tracking-tight text-white truncate">TaskFlow AI</span>
            )}
          </div>
          {showLabels && !forceOpenLabels && (
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex items-center justify-center h-6 w-6 rounded-md hover:bg-zinc-800 text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Nav section */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
          {/* Main nav */}
          <div className="space-y-0.5">
            {showLabels && (
              <div className="px-2 mb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-700">Navigation</span>
              </div>
            )}
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={[
                    'relative flex items-center rounded-lg transition-all duration-150 group',
                    showLabels ? 'gap-2.5 px-2.5 py-2' : 'justify-center p-2.5',
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-400'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900',
                  ].join(' ')}
                  title={!showLabels ? link.name : undefined}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-r-full" />
                  )}
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                  {showLabels && <span className="text-sm font-medium">{link.name}</span>}
                </Link>
              );
            })}
          </div>

          {/* Projects section */}
          <div className="space-y-0.5">
            {showLabels && (
              <div className="px-2 mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-700">Projects</span>
              </div>
            )}
            {!showLabels && (
              <div className="mx-2 h-px bg-zinc-900 my-1" />
            )}

            {projects.length === 0 && showLabels && (
              <div className="px-2.5 py-2 rounded-lg border border-dashed border-zinc-800 mx-0.5">
                <p className="text-xs text-zinc-700 text-center">No active projects</p>
              </div>
            )}

            <div className="max-h-48 overflow-y-auto space-y-0.5 kanban-scroll">
              {projects.map((proj) => {
                const isActive = projectId === proj._id;
                return (
                  <Link
                    key={proj._id}
                    to={`/projects/${proj._id}`}
                    className={[
                      'relative flex items-center rounded-lg transition-all duration-150 group',
                      showLabels ? 'gap-2.5 px-2.5 py-2' : 'justify-center p-2.5',
                      isActive
                        ? 'bg-zinc-800/70 text-zinc-200'
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900',
                    ].join(' ')}
                    title={proj.title}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-indigo-500 rounded-r-full" />
                    )}
                    <span
                      className="h-2 w-2 rounded-sm shrink-0"
                      style={{ backgroundColor: proj.color }}
                    />
                    {showLabels && (
                      <span className="text-xs font-medium truncate">{proj.title}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer / User section */}
        <div className="border-t border-zinc-900 p-3 shrink-0 space-y-2">
          {/* User profile row */}
          <div className={`flex items-center ${showLabels ? 'gap-2.5 justify-between' : 'justify-center'}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm">
                {userInitial}
              </div>
              {showLabels && (
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-zinc-300 truncate leading-tight">
                    {user?.fullName || 'User'}
                  </p>
                  <p className="text-[10px] text-zinc-600 truncate leading-tight mt-0.5">
                    {user?.email || ''}
                  </p>
                </div>
              )}
            </div>
            {showLabels && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-600 hover:text-red-400 transition-colors shrink-0"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Bottom controls */}
          <div className={`flex items-center ${showLabels ? 'justify-between' : 'flex-col gap-1.5'} border-t border-zinc-900/60 pt-2`}>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 transition-colors"
              title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>

            {isCollapsed && !forceOpenLabels ? (
              <button
                onClick={toggleCollapse}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 transition-colors"
                title="Expand sidebar"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="lg:hidden p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-600 hover:text-red-400 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Desktop Sidebar */}
      <aside
        className={[
          'hidden lg:block shrink-0 h-full transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-[56px]' : 'w-[220px]',
        ].join(' ')}
      >
        <SidebarContent />
      </aside>

      {/* Main Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Navbar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-900 bg-zinc-950 px-4 sm:px-6 gap-4">
          {/* Left: mobile hamburger + breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors lg:hidden shrink-0"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Breadcrumbs */}
            <nav className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-600 min-w-0">
              {getBreadcrumbs().map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-zinc-800">/</span>}
                  {crumb.path ? (
                    <Link to={crumb.path} className="hover:text-zinc-400 transition-colors truncate">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-zinc-300 font-semibold truncate">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Right: search + badge + notifications + user */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search bar mockup */}
            <div className="hidden md:flex items-center gap-2 h-8 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 px-3 text-zinc-600 cursor-not-allowed transition-colors">
              <Search className="h-3.5 w-3.5 text-zinc-700" />
              <span className="text-xs text-zinc-700 pr-4">Search...</span>
              <kbd className="text-[10px] font-mono border border-zinc-800 bg-zinc-950 px-1.5 py-0.5 rounded-md text-zinc-600">⌘K</kbd>
            </div>

            {/* AI Badge */}
            <div className="hidden sm:flex items-center gap-1.5 h-7 rounded-lg border border-indigo-500/20 bg-indigo-500/8 px-2.5 text-xs font-semibold text-indigo-400">
              <Sparkles className="h-3 w-3" />
              <span>AI</span>
            </div>

            {/* Notifications */}
            <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors">
              <Bell className="h-3.5 w-3.5" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500" />
            </button>

            {/* User avatar */}
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white cursor-default">
              {userInitial}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-zinc-950">
          <div className="p-6 max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
          <div
            className="relative w-[220px] h-full animate-slide-left shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent forceOpenLabels={true} />
          </div>
          <div className="flex-1 flex items-start justify-end p-4">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="mt-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
