"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ShieldCheck, Database, Search, User } from 'lucide-react';
import { FlowRole } from '@/lib/demo-data';

export const CanvasNode: React.FC<{
  role: FlowRole;
  x: number;
  y: number;
  delay?: number;
  onFind?: () => void;
}> = ({ role, x, y, delay = 0, onFind }) => {
  const isGap = role.status === 'GAP';
  const isKnown = role.status === 'KNOWN';
  
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
      animate={{ scale: 1, opacity: 1, x, y }}
      transition={{ type: "spring", stiffness: 60, damping: 15, delay: delay * 0.1 }}
      className="absolute top-1/2 left-1/2 z-20"
      style={{ marginLeft: '-6rem', marginTop: '-3rem' }}
    >
      <div className={`w-48 rounded-xl border backdrop-blur-md p-4 transition-all duration-300 shadow-2xl ${
        isGap ? 'border-yellow-500/30 bg-yellow-950/20 text-yellow-500' : 
        isKnown ? 'border-white/20 bg-white/5 text-white' : 
        'border-blue-500/30 bg-blue-950/20 text-blue-400'
      }`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
              {role.name.includes('Custodian') ? <ShieldCheck className="w-4 h-4" /> : 
               role.name.includes('Issuer') ? <User className="w-4 h-4" /> : 
               role.name.includes('Registry') ? <Database className="w-4 h-4" /> : 
               <Building2 className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-xs font-bold leading-tight">{role.name}</h3>
              <p className="text-[9px] opacity-60 uppercase tracking-widest">{role.status}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 mt-2 pt-2 border-t border-white/5">
          <p className="text-[10px] opacity-70 leading-snug">
            {isGap ? role.requirements : (role.filledBy || role.requirements)}
          </p>
          
          {isGap && (
            <button 
              onClick={onFind}
              className="w-full flex items-center justify-center gap-2 py-1.5 bg-yellow-500 text-black rounded-lg text-[10px] font-bold hover:bg-yellow-400 transition-colors mt-2"
            >
              <Search className="w-3 h-3" />
              FIND CANDIDATE
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const CanvasEdge: React.FC<{ x1: number; y1: number; x2: number; y2: number; active?: boolean }> = ({
  x1, y1, x2, y2, active = true
}) => {
  return (
    <svg className="absolute top-1/2 left-1/2 pointer-events-none overflow-visible" style={{ zIndex: -1 }}>
      <defs>
        <linearGradient id={`edge-grad-${x1}-${y1}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <motion.path
        d={`M ${x1} ${y1} L ${x2} ${y2}`}
        stroke={`url(#edge-grad-${x1}-${y1})`}
        strokeWidth="1.5"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1 }}
      />
      {active && (
        <motion.circle r="2" fill="#3b82f6">
          <animateMotion dur="3s" repeatCount="indefinite" path={`M ${x1} ${y1} L ${x2} ${y2}`} />
        </motion.circle>
      )}
    </svg>
  );
};
