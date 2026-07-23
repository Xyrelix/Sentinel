'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X, ShieldOff } from 'lucide-react';
import { useSentinelStore } from '../../store/useSentinelStore';

interface DisconnectConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisconnectConfirmModal: React.FC<DisconnectConfirmModalProps> = ({
  isOpen,
  onClose,
}) => {
  const disconnectWallet = useSentinelStore((state) => state.disconnectWallet);
  const wallet = useSentinelStore((state) => state.wallet);

  const handleConfirm = () => {
    disconnectWallet();
    onClose();
  };

  React.useEffect(() => {
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

  const short = wallet.address
    ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
    : '';

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

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-[#111111] border border-[#1E1E1E] shadow-2xl p-6"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-lg text-accent hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
              <ShieldOff className="w-6 h-6 text-red-400" />
            </div>

            {/* Copy */}
            <h3 className="text-lg font-bold text-white mb-1">Disconnect Wallet?</h3>
            <p className="text-sm text-accent leading-relaxed mb-1">
              You are about to disconnect
            </p>
            {short && (
              <p className="text-xs font-mono text-white/60 bg-white/5 rounded-lg px-3 py-1.5 mb-4 border border-white/10 w-fit">
                {short}
              </p>
            )}
            <p className="text-xs text-accent/70 leading-relaxed mb-6">
              Sentinel&apos;s AI shield will be paused and your session will be closed. You can reconnect at any time.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500/90 hover:bg-red-500 text-white flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
