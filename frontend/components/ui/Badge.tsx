'use client';

import React from 'react';
import { RiskLevel } from '../../types/sentinel';

interface BadgeProps {
  level?: RiskLevel;
  text?: string;
  variant?: 'default' | 'outline' | 'glow';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  level,
  text,
  variant = 'default',
  className = '',
}) => {
  const getBadgeStyle = () => {
    switch (level) {
      case 'SAFE':
        return 'bg-success/10 text-success border-success/30 shadow-[0_0_12px_rgba(34,197,94,0.2)]';
      case 'LOW':
        return 'bg-success/10 text-success border-success/30';
      case 'MEDIUM':
        return 'bg-warning/10 text-warning border-warning/30';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      case 'CRITICAL':
        return 'bg-primary/15 text-primary border-primary/40 shadow-red-glow';
      default:
        return 'bg-white/5 text-accent border-white/10';
    }
  };

  const displayText = text || level || 'INFO';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border backdrop-blur-md transition-all ${getBadgeStyle()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {displayText}
    </span>
  );
};
