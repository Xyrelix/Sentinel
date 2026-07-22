'use client';

import React from 'react';
import { Modal } from '../ui/Modal';
import { useSentinelStore } from '../../store/useSentinelStore';
import { Shield, CheckCircle2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAvailableWallets, KNOWN_WALLETS, X_LAYER_CHAIN_ID } from '../../lib/web3';

const WALLET_ICONS: Record<string, string> = {
  'com.okex.wallet': '⚡',
  'io.metamask': '🦊',
  'com.coinbase.wallet': '🔵',
};

const WALLET_DESCRIPTIONS: Record<string, string> = {
  'com.okex.wallet': 'Recommended for X Layer Native Protection',
  'io.metamask': 'Connect using Browser Extension',
  'com.coinbase.wallet': 'Self-custody mobile & desktop',
};

export const ConnectWalletModal: React.FC = () => {
  const isOpen = useSentinelStore((state) => state.isConnectModalOpen);
  const setOpen = useSentinelStore((state) => state.setConnectModalOpen);
  const connectWallet = useSentinelStore((state) => state.connectWallet);
  const wallet = useSentinelStore((state) => state.wallet);

  const installed = getAvailableWallets();
  const isKnown = (name: string, id: string) =>
    installed.find((w) => w.id === id || new RegExp(name.split(' ')[0], 'i').test(w.name));

  const wallets = KNOWN_WALLETS.map((known) => {
    const match = isKnown(known.name, known.id);
    return {
      id: match?.id ?? known.id,
      name: known.name,
      icon: WALLET_ICONS[known.id] ?? '🔗',
      desc: WALLET_DESCRIPTIONS[known.id] ?? 'Connect using Browser Extension',
      installUrl: known.installUrl,
      isInstalled: Boolean(match),
    };
  });

  // Any other EIP-6963-discovered wallet not already covered above.
  const extraWallets = installed
    .filter((w) => !KNOWN_WALLETS.some((k) => isKnown(k.name, k.id)?.id === w.id))
    .map((w) => ({
      id: w.id,
      name: w.name,
      icon: '🔗',
      desc: 'Detected in this browser',
      installUrl: undefined as string | undefined,
      isInstalled: true,
    }));

  const allWallets = [...wallets, ...extraWallets];

  const handleSelect = (w: (typeof allWallets)[number]) => {
    if (!w.isInstalled) {
      if (w.installUrl) window.open(w.installUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    connectWallet(w.id);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setOpen(false)} title="Connect Web3 Wallet">
      <div className="space-y-4">
        <p className="text-xs text-accent leading-relaxed">
          Select your Web3 wallet provider to initialize Sentinel&apos;s real-time pre-sign AI scanner on OKX X Layer.
        </p>

        <div className="grid gap-2.5">
          {allWallets.map((w) => (
            <motion.button
              key={w.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(w)}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#161616] border border-[#1E1E1E] hover:border-primary/50 hover:bg-[#1A1A1A] transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{w.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                      {w.name}
                    </span>
                    {!w.isInstalled && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-accent border border-white/10">
                        Install
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-accent">
                    {w.isInstalled ? w.desc : 'Not installed - click to get it'}
                  </p>
                </div>
              </div>
              {wallet.isConnected && wallet.address && w.isInstalled && installed.find((i) => i.id === w.id) ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : w.isInstalled ? (
                <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-primary transition-colors" />
              ) : (
                <ExternalLink className="w-4 h-4 text-accent" />
              )}
            </motion.button>
          ))}
        </div>

        <div className="pt-3 border-t border-[#1E1E1E] flex items-center justify-between text-xs text-accent">
          <div className="flex items-center gap-1.5">
            <img src="/logo.png" alt="Sentinel Logo" className="w-3.5 h-3.5 object-contain" />
            <span>AI Shield Status: Active</span>
          </div>
          <span className="text-white/60">OKX X Layer (Chain ID: {X_LAYER_CHAIN_ID})</span>
        </div>
      </div>
    </Modal>
  );
};
