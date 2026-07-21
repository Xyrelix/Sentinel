'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSentinelStore } from '../store/useSentinelStore';
import { Navbar } from '../components/layout/Navbar';
import { LandingHero } from '../components/landing/LandingHero';
import { DashboardView } from '../components/dashboard/DashboardView';
import { TransactionScannerView } from '../components/scanner/TransactionScannerView';
import { WalletHealthView } from '../components/wallet/WalletHealthView';
import { ApprovalManagerView } from '../components/approvals/ApprovalManagerView';
import { ThreatIntelView } from '../components/community/ThreatIntelView';
import { ReportsView } from '../components/reports/ReportsView';
import { SettingsView } from '../components/settings/SettingsView';

export default function Home() {
  const activeTab = useSentinelStore((state) => state.activeTab);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingHero />;
      case 'dashboard':
        return <DashboardView />;
      case 'scanner':
        return <TransactionScannerView />;
      case 'wallet':
        return <WalletHealthView />;
      case 'approvals':
        return <ApprovalManagerView />;
      case 'community':
        return <ThreatIntelView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <LandingHero />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex-1"
        >
          {renderActiveView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
