'use client';

import React from 'react';
import { Settings, Shield, Bell, Cpu, MousePointer, Sliders } from 'lucide-react';
import { useSentinelStore } from '../../store/useSentinelStore';
import { GlowCard } from '../ui/GlowCard';

export const SettingsView: React.FC = () => {
  const customCursorEnabled = useSentinelStore((state) => state.customCursorEnabled);
  const setCustomCursorEnabled = useSentinelStore((state) => state.setCustomCursorEnabled);
  const autoScanEnabled = useSentinelStore((state) => state.autoScanEnabled);
  const setAutoScanEnabled = useSentinelStore((state) => state.setAutoScanEnabled);
  const riskThreshold = useSentinelStore((state) => state.riskThreshold);
  const setRiskThreshold = useSentinelStore((state) => state.setRiskThreshold);
  const addToast = useSentinelStore((state) => state.addToast);

  const handleSave = () => {
    addToast({
      type: 'success',
      title: 'Settings Saved',
      description: 'Your Sentinel security preferences have been updated.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#1E1E1E]">
        <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          Platform Settings
        </h2>
        <p className="text-sm text-accent mt-1">
          Customize AI scanning sensitivity, visual effects, RPC endpoints, and alert preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* AI Scanning Preferences */}
        <GlowCard className="p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#1E1E1E]">
            <Cpu className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-white">AI Scanner Configuration</h3>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Automatic Pre-Sign Detection</h4>
              <p className="text-xs text-accent">Intercept wallet signatures before hardware wallet prompts</p>
            </div>
            <button
              onClick={() => setAutoScanEnabled(!autoScanEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                autoScanEnabled ? 'bg-primary' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  autoScanEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-white">Risk Alert Threshold</span>
              <span className="text-primary font-bold">{riskThreshold}% Threat Score</span>
            </div>
            <input
              type="range"
              min="20"
              max="90"
              value={riskThreshold}
              onChange={(e) => setRiskThreshold(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </GlowCard>

        {/* Visual & UX Controls */}
        <GlowCard className="p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#1E1E1E]">
            <MousePointer className="w-5 h-5 text-accent" />
            <h3 className="text-base font-bold text-white">Visual & Motion FX</h3>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Interactive Red Aura Cursor</h4>
              <p className="text-xs text-accent">Enable mouse-following neon aura and precision spring cursor</p>
            </div>
            <button
              onClick={() => setCustomCursorEnabled(!customCursorEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                customCursorEnabled ? 'bg-primary' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  customCursorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </GlowCard>

        {/* OKX RPC Endpoint */}
        <GlowCard className="p-6 space-y-4">
          <div className="flex items-center gap-3 pb-2">
            <Sliders className="w-5 h-5 text-warning" />
            <h3 className="text-base font-bold text-white">OKX X Layer RPC Endpoint</h3>
          </div>

          <input
            type="text"
            defaultValue="https://rpc.xlayer.tech"
            className="w-full px-4 py-3 rounded-xl bg-[#080808] border border-[#1E1E1E] text-white text-xs font-mono focus:border-primary focus:outline-none"
          />
        </GlowCard>

        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-red-600 text-white font-bold text-sm shadow-red-glow hover:shadow-red-glow-lg transition-all"
        >
          Save Security Preferences
        </button>
      </div>
    </div>
  );
};
