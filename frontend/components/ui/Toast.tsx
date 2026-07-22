'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSentinelStore } from '../../store/useSentinelStore';
import { Icon } from './Icon';

export const ToastContainer: React.FC = () => {
  const toasts = useSentinelStore((state) => state.toasts);
  const removeToast = useSentinelStore((state) => state.removeToast);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Icon name="shield-check" color="%2322C55E" className="w-5 h-5" />;
      case 'warning':
        return <Icon name="alert-triangle" color="%23FACC15" className="w-5 h-5" />;
      case 'error':
        return <Icon name="alert-octagon" color="%23FF3B30" className="w-5 h-5" />;
      default:
        return <Icon name="info" color="%23A1A1AA" className="w-5 h-5" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-success/30';
      case 'warning':
        return 'border-warning/30';
      case 'error':
        return 'border-primary/40 shadow-red-glow';
      default:
        return 'border-white/10';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl bg-[#111111]/90 backdrop-blur-xl border ${getBorderColor(
              toast.type
            )} shadow-2xl`}
          >
            <div className="mt-0.5 shrink-0">{getIcon(toast.type)}</div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white tracking-tight">
                {toast.title}
              </h4>
              <p className="text-xs text-accent mt-0.5 leading-relaxed">
                {toast.description}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-accent hover:text-white transition-colors"
            >
              <Icon name="x" className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
