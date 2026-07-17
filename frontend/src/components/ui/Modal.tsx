import React from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

const maxWidths = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
  footer,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            className={cn(
              "relative w-full rounded-[24px] border border-border-subtle bg-panel shadow-2xl flex flex-col max-h-[90vh] overflow-hidden",
              maxWidths[maxWidth]
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div className="flex items-start justify-between p-6 pb-4 border-b border-border-subtle shrink-0">
                <div>
                  <h2 className="text-lg font-semibold text-content tracking-tight">{title}</h2>
                  {subtitle && <p className="text-sm text-content-secondary mt-1">{subtitle}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 -mr-2 text-content-secondary hover:text-content hover:bg-surface-hover transition-colors shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {children}
            </div>

            {footer && (
              <div className="p-6 pt-4 border-t border-border-subtle shrink-0 bg-surface">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
