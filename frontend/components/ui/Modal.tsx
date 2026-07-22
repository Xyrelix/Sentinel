'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-[#111111] border border-[#1E1E1E] shadow-2xl p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1E1E1E]">
              <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-accent hover:text-white hover:bg-white/10 transition-colors"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="py-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
