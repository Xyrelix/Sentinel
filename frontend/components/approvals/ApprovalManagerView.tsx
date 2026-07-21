'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, AlertTriangle, ShieldCheck, Trash2, ExternalLink, Search } from 'lucide-react';
import { useSentinelStore } from '../../store/useSentinelStore';
import { GlowCard } from '../ui/GlowCard';
import { Badge } from '../ui/Badge';

export const ApprovalManagerView: React.FC = () => {
  const approvals = useSentinelStore((state) => state.approvals);
  const revokeApproval = useSentinelStore((state) => state.revokeApproval);

  const [searchFilter, setSearchFilter] = useState('');

  const filteredApprovals = approvals.filter(
    (app) =>
      app.tokenSymbol.toLowerCase().includes(searchFilter.toLowerCase()) ||
      app.spenderName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      app.protocol.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E1E1E]">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Token Approval Manager
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30">
              ONE-CLICK REVOKE
            </span>
          </h2>
          <p className="text-sm text-accent mt-1">
            Review and instantly revoke smart contract permissions allowing protocols to transfer your tokens.
          </p>
        </div>

        {/* Filter Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search token or spender..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#111111] border border-[#1E1E1E] focus:border-primary focus:outline-none text-white text-xs"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-accent" />
        </div>
      </div>

      {/* Main Table Card */}
      <GlowCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#161616] border-b border-[#1E1E1E] text-xs font-bold text-accent uppercase tracking-wider">
                <th className="py-4 px-6">Token</th>
                <th className="py-4 px-6">Allowance</th>
                <th className="py-4 px-6">Spender Contract</th>
                <th className="py-4 px-6">Value at Risk</th>
                <th className="py-4 px-6">Threat Rating</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E1E]">
              <AnimatePresence>
                {filteredApprovals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-accent text-sm">
                      <ShieldCheck className="w-10 h-10 text-success mx-auto mb-2 opacity-80" />
                      No active allowances found. Your wallet is 100% secure!
                    </td>
                  </tr>
                ) : (
                  filteredApprovals.map((app) => (
                    <motion.tr
                      key={app.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      {/* Token info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white text-sm">
                            {app.tokenSymbol[0]}
                          </div>
                          <div>
                            <span className="font-bold text-white text-sm block">{app.tokenSymbol}</span>
                            <span className="text-accent text-xs">{app.tokenName}</span>
                          </div>
                        </div>
                      </td>

                      {/* Allowance */}
                      <td className="py-4 px-6">
                        <span
                          className={`font-semibold text-xs ${
                            app.isUnlimited ? 'text-primary font-bold' : 'text-white'
                          }`}
                        >
                          {app.allowance}
                        </span>
                      </td>

                      {/* Spender */}
                      <td className="py-4 px-6">
                        <div>
                          <span className="font-bold text-white text-xs block flex items-center gap-1.5">
                            {app.spenderName}
                            <a
                              href={`https://www.oklink.com/xlayer/address/${app.spenderAddress}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-accent hover:text-primary transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </span>
                          <span className="font-mono text-[11px] text-accent">{app.spenderAddress}</span>
                        </div>
                      </td>

                      {/* Value at risk */}
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-white text-xs">
                          ${app.valueAtRiskUsd.toLocaleString()} USD
                        </span>
                      </td>

                      {/* Risk rating */}
                      <td className="py-4 px-6">
                        <Badge level={app.riskLevel} />
                      </td>

                      {/* Revoke button action */}
                      <td className="py-4 px-6 text-right">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => revokeApproval(app.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-primary/10 border border-primary/40 hover:bg-primary text-primary hover:text-white font-bold text-xs shadow-red-glow transition-all flex items-center gap-1.5 ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Revoke</span>
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </GlowCard>
    </div>
  );
};
