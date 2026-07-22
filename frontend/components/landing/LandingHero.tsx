'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Scan, Sparkles, Lock, ArrowRight, Activity, Cpu, CheckCircle2, Zap, Wallet } from 'lucide-react';
import { useSentinelStore } from '../../store/useSentinelStore';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { AnimatedText } from '../ui/AnimatedText';
import { TextShimmer } from '../ui/TextShimmer';

export const LandingHero: React.FC = () => {
  const setActiveTab = useSentinelStore((state) => state.setActiveTab);
  const connectWallet = useSentinelStore((state) => state.connectWallet);
  const isConnected = useSentinelStore((state) => state.wallet.isConnected);
  const isConnecting = useSentinelStore((state) => state.isConnecting);

  const partners = [
    { name: 'OpenAI', role: 'LLM Threat Reasoning', icon: '🤖' },
    { name: 'OKX', role: 'Web3 L2 Ecosystem', icon: '⚡' },
    { name: 'X Layer', role: 'Native L2 Security', icon: '⛓️' },
    { name: 'LangGraph', role: 'Multi-Agent Workflows', icon: '🕸️' },
    { name: 'CrewAI', role: 'Autonomous Auditing', icon: '👥' },
    { name: 'Supabase', role: 'Realtime Telemetry', icon: '⚡' },
    { name: 'PostgreSQL', role: 'Threat Vector DB', icon: '🐘' },
  ];

  return (
    <div className="relative overflow-hidden pt-6 sm:pt-12 pb-16 sm:pb-24">
      {/* Centralized Hero Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center space-y-4 sm:space-y-5">
        
        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
          <TextShimmer className="text-[11px] sm:text-xs font-bold tracking-wide uppercase" duration={2.5}>
            REAL-TIME AI PRE-SIGN PROTECTION
          </TextShimmer>
        </motion.div>

        {/* Centralized Main Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tight leading-[1.04] max-w-4xl text-center"
        >
          <AnimatedText text="Your" as="span" stagger={0.08} delay={0.15} once={false} />{' '}
          <AnimatedText as="span" delay={0.3} once={false}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-amber-500 text-glow-red">
              AI Shield
            </span>
          </AnimatedText>{' '}
          <AnimatedText text="Against Crypto Scams" as="span" stagger={0.08} delay={0.45} once={false} />
        </motion.h1>

        {/* Centralized Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-base lg:text-lg text-accent max-w-2xl font-normal leading-normal text-center px-2"
        >
          Sentinel analyzes every Web3 transaction before you sign it. Powered by OKX X Layer and multi-agent AI, it scans contract bytecode, token approvals, honeypots, and wallet drainers and explains risks in simple English.
        </motion.p>

        {/* Centralized CTA Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto pt-2"
        >
          {isConnected ? (
            <button
              onClick={() => setActiveTab('scanner')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-primary to-red-600 text-white font-bold text-sm tracking-wide shadow-red-glow hover:shadow-red-glow-lg hover:scale-105 transition-all cursor-pointer"
            >
              <Scan className="w-4 h-4" />
              <span>Launch AI Scanner</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-primary to-red-600 text-white font-bold text-sm tracking-wide shadow-red-glow hover:shadow-red-glow-lg hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 transition-all cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>{isConnecting ? 'Connecting...' : 'Connect Wallet to Start'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>

        {/* Centralized Live Stats Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-2 sm:gap-6 pt-4 border-t border-[#1E1E1E] w-full max-w-2xl text-center"
        >
          <div className="p-1.5">
            <p className="text-xl sm:text-3xl font-black text-white">
              <AnimatedNumber value={142850} prefix="$" suffix="+" />
            </p>
            <p className="text-[10px] sm:text-xs text-accent mt-0.5 font-medium uppercase tracking-wider">Protected Value</p>
          </div>
          <div className="p-1.5 border-x border-[#1E1E1E]">
            <p className="text-xl sm:text-3xl font-black text-primary">
              <AnimatedNumber value={99.9} decimals={1} suffix="%" />
            </p>
            <p className="text-[10px] sm:text-xs text-accent mt-0.5 font-medium uppercase tracking-wider">Drainer Detection</p>
          </div>
          <div className="p-1.5">
            <p className="text-xl sm:text-3xl font-black text-white">
              <AnimatedNumber value={425000} suffix="+" />
            </p>
            <p className="text-[10px] sm:text-xs text-accent mt-0.5 font-medium uppercase tracking-wider">Pre-Sign Audits</p>
          </div>
        </motion.div>

        {/* Centralized 3D Security Interactive Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative w-full max-w-lg mt-4 sm:mt-6 text-left"
        >
          {/* Outer Ambient Glow Effect */}
          <div className="absolute inset-0 rounded-3xl bg-primary/15 blur-2xl pointer-events-none" />

          {/* Floating Security Shield Card */}
          <div className="relative z-10 w-full rounded-2xl bg-[#111111]/95 backdrop-blur-2xl border border-primary/40 shadow-2xl p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1E1E1E]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/20 border border-primary/40 text-primary">
                  <Shield className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Sentinel Guardian AI</h3>
                  <p className="text-[11px] sm:text-xs text-success flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
                    Active Pre-Sign Protection
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-primary/20 text-primary border border-primary/30">
                OKX X LAYER
              </span>
            </div>

            {/* Live Scan Preview Card */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#080808] border border-[#1E1E1E] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-accent flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-primary" /> Target Contract
                </span>
                <span className="font-mono text-white/90 text-[11px]">0x9522...BAfe5</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-accent flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-warning" /> Risk Rating
                </span>
                <span className="px-2 py-0.5 rounded font-bold text-primary bg-primary/10 border border-primary/30 text-[11px]">
                  96% CRITICAL
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 shrink-0" />
                <span className="leading-tight">Malicious Permit2 Drainer signature intercepted!</span>
              </div>
            </div>

            {/* Live AI Status Matrix */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div className="p-2.5 sm:p-3 rounded-xl bg-[#161616] border border-[#1E1E1E] flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                <div>
                  <p className="text-[10px] text-accent">Honeypot Engine</p>
                  <p className="text-xs font-bold text-white">Verified Safe</p>
                </div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-[#161616] border border-[#1E1E1E] flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] text-accent">Approval Guard</p>
                  <p className="text-xs font-bold text-primary">Revoke Advised</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Trusted Technologies Mobile-Optimized Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        <p className="text-center text-[10px] sm:text-xs uppercase tracking-widest text-accent font-semibold mb-4 sm:mb-6">
          POWERED BY WORLD-CLASS WEB3 & AI INFRASTRUCTURE
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
          {partners.map((p, idx) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="p-3 rounded-xl bg-[#111111] border border-[#1E1E1E] flex flex-col items-center justify-center text-center hover:border-primary/40 hover:bg-[#161616] transition-all"
            >
              <span className="text-lg mb-1">{p.icon}</span>
              <span className="text-xs font-bold text-white">{p.name}</span>
              <span className="text-[10px] text-accent mt-0.5">{p.role}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
