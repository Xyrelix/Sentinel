'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Scan, AlertTriangle, CheckCircle2, ArrowUpRight, Zap, Activity, Clock, FileWarning } from 'lucide-react';
import { useSentinelStore } from '../../store/useSentinelStore';
import { GlowCard } from '../ui/GlowCard';
import { RiskGauge } from '../ui/RiskGauge';
import { Badge } from '../ui/Badge';
import { AnimatedNumber } from '../ui/AnimatedNumber';

export const DashboardView: React.FC = () => {
  const wallet = useSentinelStore((state) => state.wallet);
  const setActiveTab = useSentinelStore((state) => state.setActiveTab);
  const startScan = useSentinelStore((state) => state.startScan);
  const setCurrentScanInput = useSentinelStore((state) => state.setCurrentScanInput);
  const approvals = useSentinelStore((state) => state.approvals);
  const threats = useSentinelStore((state) => state.threats);

  const criticalApprovalsCount = approvals.filter((a) => a.riskLevel === 'CRITICAL' || a.riskLevel === 'HIGH').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E1E1E]">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Security Dashboard
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-success/10 text-success border border-success/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success animate-ping" />
              AI Shield Active
            </span>
          </h2>
          <p className="text-sm text-accent mt-1">
            Real-time telemetry for <span className="text-white font-mono font-semibold">{wallet.ensName || wallet.address}</span> on OKX X Layer
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setCurrentScanInput('0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5');
              setActiveTab('scanner');
              startScan('drainer');
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-red-600 text-white font-bold text-xs shadow-red-glow hover:shadow-red-glow-lg transition-all"
          >
            <Scan className="w-4 h-4" />
            <span>Quick Scan Transaction</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <GlowCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-accent uppercase tracking-wider font-medium">Wallet Balance</p>
              <h3 className="text-2xl font-black text-white mt-1">
                <AnimatedNumber value={wallet.balanceEth} decimals={2} suffix=" ETH" />
              </h3>
              <p className="text-xs text-success mt-1 flex items-center gap-1 font-semibold">
                ≈ <AnimatedNumber value={wallet.balanceUsd} prefix="$" /> USD
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </GlowCard>

        <GlowCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-accent uppercase tracking-wider font-medium">Threat Level</p>
              <h3 className="text-2xl font-black text-success mt-1">LOW (23%)</h3>
              <p className="text-xs text-accent mt-1">No active drainers detected</p>
            </div>
            <div className="p-3 rounded-xl bg-success/10 border border-success/30 text-success">
              <Shield className="w-5 h-5" />
            </div>
          </div>
        </GlowCard>

        <GlowCard onClick={() => setActiveTab('approvals')}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-accent uppercase tracking-wider font-medium">Active Approvals</p>
              <h3 className="text-2xl font-black text-white mt-1">{approvals.length} Token Spenders</h3>
              <p className={`text-xs mt-1 font-semibold ${criticalApprovalsCount > 0 ? 'text-primary' : 'text-success'}`}>
                {criticalApprovalsCount > 0 ? `${criticalApprovalsCount} High Risk Approvals!` : 'All Approvals Safe'}
              </p>
            </div>
            <div className={`p-3 rounded-xl border ${criticalApprovalsCount > 0 ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-white/5 border-white/10 text-accent'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </GlowCard>

        <GlowCard onClick={() => setActiveTab('community')}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-accent uppercase tracking-wider font-medium">Community Threats</p>
              <h3 className="text-2xl font-black text-white mt-1">{threats.length} Flagged Scams</h3>
              <p className="text-xs text-accent mt-1">Latest 10m ago</p>
            </div>
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 text-primary">
              <FileWarning className="w-5 h-5" />
            </div>
          </div>
        </GlowCard>
      </div>

      {/* Main Grid Section: Risk Gauge & AI Scanner Launcher */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left: Animated Risk Gauge Card */}
        <div className="lg:col-span-5">
          <GlowCard className="h-full flex flex-col justify-between p-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E1E1E]">
              <div>
                <h3 className="text-lg font-bold text-white">Overall Wallet Threat Index</h3>
                <p className="text-xs text-accent">Real-time risk scoring engine</p>
              </div>
              <Badge level="SAFE" text="OPTIMAL" />
            </div>

            <div className="py-6 flex justify-center">
              <RiskGauge score={wallet.overallRiskScore} size={240} />
            </div>

            <div className="p-4 rounded-xl bg-[#161616] border border-[#1E1E1E] text-xs space-y-2">
              <div className="flex items-center justify-between text-accent">
                <span>Contract Interaction Safety:</span>
                <span className="text-success font-bold">98/100</span>
              </div>
              <div className="flex items-center justify-between text-accent">
                <span>Unlimited Approval Exposure:</span>
                <span className="text-warning font-bold">$14,250 USD</span>
              </div>
              <div className="flex items-center justify-between text-accent">
                <span>Phishing Target Score:</span>
                <span className="text-success font-bold font-mono">0.02 (Very Low)</span>
              </div>
            </div>
          </GlowCard>
        </div>

        {/* Right: Quick Transaction Audit & Preset Scenarios */}
        <div className="lg:col-span-7 space-y-6">
          <GlowCard>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" /> Instant Pre-Sign AI Audit
                  </h3>
                  <p className="text-xs text-accent">Simulate contract interactions before signing signatures</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">
                  AI SIMULATOR
                </span>
              </div>

              {/* Sample Preset Attack Vectors */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-accent uppercase tracking-wider">
                  Test Attack Vector Scenarios:
                </p>

                <div className="grid sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      setCurrentScanInput('0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5');
                      setActiveTab('scanner');
                      startScan('drainer');
                    }}
                    className="p-3 rounded-xl bg-[#161616] border border-primary/40 hover:border-primary hover:bg-primary/10 transition-all text-left group"
                  >
                    <Badge level="CRITICAL" text="Permit2 Drainer" className="mb-2" />
                    <h4 className="text-xs font-bold text-white group-hover:text-primary transition-colors">
                      Zero-Transfer Permit
                    </h4>
                    <p className="text-[10px] text-accent mt-1">Drains USDT & WETH balance</p>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentScanInput('0x498b8c56858e70a1a0937a09d3b1dbdbfef52b21');
                      setActiveTab('scanner');
                      startScan('honeypot');
                    }}
                    className="p-3 rounded-xl bg-[#161616] border border-warning/40 hover:border-warning hover:bg-warning/10 transition-all text-left group"
                  >
                    <Badge level="HIGH" text="Honeypot Token" className="mb-2" />
                    <h4 className="text-xs font-bold text-white group-hover:text-warning transition-colors">
                      $OKXAI Sell Block
                    </h4>
                    <p className="text-[10px] text-accent mt-1">99.5% dynamic sell tax</p>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentScanInput('0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45');
                      setActiveTab('scanner');
                      startScan('safe');
                    }}
                    className="p-3 rounded-xl bg-[#161616] border border-success/40 hover:border-success hover:bg-success/10 transition-all text-left group"
                  >
                    <Badge level="SAFE" text="Official Swap" className="mb-2" />
                    <h4 className="text-xs font-bold text-white group-hover:text-success transition-colors">
                      Uniswap V3 Router
                    </h4>
                    <p className="text-[10px] text-accent mt-1">Clean verified DEX swap</p>
                  </button>
                </div>
              </div>
            </div>
          </GlowCard>

          {/* Active Approvals Watchlist Preview */}
          <GlowCard>
            <div className="flex items-center justify-between pb-3 border-b border-[#1E1E1E]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" /> High Risk Unlimited Approvals
              </h3>
              <button
                onClick={() => setActiveTab('approvals')}
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
              >
                Manage All <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#1E1E1E] mt-2">
              {approvals.slice(0, 2).map((app) => (
                <div key={app.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white">
                      {app.tokenSymbol[0]}
                    </div>
                    <div>
                      <p className="font-bold text-white">{app.tokenSymbol} ({app.tokenName})</p>
                      <p className="text-accent text-[11px] truncate max-w-[200px]">{app.spenderName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge level={app.riskLevel} />
                    <span className="font-semibold text-white font-mono">${app.valueAtRiskUsd.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlowCard>
        </div>
      </div>
    </div>
  );
};
