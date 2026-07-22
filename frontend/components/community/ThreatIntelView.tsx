'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, AlertOctagon, ThumbsUp, Send, ShieldAlert, Plus, RefreshCw } from 'lucide-react';
import { useSentinelStore } from '../../store/useSentinelStore';
import { GlowCard } from '../ui/GlowCard';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { ThreatAlert } from '../../types/sentinel';

export const ThreatIntelView: React.FC = () => {
  const threats = useSentinelStore((state) => state.threats);
  const threatsLoading = useSentinelStore((state) => state.threatsLoading);
  const threatsError = useSentinelStore((state) => state.threatsError);
  const fetchThreats = useSentinelStore((state) => state.fetchThreats);
  const addThreatReport = useSentinelStore((state) => state.addThreatReport);

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    fetchThreats();
  }, [fetchThreats]);

  // Form State
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState<ThreatAlert['category']>('Phishing');
  const [description, setDescription] = useState('');

  const categories = [
    'ALL',
    'Wallet Drainer',
    'Phishing',
    'Rug Pull',
    'Fake Contract',
    'Unlimited Approval',
  ];

  const filteredThreats = threats.filter((t) =>
    selectedCategory === 'ALL' ? true : t.category === selectedCategory
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !address) return;

    await addThreatReport({
      category,
      title,
      targetAddress: address,
      severity: 'HIGH',
      description: description || 'User reported suspicious activity on OKX X Layer.',
      reporter: 'Anonymous Sentinel Contributor',
    });

    setTitle('');
    setAddress('');
    setDescription('');
    setIsReportModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E1E1E]">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Community Threat Intelligence
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> LIVE SCAM TELEMETRY
            </span>
          </h2>
          <p className="text-sm text-accent mt-1">
            Real-time crowdsourced & AI-flagged scam contracts operating across Web3 networks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchThreats()}
            disabled={threatsLoading}
            className="p-2.5 rounded-xl bg-[#111111] border border-[#1E1E1E] hover:border-primary/40 text-accent hover:text-white transition-all disabled:opacity-50"
            title="Refresh feed"
          >
            <RefreshCw className={`w-4 h-4 ${threatsLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-red-600 text-white font-bold text-xs shadow-red-glow hover:shadow-red-glow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Report Malicious Contract</span>
          </button>
        </div>
      </div>

      {threatsError && (
        <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/30 text-xs text-primary flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 shrink-0" />
          <span>Couldn&apos;t load the live feed: {threatsError}</span>
        </div>
      )}

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-primary text-white shadow-red-glow'
                : 'bg-[#111111] border border-[#1E1E1E] text-accent hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Threats Feed Grid */}
      {threatsLoading && threats.length === 0 ? (
        <div className="py-16 text-center text-accent text-sm">
          <RefreshCw className="w-8 h-8 text-primary mx-auto mb-2 animate-spin" />
          Loading community threat feed...
        </div>
      ) : filteredThreats.length === 0 ? (
        <div className="py-16 text-center text-accent text-sm">
          <ShieldAlert className="w-10 h-10 text-accent mx-auto mb-2 opacity-60" />
          No reports yet in this category. Be the first to flag a scam.
        </div>
      ) : (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredThreats.map((threat) => (
          <GlowCard key={threat.id} className="flex flex-col justify-between p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge level={threat.severity} />
                <span className="text-[11px] text-accent font-medium">{threat.timestamp}</span>
              </div>

              <h3 className="text-base font-bold text-white leading-snug">{threat.title}</h3>

              <div className="p-2.5 rounded-lg bg-[#080808] border border-[#1E1E1E] text-xs font-mono text-accent truncate">
                {threat.targetAddress}
              </div>

              <p className="text-xs text-accent leading-relaxed line-clamp-3">{threat.description}</p>
            </div>

            <div className="pt-4 mt-4 border-t border-[#1E1E1E] flex items-center justify-between text-xs text-accent">
              <span className="truncate max-w-[140px] text-[11px]">{threat.reporter}</span>
              <div className="flex items-center gap-1 text-white font-bold">
                <ThumbsUp className="w-3.5 h-3.5 text-primary" />
                <span>{threat.upvotes} Confirmations</span>
              </div>
            </div>
          </GlowCard>
        ))}
      </div>
      )}

      {/* Modal for Submitting Scam Report */}
      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title="Report Malicious Smart Contract">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-accent uppercase block mb-1">Scam Title / Name:</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fake Uniswap Airdrop Claim Site"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-[#1E1E1E] text-white text-xs focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-accent uppercase block mb-1">Malicious Contract / Wallet Address:</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-[#1E1E1E] text-white text-xs font-mono focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-accent uppercase block mb-1">Scam Category:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ThreatAlert['category'])}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-[#1E1E1E] text-white text-xs focus:border-primary focus:outline-none"
            >
              <option value="Wallet Drainer">Wallet Drainer</option>
              <option value="Phishing">Phishing</option>
              <option value="Rug Pull">Rug Pull</option>
              <option value="Fake Contract">Fake Contract</option>
              <option value="Unlimited Approval">Unlimited Approval</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-accent uppercase block mb-1">Detailed Description:</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain how the scam operates..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-[#1E1E1E] text-white text-xs focus:border-primary focus:outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-red-600 text-white font-bold text-xs shadow-red-glow hover:shadow-red-glow-lg transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Submit Threat Report</span>
          </button>
        </form>
      </Modal>
    </div>
  );
};
