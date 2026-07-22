'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSentinelStore } from '../../store/useSentinelStore';
import { GlowCard } from '../ui/GlowCard';
import { Badge } from '../ui/Badge';
import { Icon } from '../ui/Icon';
import { downloadAuditPdf } from '../../lib/pdf';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const wallet = useSentinelStore((state) => state.wallet);
  const activeScanResult = useSentinelStore((state) => state.activeScanResult);
  const addToast = useSentinelStore((state) => state.addToast);
  const setActiveTab = useSentinelStore((state) => state.setActiveTab);

  const handleExportPdf = () => {
    if (!activeScanResult) {
      addToast({
        type: 'warning',
        title: 'No Scan to Export',
        description: 'Run a scan first - the certificate is generated from a real scan result.',
      });
      setActiveTab('scanner');
      return;
    }

    try {
      downloadAuditPdf(activeScanResult, wallet);
      addToast({
        type: 'success',
        title: 'PDF Security Certificate Exported',
        description: 'Sentinel AI Audit Report downloaded successfully.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Export Failed',
        description: 'Could not generate the PDF. Try again.',
      });
    }
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
          <Icon name="download" className="w-4 h-4" />
          <span>Export Audit PDF Report</span>
        </button>
      </div>

      {/* Main Certificate Card Preview */}
      <GlowCard className="p-8 border-primary/30 relative overflow-hidden">
        {/* Background Decorative Shield Watermark */}
        <Icon name="award" color="%23ffffff0d" className="absolute -right-10 -bottom-10 w-96 h-96 pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Certificate Top Badge Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E1E1E]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-red-glow">
                <Icon name="shield-check" color="%23FF3B30" className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-primary font-black block">
                  SENTINEL AI CERTIFICATE OF AUDIT
                </span>
                <h3 className="text-2xl font-black text-white">Smart Contract Security Pass</h3>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-xs text-accent">
              <p>
                Certificate ID:{' '}
                <span className="text-white font-bold">
                  {activeScanResult ? `SEN-OKX-${activeScanResult.targetAddress.slice(2, 8).toUpperCase()}` : '-'}
                </span>
              </p>
              <p>
                Issued Date:{' '}
                <span className="text-white font-bold">
                  {activeScanResult ? new Date().toISOString().slice(0, 10) : '-'}
                </span>
              </p>
            </div>
          </div>

          {!activeScanResult ? (
            <div className="py-10 text-center text-accent text-sm">
              <ShieldCheck className="w-10 h-10 text-accent mx-auto mb-2 opacity-50" />
              No scan yet. Run the AI Scanner to generate a real, exportable audit certificate.
            </div>
          ) : (
          <>
          {/* Audit Metrics Overview Grid */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#161616] border border-[#1E1E1E]">
              <span className="text-xs text-accent uppercase font-medium block">Audited Target</span>
              <p className="text-sm font-bold text-white mt-1 font-mono">{activeScanResult.targetName}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#161616] border border-[#1E1E1E]">
              <span className="text-xs text-accent uppercase font-medium block">Threat Level</span>
              <div className="mt-1">
                <Badge level={activeScanResult.riskLevel} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#161616] border border-[#1E1E1E]">
              <span className="text-xs text-accent uppercase font-medium block">Analysis Engine</span>
              <p className="text-sm font-bold text-white mt-1">Sentinel On-Chain Pipeline</p>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-5 rounded-2xl bg-[#080808] border border-[#1E1E1E] space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Icon name="zap" color="%23FF3B30" className="w-4 h-4" /> Executive Threat Summary:
            </h4>
            <p className="text-xs text-accent leading-relaxed">{activeScanResult.aiExplanation.whatWeFound}</p>
          </div>

          {/* Verification Steps - the real checks run by this specific scan */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Checks Performed:</h4>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              {activeScanResult.checks.map((check) => (
                <div key={check.id} className="flex items-center gap-2 text-white">
                  <CheckCircle2
                    className={`w-4 h-4 ${check.status === 'passed' ? 'text-success' : check.status === 'warning' ? 'text-warning' : 'text-primary'}`}
                  />
                  <span>{check.label}</span>
                </div>
              ))}
            </div>
          </div>
          </>
          )}
        </div>
      </GlowCard>
    </div>
  );
};
