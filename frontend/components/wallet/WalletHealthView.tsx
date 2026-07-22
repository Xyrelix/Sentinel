'use client';

import React from 'react';
import { Wallet, ShieldCheck, ArrowUpRight, Cpu } from 'lucide-react';
import { useSentinelStore } from '../../store/useSentinelStore';
import { GlowCard } from '../ui/GlowCard';
import { Badge } from '../ui/Badge';
import { AnimatedNumber } from '../ui/AnimatedNumber';

export const WalletHealthView: React.FC = () => {
  const wallet = useSentinelStore((state) => state.wallet);
  const setActiveTab = useSentinelStore((state) => state.setActiveTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E1E1E]">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Wallet Security &amp; Health
            <Badge level="SAFE" text="LIVE ON-CHAIN" />
          </h2>
          <p className="text-sm text-accent mt-1">
            Live native balance and account details read directly from OKX X Layer.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('scanner')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111111] border border-primary/40 hover:border-primary text-white font-bold text-xs hover:bg-primary/10 transition-all"
        >
          <span>Scan a Contract</span>
          <ArrowUpRight className="w-4 h-4 text-primary" />
        </button>
      </div>

      {/* Real Wallet Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <GlowCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-accent uppercase font-medium">Native Balance</p>
              <h3 className="text-3xl font-black text-white mt-1">
                <AnimatedNumber value={wallet.balanceEth} decimals={4} suffix=" OKB" />
              </h3>
              <p className="text-xs text-accent mt-1">Gas token on {wallet.network || 'X Layer'}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        </GlowCard>

        <GlowCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-accent uppercase font-medium">Network</p>
              <h3 className="text-lg font-black text-success mt-1">{wallet.network || 'Not detected'}</h3>
              <p className="text-xs text-accent mt-1">Connected chain</p>
            </div>
            <div className="p-3 rounded-xl bg-success/10 border border-success/30 text-success">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </GlowCard>

        <GlowCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-accent uppercase font-medium">Connected Address</p>
              <h3 className="text-sm font-bold text-white mt-1 font-mono break-all">{wallet.address}</h3>
              <p className="text-xs text-accent mt-1">Your active account</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
        </GlowCard>
      </div>

      {/* Note on scope */}
      <GlowCard className="p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-white">Token approvals &amp; portfolio history</h3>
            <p className="text-xs text-accent mt-1 leading-relaxed">
              Full token-approval lists and historical risk trends require an on-chain indexer,
              which is not connected in this build. Use the AI Scanner to inspect any specific
              contract address against live on-chain code.
            </p>
          </div>
        </div>
      </GlowCard>
    </div>
  );
};
