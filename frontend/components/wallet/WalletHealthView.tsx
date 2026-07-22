'use client';

import React, { useEffect } from 'react';
import { useSentinelStore } from '../../store/useSentinelStore';
import { GlowCard } from '../ui/GlowCard';
import { Badge } from '../ui/Badge';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { Icon } from '../ui/Icon';
import { AlertTriangle, Flag, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { AreaChart, Area, Pie, PieChart as RechartsPieChart, Cell, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export const WalletHealthView: React.FC = () => {
  const wallet = useSentinelStore((state) => state.wallet);
  const approvals = useSentinelStore((state) => state.approvals);
  const approvalRiskFlags = useSentinelStore((state) => state.approvalRiskFlags);
  const fetchApprovals = useSentinelStore((state) => state.fetchApprovals);
  const setActiveTab = useSentinelStore((state) => state.setActiveTab);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const unlimitedCount = approvals.filter((a) => a.isUnlimited).length;
  const safetyScore = Math.max(0, 100 - wallet.overallRiskScore);
  const safetyLevel = safetyScore >= 70 ? 'SAFE' : safetyScore >= 40 ? 'MEDIUM' : 'CRITICAL';

  // Mock Risk Trend History Data for Recharts
  const riskHistory = [
    { date: 'Mon', riskScore: 45, approvals: 8 },
    { date: 'Tue', riskScore: 38, approvals: 7 },
    { date: 'Wed', riskScore: 62, approvals: 9 },
    { date: 'Thu', riskScore: 50, approvals: 6 },
    { date: 'Fri', riskScore: 28, approvals: 5 },
    { date: 'Sat', riskScore: 23, approvals: 4 },
    { date: 'Sun', riskScore: 23, approvals: 4 },
  ];

  // Token Holdings Breakdown Data
  const tokenHoldings = [
    { name: 'ETH / WETH', value: 24500, color: '#FF3B30' },
    { name: 'USDT', value: 14250, color: '#22C55E' },
    { name: 'OKB Token', value: 6500, color: '#FACC15' },
    { name: 'Pepe Token', value: 1200, color: '#A1A1AA' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E1E1E]">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Wallet Security & Health
            <Badge level={safetyLevel} text={`SAFETY SCORE: ${safetyScore}/100`} />
            {wallet.isVerified && <Badge level="SAFE" text="SIGNATURE VERIFIED" />}
          </h2>
          <p className="text-sm text-accent mt-1">
            Deep portfolio exposure inspection, asset distribution, and allowance vulnerabilities.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('approvals')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111111] border border-primary/40 hover:border-primary text-white font-bold text-xs hover:bg-primary/10 transition-all"
        >
          <span>Scan a Contract</span>
          <Icon name="arrow-up-right" color="%23FF3B30" className="w-4 h-4" />
        </button>
      </div>

      {/* Top 4 Wallet Health Cards - all real, derived from live on-chain + price data */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <GlowCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-accent uppercase font-medium">Safety Score</p>
              <h3 className={`text-3xl font-black mt-1 ${safetyScore >= 70 ? 'text-success' : safetyScore >= 40 ? 'text-warning' : 'text-primary'}`}>
                {safetyScore} / 100
              </h3>
              <p className="text-xs text-accent mt-1">Gas token on {wallet.network || 'X Layer'}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white">
              <Icon name="wallet" className="w-5 h-5" />
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
              <Icon name="shield-check" color="%2322C55E" className="w-5 h-5" />
            </div>
          </div>
        </GlowCard>

        <GlowCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-accent uppercase font-medium">Native Balance (USD)</p>
              <h3 className="text-3xl font-black text-white mt-1">
                <AnimatedNumber value={wallet.balanceUsd} prefix="$" />
              </h3>
              <p className="text-xs text-accent mt-1">{wallet.balanceEth.toFixed(4)} OKB at live market price</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white">
              <Icon name="cpu" className="w-5 h-5" />
            </div>
          </div>
        </GlowCard>

        <GlowCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-accent uppercase font-medium">Unlimited Approvals</p>
              <h3 className="text-3xl font-black text-primary mt-1">{unlimitedCount}</h3>
              <p className="text-xs text-accent mt-1">Against the watched token/spender list</p>
            </div>
            <div className="p-3 rounded-xl bg-primary/20 border border-primary/40 text-primary">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </GlowCard>

        <GlowCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-accent uppercase font-medium">Risk Flags</p>
              <h3 className="text-3xl font-black text-white mt-1">{approvalRiskFlags.length}</h3>
              <p className={`text-xs mt-1 font-semibold ${approvalRiskFlags.length === 0 ? 'text-success' : 'text-warning'}`}>
                {approvalRiskFlags.length === 0 ? 'No issues found' : 'See notes below'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-success/10 border border-success/30 text-success">
              <Flag className="w-5 h-5" />
            </div>
          </div>
        </GlowCard>
      </div>

      {approvalRiskFlags.length > 0 && (
        <GlowCard className="p-5 space-y-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Flag className="w-4 h-4 text-warning" /> Risk Flag Details
          </h3>
          <ul className="space-y-1.5">
            {approvalRiskFlags.map((flag, idx) => (
              <li key={idx} className="text-xs text-accent leading-relaxed flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </GlowCard>
      )}

      {/* Note on scope */}
      <GlowCard className="p-6">
        <div className="flex items-start gap-3">
          <Icon name="shield-check" color="%23FF3B30" className="w-5 h-5 shrink-0 mt-0.5" />
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

      {/* Charts Grid Section - illustrative only: historical risk trends and a
          full multi-token portfolio breakdown both require an on-chain indexer,
          which isn't connected in this build. The 4 cards above are real. */}
      <p className="text-xs text-accent/70 italic">
        Note: the charts below are illustrative examples - historical trend tracking and multi-token
        portfolio breakdowns require an on-chain indexer, not yet connected in this build.
      </p>
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left: Recharts 7-Day Risk History */}
        <div className="lg:col-span-7">
          <GlowCard className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E1E1E]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> 7-Day Risk Score History
                </h3>
                <p className="text-xs text-accent">Lower score indicates higher security safety</p>
              </div>
              <span className="text-xs font-bold text-success">-22% Risk Reduction</span>
            </div>

            <div className="h-64 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={riskHistory}>
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#FF3B30" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#A1A1AA" fontSize={12} tickLine={false} />
                  <YAxis stroke="#A1A1AA" fontSize={12} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111111',
                      borderColor: '#1E1E1E',
                      borderRadius: '12px',
                      color: '#ffffff',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="riskScore"
                    stroke="#FF3B30"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#riskGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlowCard>
        </div>

        {/* Right: Portfolio Asset Distribution Pie Chart */}
        <div className="lg:col-span-5">
          <GlowCard className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E1E1E]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-accent" /> Token Allocation & Exposure
              </h3>
              <span className="text-xs text-accent">OKX X Layer</span>
            </div>

            <div className="h-48 mt-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={tokenHoldings}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {tokenHoldings.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#111111" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => `$${Number(val || 0).toLocaleString()}`}
                    contentStyle={{
                      backgroundColor: '#111111',
                      borderColor: '#1E1E1E',
                      borderRadius: '12px',
                      color: '#ffffff',
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
              {tokenHoldings.map((item) => (
                <div key={item.name} className="flex items-center gap-2 p-2 rounded-lg bg-[#161616]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-white font-medium truncate">{item.name}</span>
                  <span className="text-accent ml-auto font-mono">${item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </GlowCard>
        </div>
      </div>
    </div>
  );
};
