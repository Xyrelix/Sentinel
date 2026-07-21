'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSentinelStore } from '../../store/useSentinelStore';

export const CustomCursor: React.FC = () => {
  const customCursorEnabled = useSentinelStore((state) => state.customCursorEnabled);
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    if (!customCursorEnabled) {
      document.body.classList.remove('custom-cursor-active');
      return;
    }

    document.body.classList.add('custom-cursor-active');

    const onMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement;
      const clickable = target.closest('button, a, input, [role="button"], .interactive-hover');
      setIsHovered(!!clickable);
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.classList.remove('custom-cursor-active');
    };
  }, [customCursorEnabled]);

  if (!customCursorEnabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden hidden lg:block">
      {/* Outer Soft Red Aura Glow */}
      <motion.div
        className="fixed top-0 left-0 w-32 h-32 rounded-full bg-primary/20 blur-2xl pointer-events-none"
        animate={{
          x: mousePosition.x - 64,
          y: mousePosition.y - 64,
          scale: isHovered ? 1.5 : isClicking ? 0.8 : 1,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 250, mass: 0.5 }}
      />

      {/* Outer Follower Ring */}
      <motion.div
        className={`fixed top-0 left-0 rounded-full border border-primary/60 pointer-events-none transition-colors duration-200 ${
          isHovered ? 'bg-primary/10 border-primary shadow-red-glow' : ''
        }`}
        animate={{
          x: mousePosition.x - (isHovered ? 20 : 12),
          y: mousePosition.y - (isHovered ? 20 : 12),
          width: isHovered ? 40 : 24,
          height: isHovered ? 40 : 24,
          scale: isClicking ? 0.75 : 1,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 350, mass: 0.2 }}
      />

      {/* Inner Precision Red Dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-primary pointer-events-none shadow-red-glow"
        animate={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
          scale: isClicking ? 1.5 : isHovered ? 0 : 1,
        }}
        transition={{ type: 'spring', damping: 40, stiffness: 600, mass: 0.1 }}
      />
    </div>
  );
};
