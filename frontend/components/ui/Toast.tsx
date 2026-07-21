'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';
import { useSentinelStore } from '../../store/useSentinelStore';

export const ToastContainer: React.FC = () => {
  const toasts = useSentinelStore((state) => state.toasts);
  const removeToast = useSentinelStore((state) => state.removeToast);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <ShieldCheck className="w-5 h-5 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'error':
        return <AlertOctagon className="w-5 h-5 text-primary" />;
      default:
        return <Info className="w-5 h-5 text-accent" />;
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
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
