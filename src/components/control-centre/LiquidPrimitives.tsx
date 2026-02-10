"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const LiquidGlass: React.FC<{ children: React.ReactNode; className?: string; hover?: boolean }> = ({ children, className = '', hover = true }) => {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -2 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`relative group bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[32px] overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
      <div className="absolute inset-px rounded-[31px] border border-white/[0.05] pointer-events-none" />
      {children}
    </motion.div>
  );
};

export const LiquidLine: React.FC<{ x1: number; y1: number; x2: number; y2: number; color?: string; active?: boolean }> = ({
  x1, y1, x2, y2, color = '#3b82f6', active = true
}) => {
  return (
    <svg className="absolute top-1/2 left-1/2 pointer-events-none overflow-visible" style={{ zIndex: 0 }}>
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id={`liquid-grad-${x1}-${y1}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="50%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <motion.path
        d={`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`}
        stroke={`url(#liquid-grad-${x1}-${y1})`}
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        filter="url(#glow)"
      />
      {active && (
        <motion.circle r="3" fill="#fff" style={{ filter: 'blur(1px)' }}>
          <animateMotion dur="4s" repeatCount="indefinite" path={`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`} />
        </motion.circle>
      )}
    </svg>
  );
};
