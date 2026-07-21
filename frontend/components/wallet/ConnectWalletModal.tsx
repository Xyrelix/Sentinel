'use client';

import React from 'react';
import { Modal } from '../ui/Modal';
import { useSentinelStore } from '../../store/useSentinelStore';
import { Shield, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const ConnectWalletModal: React.FC = () => {
  const isOpen = useSentinelStore((state) => state.isConnectModalOpen);
  const setOpen = useSentinelStore((state) => state.setConnectModalOpen);
  const connectWallet = useSentinelStore((state) => state.connectWallet);
  const wallet = useSentinelStore((state) => state.wallet);

  const wallets = [
    { id: 'okx', name: 'OKX Wallet', icon: '⚡', desc: 'Recommended for X Layer Native Protection', badge: 'Popular' },
    { id: 'metamask', name: 'MetaMask', icon: '🦊', desc: 'Connect using Browser Extension' },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵', desc: 'Self-custody mobile & desktop' },
    { id: 'walletconnect', name: 'WalletConnect', icon: '🔗', desc: 'Scan QR code with any mobile wallet' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={() => setOpen(false)} title="Connect Web3 Wallet">
      <div className="space-y-4">
        <p className="text-xs text-accent leading-relaxed">
          Select your Web3 wallet provider to initialize Sentinel&apos;s real-time pre-sign AI scanner on OKX X Layer.
        </p>

        <div className="grid gap-2.5">
          {wallets.map((w) => (
            <motion.button
              key={w.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={connectWallet}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#161616] border border-[#1E1E1E] hover:border-primary/50 hover:bg-[#1A1A1A] transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{w.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                      {w.name}
                    </span>
                    {w.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">
                        {w.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-accent">{w.desc}</p>
                </div>
              </div>
              {wallet.isConnected && w.id === 'okx' ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-primary transition-colors" />
              )}
            </motion.button>
          ))}
        </div>

        <div className="pt-3 border-t border-[#1E1E1E] flex items-center justify-between text-xs text-accent">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-primary" />
            <span>AI Shield Status: Active</span>
          </div>
          <span className="text-white/60">OKX X Layer (Chain ID: 196)</span>
        </div>
      </div>
    </Modal>
  );
};
