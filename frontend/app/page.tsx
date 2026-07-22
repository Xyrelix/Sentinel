'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSentinelStore } from '../store/useSentinelStore';
import { Navbar } from '../components/layout/Navbar';
import { LandingHero } from '../components/landing/LandingHero';
import { TransactionScannerView } from '../components/scanner/TransactionScannerView';
import { WalletHealthView } from '../components/wallet/WalletHealthView';
import { ReportsView } from '../components/reports/ReportsView';
import { SettingsView } from '../components/settings/SettingsView';

export default function Home() {
  const activeTab = useSentinelStore((state) => state.activeTab);
  const isConnected = useSentinelStore((state) => state.wallet.isConnected);

  const renderActiveView = () => {
    if (!isConnected) {
      return <LandingHero />;
    }

    switch (activeTab) {
      case 'landing':
        return <LandingHero />;
      case 'scanner':
        return <TransactionScannerView />;
      case 'wallet':
        return <WalletHealthView />;
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
          key={isConnected ? activeTab : 'landing'}
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
