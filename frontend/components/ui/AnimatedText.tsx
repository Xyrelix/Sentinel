'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

type SplitBy = 'word' | 'char';

interface AnimatedTextProps {
  /** Plain text to animate. For rich markup use `children` instead. */
  text?: string;
  children?: React.ReactNode;
  /** Split animation granularity. Defaults to per-word (smoother for long copy). */
  splitBy?: SplitBy;
  /** Rendered element. Defaults to a span. */
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  /** Seconds between each word/char reveal. */
  stagger?: number;
  /** Seconds to wait before the first item animates. */
  delay?: number;
  /** Only animate when scrolled into view (vs. immediately on mount). */
  once?: boolean;
}

const container = (stagger: number, delay: number): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

const item: Variants = {
  hidden: { opacity: 0, y: '0.5em', filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: '0em',
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Staggered reveal for headings and hero copy — each word (or character) fades,
 * slides up, and de-blurs in sequence. Matches Sentinel's "focus into clarity"
 * security motif. Respects prefers-reduced-motion via framer-motion defaults.
 */
export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  children,
  splitBy = 'word',
  as = 'span',
  className,
  stagger = 0.06,
  delay = 0,
  once = true,
}) => {
  const MotionTag = motion[as as 'span'] as typeof motion.span;

  // Rich children (e.g. gradient <span>) — animate as a single unit.
  if (children) {
    return (
      <MotionTag
        className={cn('inline-block', className)}
        variants={item}
        initial="hidden"
        whileInView={once ? 'visible' : undefined}
        animate={once ? undefined : 'visible'}
        viewport={once ? { once: true, amount: 0.4 } : undefined}
      >
        {children}
      </MotionTag>
    );
  }

  const tokens = splitBy === 'char' ? Array.from(text ?? '') : (text ?? '').split(' ');

  return (
    <MotionTag
      className={cn('inline-block', className)}
      variants={container(stagger, delay)}
      initial="hidden"
      whileInView={once ? 'visible' : undefined}
      animate={once ? undefined : 'visible'}
      viewport={once ? { once: true, amount: 0.4 } : undefined}
      aria-label={text}
    >
      {tokens.map((token, i) => (
        <motion.span
          key={`${token}-${i}`}
          variants={item}
          className="inline-block whitespace-pre"
          aria-hidden
        >
          {token}
          {splitBy === 'word' && i < tokens.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </MotionTag>
  );
};
