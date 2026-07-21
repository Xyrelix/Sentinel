'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface RiskGaugeProps {
  score: number; // 0 to 100
  size?: number;
  showDetails?: boolean;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  size = 220,
  showDetails = true,
}) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let current = 0;
    const duration = 1200; // ms
    const step = Math.ceil(score / (duration / 16));

    const timer = setInterval(() => {
      current += step;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(current);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [score]);

  // Color mapping based on score
  const getColor = (val: number) => {
    if (val <= 25) return { stroke: '#22C55E', text: 'text-success', label: 'Low Risk', glow: 'rgba(34, 197, 94, 0.4)' };
    if (val <= 50) return { stroke: '#FACC15', text: 'text-warning', label: 'Moderate Risk', glow: 'rgba(250, 204, 21, 0.4)' };
    if (val <= 75) return { stroke: '#F97316', text: 'text-orange-500', label: 'High Risk', glow: 'rgba(249, 115, 22, 0.4)' };
    return { stroke: '#FF3B30', text: 'text-primary', label: 'Critical Risk', glow: 'rgba(255, 59, 48, 0.5)' };
  };

  const currentTheme = getColor(displayScore);

  const radius = (size - 30) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc angle: 240 degrees (semi-circle gauge)
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (arcLength * displayScore) / 100;
  // Needle rotation calculation (-120 to +120 deg)
  const needleAngle = -120 + (displayScore / 100) * 240;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-[210deg] drop-shadow-md"
        >
          {/* Background Gauge Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1E1E1E"
            strokeWidth="16"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Animated Filled Arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={currentTheme.stroke}
            strokeWidth="16"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0px 0px 8px ${currentTheme.glow})` }}
          />
        </svg>

        {/* Center Score Counter */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-4xl font-extrabold tracking-tight ${currentTheme.text}`}
          >
            {displayScore}%
          </motion.span>
          <span className="text-xs uppercase tracking-wider text-accent font-medium mt-1">
            Threat Score
          </span>
        </div>

        {/* Animated Needle */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-1000 ease-out"
          style={{ transform: `rotate(${needleAngle}deg)` }}
        >
          <div className="w-1 h-20 bg-gradient-to-t from-primary to-transparent rounded-full -translate-y-10 shadow-red-glow" />
        </div>
      </div>

      {showDetails && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex flex-col items-center"
        >
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/5 border border-white/10 ${currentTheme.text}`}
          >
            {currentTheme.label}
          </span>
        </motion.div>
      )}
    </div>
  );
};
