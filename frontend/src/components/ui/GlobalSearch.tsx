import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, Loader2, Briefcase, CheckCircle2, History, X, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../../services/projectService';
import { getTasks } from '../../services/taskService';
import { Project, Task } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

export const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{ projects: Project[]; tasks: Task[] }>({ projects: [], tasks: [] });
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('taskflow_recent_searches');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // focus input when opened
      setTimeout(() => inputRef.current?.focus(), 10);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Perform search
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults({ projects: [], tasks: [] });
        return;
      }
      setIsSearching(true);
      try {
        const [allProjects, tasksResponse] = await Promise.all([
          getProjects(),
          getTasks({ search: debouncedQuery, limit: 10 })
        ]);

        const lowerQuery = debouncedQuery.toLowerCase();
        const filteredProjects = allProjects.filter(p => 
          p.title.toLowerCase().includes(lowerQuery) || 
          p.description?.toLowerCase().includes(lowerQuery)
        );

        setResults({ projects: filteredProjects.slice(0, 5), tasks: tasksResponse.tasks });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };
    performSearch();
  }, [debouncedQuery]);

  const saveRecentSearch = (q: string) => {
    if (!q.trim()) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== q);
      const newRecent = [q, ...filtered].slice(0, 5);
      localStorage.setItem('taskflow_recent_searches', JSON.stringify(newRecent));
      return newRecent;
    });
  };

  const handleNavigate = (path: string) => {
    saveRecentSearch(query);
    setIsOpen(false);
    navigate(path);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (results.projects.length > 0) {
        handleNavigate(`/project/${results.projects[0]._id}`);
      } else if (results.tasks.length > 0) {
        // Find task's project
        handleNavigate(`/project/${results.tasks[0].projectId}`);
      } else if (debouncedQuery.trim()) {
        saveRecentSearch(debouncedQuery);
      }
    }
  };

  // Highlighting text logic
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="bg-blue-500/20 text-blue-400 rounded-sm px-0.5">{part}</span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-surface-hover backdrop-blur-md hover:bg-surface transition-all border border-border-subtle shadow-sm apple-hover rounded-full px-4 h-10 cursor-text w-64 group"
      >
        <Search className="h-4 w-4 text-content-muted group-hover:text-content-secondary transition-colors" />
        <span className="text-sm text-content-muted group-hover:text-content-secondary transition-colors flex-1 select-none">
          Search anything...
        </span>
        <div className="flex items-center gap-1">
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-surface px-1.5 font-mono text-[10px] font-medium text-content-muted h-5 border border-border-subtle">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>
      </div>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/35 backdrop-blur-[10px]"
              />
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative w-[90%] max-w-[760px] bg-panel border border-border-subtle shadow-2xl rounded-[20px] overflow-hidden flex flex-col max-h-[70vh]"
                ref={searchRef}
              >
                {/* Input Header */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-border-subtle bg-surface">
                  <Search className="h-5 w-5 text-primary shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search projects, tasks, or type a command..."
                    className="flex-1 bg-transparent border-none outline-none text-content placeholder:text-content-muted text-lg"
                  />
                {isSearching ? (
                  <Loader2 className="h-5 w-5 text-content-muted animate-spin shrink-0" />
                ) : (
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-md text-content-muted hover:text-content hover:bg-surface-hover transition-colors shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Results Body */}
              <div className="overflow-y-auto custom-scrollbar p-2 flex-1 bg-surface">
                {!query.trim() ? (
                  <div className="p-4">
                    {recentSearches.length > 0 ? (
                      <div>
                        <h4 className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-2 px-2">
                          Recent Searches
                        </h4>
                        <div className="space-y-1">
                          {recentSearches.map((s, idx) => (
                            <button
                              key={idx}
                              onClick={() => setQuery(s)}
                              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-content-secondary hover:text-content hover:bg-surface-hover rounded-xl transition-colors"
                            >
                              <History className="h-4 w-4 text-content-muted" />
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Search className="h-10 w-10 text-content-muted mx-auto mb-4" />
                        <p className="text-content-secondary font-medium">Start typing to search</p>
                        <p className="text-content-muted text-sm mt-1">Press <kbd className="font-mono text-xs bg-surface-hover px-1 py-0.5 rounded border border-border-subtle">Enter</kbd> to jump to the first result.</p>
                      </div>
                    )}
                  </div>
                ) : results.projects.length === 0 && results.tasks.length === 0 && !isSearching ? (
                  <div className="text-center py-12">
                    <p className="text-content-secondary font-medium">No matching results for "{query}"</p>
                    <p className="text-content-muted text-sm mt-1">Try searching for something else.</p>
                  </div>
                ) : (
                  <div className="space-y-4 p-2">
                    {results.projects.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-2 px-2">Projects</h4>
                        <div className="space-y-1">
                          {results.projects.map(project => (
                            <button
                              key={project._id}
                              onClick={() => handleNavigate(`/project/${project._id}`)}
                              className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-surface-hover rounded-xl transition-colors text-left group/item"
                            >
                              <div className="mt-0.5 shrink-0 bg-surface p-1.5 rounded-lg border border-border-subtle shadow-sm">
                                <Briefcase className="h-4 w-4" style={{ color: project.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-content line-clamp-1">
                                  {highlightText(project.title, debouncedQuery)}
                                </p>
                                {project.description && (
                                  <p className="text-xs text-content-secondary line-clamp-1 mt-0.5">
                                    {highlightText(project.description, debouncedQuery)}
                                  </p>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {results.tasks.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-2 px-2 mt-4">Tasks</h4>
                        <div className="space-y-1">
                          {results.tasks.map(task => (
                            <button
                              key={task._id}
                              onClick={() => handleNavigate(`/project/${task.projectId}`)}
                              className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-surface-hover rounded-xl transition-colors text-left group/item"
                            >
                              <div className="mt-0.5 shrink-0 bg-surface p-1.5 rounded-lg border border-border-subtle shadow-sm">
                                <CheckCircle2 className={`h-4 w-4 ${task.status === 'Completed' ? 'text-emerald-500' : 'text-content-muted'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-content line-clamp-1 flex items-center gap-2">
                                  {highlightText(task.title, debouncedQuery)}
                                  <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm border ${
                                    task.priority === 'Critical' ? 'bg-danger/10 text-danger border-danger/20' :
                                    task.priority === 'High' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                    task.priority === 'Medium' ? 'bg-primary/10 text-primary border-primary/20' :
                                    'bg-border-subtle/50 text-content-muted border-border-subtle'
                                  }`}>
                                    {task.priority}
                                  </span>
                                </p>
                                {task.description && (
                                  <p className="text-xs text-content-secondary line-clamp-1 mt-0.5">
                                    {highlightText(task.description, debouncedQuery)}
                                  </p>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};
