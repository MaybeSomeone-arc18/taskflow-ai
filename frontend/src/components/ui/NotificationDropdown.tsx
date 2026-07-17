import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Check, Trash2, CheckCircle2, MessageSquare, Briefcase, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications, Notification } from '../../context/NotificationContext';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const toggleDropdown = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: `${rect.bottom + 12}px`,
        right: `${window.innerWidth - rect.right - 8}px`,
        zIndex: 9999,
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Don't close if clicking the button itself
      if (buttonRef.current && buttonRef.current.contains(e.target as Node)) {
        return;
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // in seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 172800) return 'Yesterday';
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'project': return <Briefcase className="h-4 w-4 text-primary" />;
      case 'task': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'ai': return <Bot className="h-4 w-4 text-purple-500" />;
      default: return <MessageSquare className="h-4 w-4 text-content-muted" />;
    }
  };

  return (
    <>
      <button 
        ref={buttonRef}
        onClick={toggleDropdown}
        className="relative p-2.5 h-10 w-10 flex items-center justify-center rounded-full bg-surface-hover backdrop-blur-md border border-border-subtle shadow-sm hover:bg-surface text-content-secondary hover:text-content transition-all apple-hover"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
        )}
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-80 md:w-[380px] rounded-[18px] border border-border-subtle bg-panel backdrop-blur-xl shadow-2xl overflow-hidden origin-top-right flex flex-col max-h-[85vh]"
            >
            {/* Header */}
            <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-surface/50 shrink-0">
              <h3 className="font-semibold text-content flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-primary/10 text-primary text-xs py-0.5 px-2 rounded-full font-medium">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-content-muted hover:text-content transition-colors flex items-center gap-1.5 font-medium"
                >
                  <Check className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
            </div>

            {/* Content */}
            <div className="overflow-y-auto custom-scrollbar flex-1 py-1 min-h-[100px] bg-surface">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center mb-3">
                    <Bell className="h-5 w-5 text-content-muted" />
                  </div>
                  <p className="text-sm font-medium text-content-secondary">No notifications yet</p>
                  <p className="text-xs text-content-muted mt-1">We'll let you know when something happens.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={`group relative p-4 hover:bg-surface-hover transition-colors border-b border-border-subtle last:border-0 ${
                      !notif.isRead ? 'bg-primary/5' : ''
                    }`}
                  >
                    {!notif.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
                    )}
                    <div className="flex gap-3">
                      <div className="shrink-0 mt-1 bg-surface p-2 rounded-lg border border-border-subtle shadow-sm">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <p className="text-sm font-medium text-content mb-0.5 line-clamp-1">{notif.title}</p>
                        <p className="text-xs text-content-secondary line-clamp-2 leading-relaxed">{notif.message}</p>
                        <p className="text-[10px] font-semibold text-content-muted mt-2 uppercase tracking-wider">
                          {formatTimeAgo(notif.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Hover actions */}
                    <div className="absolute right-3 top-4 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notif.isRead && (
                        <button 
                          onClick={() => markAsRead(notif.id)}
                          className="p-1.5 text-content-muted hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                          title="Mark as read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notif.id)}
                        className="p-1.5 text-content-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </>
  );
};
