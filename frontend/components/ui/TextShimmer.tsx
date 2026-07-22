'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TextShimmerProps {
  children: React.ReactNode;
  className?: string;
  /** Duration of one shimmer sweep, in seconds. */
  duration?: number;
  /** Highlight color swept across the text. Defaults to the primary red. */
  highlight?: string;
  /** Base text color the shimmer travels over. */
  base?: string;
}

/**
 * A subtle light sweep travelling across text - reads as an active "scan line",
 * matching Sentinel's real-time protection theme. Ideal for status badges and
 * eyebrow labels. Uses a moving background-clip gradient (GPU-cheap, no layout).
 */
export const TextShimmer: React.FC<TextShimmerProps> = ({
  children,
  className,
  duration = 3,
  highlight = '#FF3B30',
  base = 'rgba(161, 161, 170, 0.85)',
}) => {
  return (
    <motion.span
      className={cn('inline-block bg-clip-text text-transparent', className)}
      style={{
        backgroundImage: `linear-gradient(90deg, ${base} 0%, ${base} 40%, ${highlight} 50%, ${base} 60%, ${base} 100%)`,
        backgroundSize: '250% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
      }}
      initial={{ backgroundPosition: '150% 0%' }}
      animate={{ backgroundPosition: '-150% 0%' }}
      transition={{
        duration,
        ease: 'linear',
        repeat: Infinity,
        repeatDelay: 1.5,
      }}
    >
      {children}
    </motion.span>
  );
};
