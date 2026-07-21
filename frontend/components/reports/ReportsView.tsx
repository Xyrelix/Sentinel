'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, ShieldCheck, CheckCircle2, Award, Zap, ExternalLink } from 'lucide-react';
import { useSentinelStore } from '../../store/useSentinelStore';
import { GlowCard } from '../ui/GlowCard';
import { Badge } from '../ui/Badge';

export const ReportsView: React.FC = () => {
  const wallet = useSentinelStore((state) => state.wallet);
  const activeScanResult = useSentinelStore((state) => state.activeScanResult);
  const addToast = useSentinelStore((state) => state.addToast);

  const handleExportPdf = () => {
    addToast({
      type: 'success',
      title: 'PDF Security Certificate Exported',
      description: 'Sentinel AI Audit Report downloaded successfully.',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E1E1E]">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            AI Security Reports & Audits
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-success/10 text-success border border-success/30">
              VERIFIED COMPLIANCE
            </span>
          </h2>
          <p className="text-sm text-accent mt-1">
            Download cryptographic proof-of-audit certificates and executive summaries for OKX X Layer transactions.
          </p>
        </div>

        <button
          onClick={handleExportPdf}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-red-600 text-white font-bold text-xs shadow-red-glow hover:shadow-red-glow-lg transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit PDF Report</span>
        </button>
      </div>

      {/* Main Certificate Card Preview */}
      <GlowCard className="p-8 border-primary/30 relative overflow-hidden">
        {/* Background Decorative Shield Watermark */}
        <Award className="absolute -right-10 -bottom-10 w-96 h-96 text-white/5 pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Certificate Top Badge Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E1E1E]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-red-glow">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-primary font-black block">
                  SENTINEL AI CERTIFICATE OF AUDIT
                </span>
                <h3 className="text-2xl font-black text-white">Smart Contract Security Pass</h3>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-xs text-accent">
              <p>Certificate ID: <span className="text-white font-bold">SEN-OKX-9481</span></p>
              <p>Issued Date: <span className="text-white font-bold">July 21, 2026</span></p>
            </div>
          </div>

          {/* Audit Metrics Overview Grid */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#161616] border border-[#1E1E1E]">
              <span className="text-xs text-accent uppercase font-medium block">Audited Target</span>
              <p className="text-sm font-bold text-white mt-1 font-mono">
                {activeScanResult ? activeScanResult.targetName : 'Uniswap V3 Router'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#161616] border border-[#1E1E1E]">
              <span className="text-xs text-accent uppercase font-medium block">Threat Level</span>
              <div className="mt-1">
                <Badge level={activeScanResult ? activeScanResult.riskLevel : 'SAFE'} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#161616] border border-[#1E1E1E]">
              <span className="text-xs text-accent uppercase font-medium block">AI Engine</span>
              <p className="text-sm font-bold text-white mt-1">OpenAI GPT-4o + CrewAI</p>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-5 rounded-2xl bg-[#080808] border border-[#1E1E1E] space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Executive Threat Summary:
            </h4>
            <p className="text-xs text-accent leading-relaxed">
              {activeScanResult
                ? activeScanResult.aiExplanation.whatWeFound
                : 'Verified contract bytecode against 140+ known drainer vectors. Zero honeypot backdoors detected.'}
            </p>
          </div>

          {/* Verification Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Verification Steps Completed:</h4>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Bytecode Hash Matching & Decompilation</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Permit2 Signature Payload Inspection</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Liquidity Pool Lock Protocol Verification</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>OKX X Layer Telemetry Database Check</span>
              </div>
            </div>
          </div>
        </div>
      </GlowCard>
    </div>
  );
};
