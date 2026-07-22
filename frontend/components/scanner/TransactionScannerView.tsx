'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSentinelStore } from '../../store/useSentinelStore';
import { GlowCard } from '../ui/GlowCard';
import { RiskGauge } from '../ui/RiskGauge';
import { Badge } from '../ui/Badge';
import { Icon } from '../ui/Icon';

export const TransactionScannerView: React.FC = () => {
  const currentScanInput = useSentinelStore((state) => state.currentScanInput);
  const setCurrentScanInput = useSentinelStore((state) => state.setCurrentScanInput);
  const isScanning = useSentinelStore((state) => state.isScanning);
  const scanProgress = useSentinelStore((state) => state.scanProgress);
  const scanStage = useSentinelStore((state) => state.scanStage);
  const activeScanResult = useSentinelStore((state) => state.activeScanResult);
  const scanError = useSentinelStore((state) => state.scanError);
  const startScan = useSentinelStore((state) => state.startScan);

  const [activeAccordion, setActiveAccordion] = useState<string | null>('what');

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E1E1E]">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            AI Pre-Sign Transaction Scanner
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30">
              OKX X LAYER ENGINE
            </span>
          </h2>
          <p className="text-sm text-accent mt-1">
            Analyze contract bytecode, permit signatures, and liquidity risk before executing on-chain.
          </p>
        </div>
      </div>

      {/* Input Bar & Preset Quick Scenario Buttons */}
      <GlowCard className="p-6">
        <div className="space-y-4">
          <label className="text-xs font-bold text-accent uppercase tracking-wider block">
            Contract Address, Transaction Payload, or Domain Name:
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={currentScanInput}
                onChange={(e) => setCurrentScanInput(e.target.value)}
                placeholder="Paste contract address (0x...) or domain"
                className="w-full px-4 py-3.5 rounded-xl bg-[#080808] border border-[#1E1E1E] focus:border-primary focus:outline-none text-white text-sm font-mono placeholder:text-white/30"
              />
              <Icon name="terminal" color="%23A1A1AA" className="absolute right-4 top-4 w-4 h-4" />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isScanning}
              onClick={() => startScan()}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary to-red-600 text-white font-bold text-sm tracking-wide shadow-red-glow hover:shadow-red-glow-lg disabled:opacity-50 transition-all shrink-0"
            >
              {isScanning ? (
                <>
                  <Icon name="refresh-cw" className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Icon name="scan" className="w-5 h-5" />
                  <span>Execute AI Scan</span>
                </>
              )}
            </motion.button>
          </div>

          {scanError && (
            <p className="text-xs text-primary font-semibold pt-1">{scanError}</p>
          )}

          {/* Preset Buttons — instant scripted demo scenarios */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-accent font-medium mr-2">Preset Test Cases:</span>
            <button
              onClick={() => {
                setCurrentScanInput('0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5');
                startScan('drainer');
              }}
              className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/20 transition-all"
            >
              🚨 Permit2 Drainer (96%)
            </button>
            <button
              onClick={() => {
                setCurrentScanInput('0x498b8c56858e70a1a0937a09d3b1dbdbfef52b21');
                startScan('honeypot');
              }}
              className="px-3 py-1.5 rounded-lg bg-warning/10 border border-warning/30 text-warning text-xs font-semibold hover:bg-warning/20 transition-all"
            >
              ⚠️ Honeypot Token (88%)
            </button>
            <button
              onClick={() => {
                setCurrentScanInput('0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45');
                startScan('safe');
              }}
              className="px-3 py-1.5 rounded-lg bg-success/10 border border-success/30 text-success text-xs font-semibold hover:bg-success/20 transition-all"
            >
              ✅ Verified Uniswap V3 (8%)
            </button>
          </div>
        </div>
      </GlowCard>

      {/* SCANNING ACTIVE STATE */}
      {isScanning && (
        <GlowCard className="p-8 relative overflow-hidden">

          <div className="flex flex-col items-center justify-center text-center space-y-6 py-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-primary/20 border border-primary/50 flex items-center justify-center text-primary shadow-red-glow">
                <Icon name="cpu" color="%23FF3B30" className="w-10 h-10 animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-2xl border-2 border-primary animate-ping opacity-30" />
            </div>

            <div className="space-y-2 max-w-md w-full">
              <div className="flex items-center justify-between text-xs font-bold text-accent">
                <span>{scanStage}</span>
                <span className="text-primary">{scanProgress}%</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-[#1E1E1E] overflow-hidden p-0.5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-red-500 shadow-red-glow"
                  initial={{ width: 0 }}
                  animate={{ width: `${scanProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <p className="text-xs text-accent italic">
              Running multi-agent static bytecode analysis & simulation on OKX X Layer...
            </p>
          </div>
        </GlowCard>
      )}

      {/* SCAN RESULTS READY STATE */}
      {!isScanning && activeScanResult && (
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column: Risk Score & Security Checks */}
          <div className="lg:col-span-5 space-y-6">
            <GlowCard className="p-6 text-center space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E1E1E]">
                <span className="text-xs font-bold uppercase tracking-wider text-accent">Audit Overview</span>
                <Badge level={activeScanResult.riskLevel} />
              </div>

              <RiskGauge score={activeScanResult.riskScore} size={220} />

              <div className="p-3 rounded-xl bg-[#161616] border border-[#1E1E1E] text-xs text-left space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-accent">Target:</span>
                  <span className="text-white font-bold">{activeScanResult.targetName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-accent">Est. Value at Risk:</span>
                  <span className="text-white font-bold">${activeScanResult.estimatedValueUsd.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-accent">Network:</span>
                  <span className="text-white font-bold">{activeScanResult.network}</span>
                </div>
              </div>
            </GlowCard>

            {/* Checklist Matrix */}
            <GlowCard className="p-6">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Icon name="zap" color="%23FF3B30" className="w-4 h-4" /> Automated AI Vector Matrix
              </h3>

              <div className="space-y-3">
                {activeScanResult.checks.map((check) => (
                  <div key={check.id} className="p-3 rounded-xl bg-[#161616] border border-[#1E1E1E] space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-white flex items-center gap-2">
                        {check.status === 'passed' && <Icon name="check-circle-2" color="%2322C55E" className="w-4 h-4 shrink-0" />}
                        {check.status === 'failed' && <Icon name="x-circle" color="%23FF3B30" className="w-4 h-4 shrink-0" />}
                        {check.status === 'warning' && <Icon name="alert-triangle" color="%23FACC15" className="w-4 h-4 shrink-0" />}
                        {check.label}
                      </span>
                      <span
                        className={`uppercase text-[10px] font-extrabold ${
                          check.status === 'passed'
                            ? 'text-success'
                            : check.status === 'failed'
                            ? 'text-primary'
                            : 'text-warning'
                        }`}
                      >
                        {check.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-accent pl-6 leading-relaxed">{check.details}</p>
                  </div>
                ))}
              </div>
            </GlowCard>
          </div>

          {/* Right Column: AI Plain English Explanation Panel */}
          <div className="lg:col-span-7 space-y-6">
            <GlowCard className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#1E1E1E]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/20 border border-primary/40 text-primary">
                    <Icon name="cpu" color="%23FF3B30" className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">AI Plain English Explanation</h3>
                    <p className="text-xs text-accent">Translated by Sentinel LLM Guardian</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-white">
                  HUMAN READABLE
                </span>
              </div>

              {/* Collapsible Section Cards */}
              <div className="space-y-4 mt-6">
                {/* 1. What We Found */}
                <div className="rounded-xl bg-[#161616] border border-[#1E1E1E] overflow-hidden">
                  <button
                    onClick={() => toggleAccordion('what')}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="p-1.5 rounded-lg bg-primary/20 text-primary">
                        <Icon name="info" color="%23FF3B30" className="w-4 h-4" />
                      </span>
                      <span className="text-sm font-bold text-white">1. What We Found</span>
                    </div>
                    <Icon
                      name="chevron-down"
                      color="%23A1A1AA"
                      className={`w-4 h-4 transition-transform ${
                        activeAccordion === 'what' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {activeAccordion === 'what' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 text-xs text-accent leading-relaxed border-t border-[#1E1E1E]/50 pt-3"
                      >
                        {activeScanResult.aiExplanation.whatWeFound}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2. Why It Matters */}
                <div className="rounded-xl bg-[#161616] border border-[#1E1E1E] overflow-hidden">
                  <button
                    onClick={() => toggleAccordion('why')}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="p-1.5 rounded-lg bg-warning/20 text-warning">
                        <Icon name="alert-triangle" color="%23FACC15" className="w-4 h-4" />
                      </span>
                      <span className="text-sm font-bold text-white">2. Why It Matters</span>
                    </div>
                    <Icon
                      name="chevron-down"
                      color="%23A1A1AA"
                      className={`w-4 h-4 transition-transform ${
                        activeAccordion === 'why' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {activeAccordion === 'why' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 text-xs text-accent leading-relaxed border-t border-[#1E1E1E]/50 pt-3"
                      >
                        {activeScanResult.aiExplanation.whyItMatters}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 3. Potential Impact */}
                <div className="rounded-xl bg-[#161616] border border-[#1E1E1E] overflow-hidden">
                  <button
                    onClick={() => toggleAccordion('impact')}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="p-1.5 rounded-lg bg-primary/20 text-primary">
                        <Icon name="shield-alert" color="%23FF3B30" className="w-4 h-4" />
                      </span>
                      <span className="text-sm font-bold text-white">3. Potential Financial Impact</span>
                    </div>
                    <Icon
                      name="chevron-down"
                      color="%23A1A1AA"
                      className={`w-4 h-4 transition-transform ${
                        activeAccordion === 'impact' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {activeAccordion === 'impact' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 text-xs text-accent leading-relaxed border-t border-[#1E1E1E]/50 pt-3"
                      >
                        {activeScanResult.aiExplanation.potentialImpact}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 4. Recommended Action */}
                <div className="rounded-xl bg-primary/10 border border-primary/40 overflow-hidden">
                  <div className="p-4 flex items-center justify-between text-left">
                    <div className="flex items-center gap-3">
                      <span className="p-1.5 rounded-lg bg-primary text-white shadow-red-glow">
                        <Icon name="shield-check" className="w-4 h-4" />
                      </span>
                      <div>
                        <span className="text-sm font-extrabold text-white">4. Recommended Action</span>
                        <p className="text-[11px] text-primary font-bold mt-0.5">
                          {activeScanResult.aiExplanation.recommendedAction}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </GlowCard>
          </div>
        </div>
      )}
    </div>
  );
};
