// Custom Node Components for FlowRyd Discovery
// Since React Flow installation is blocked, we build a lightweight custom flow engine using Framer Motion.

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ShieldCheck, Coins, Database, Server, Wallet, X, User } from 'lucide-react';
import { Participant } from '@/lib/canton-data';

// Helper to get role icon
const getRoleIcon = (role: string) => {
  const r = role.toLowerCase();
  if (r.includes('participant') || r.includes('your')) return User;
  if (r.includes('registry')) return Database;
  if (r.includes('custody')) return ShieldCheck;
  if (r.includes('liquidity') || r.includes('financing')) return Coins;
  if (r.includes('node') || r.includes('validator')) return Server;
  if (r.includes('wallet')) return Wallet;
  return Building2;
};

// Helper to get role color
const getRoleColor = (role: string) => {
  const r = role.toLowerCase();
  if (r.includes('registry')) return 'blue';
  if (r.includes('custody')) return 'orange';
  if (r.includes('liquidity') || r.includes('financing')) return 'green';
  if (r.includes('exchange')) return 'purple';
  return 'gray';
};

interface ParticipantNodeProps {
  participant: Participant;
  x: number;
  y: number;
  onRemove?: () => void;
  onClick?: () => void;
  delay?: number;
}

export const ParticipantNode: React.FC<ParticipantNodeProps> = ({ participant, x, y, onRemove, onClick, delay = 0 }) => {
  const Icon = getRoleIcon(participant.cantonRole);
  const color = getRoleColor(participant.cantonRole);
  
  const colorClasses = {
    blue: 'border-blue-500/50 bg-blue-950/80 text-blue-400 shadow-blue-900/20',
    orange: 'border-orange-500/50 bg-orange-950/80 text-orange-400 shadow-orange-900/20',
    green: 'border-green-500/50 bg-green-950/80 text-green-400 shadow-green-900/20',
    purple: 'border-purple-500/50 bg-purple-950/80 text-purple-400 shadow-purple-900/20',
    gray: 'border-gray-500/50 bg-gray-950/80 text-gray-400 shadow-gray-900/20',
    user: 'border-white/80 bg-white/10 text-white shadow-[0_0_30px_rgba(255,255,255,0.2)]',
  };

  const baseClass = participant.id === 'user-node' ? colorClasses.user : (colorClasses[color as keyof typeof colorClasses] || colorClasses.gray);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
      animate={{ scale: 1, opacity: 1, x, y }}
      transition={{ 
        type: "spring", 
        stiffness: 60, 
        damping: 15, 
        delay: delay * 0.1 
      }}
      className="absolute top-1/2 left-1/2 z-20 cursor-pointer group"
      style={{ marginLeft: '-6rem', marginTop: '-3rem' }} // Center anchor point (w-48 = 12rem -> 6rem offset)
      onClick={onClick}
    >
      {/* Node Card */}
      <div className={`relative w-48 rounded-xl border backdrop-blur-md p-3 shadow-xl transition-all duration-300 hover:scale-105 hover:border-opacity-100 ${baseClass}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg bg-black/40 border border-white/5`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white leading-tight">{participant.name}</h3>
              <p className="text-[9px] opacity-70 uppercase tracking-wider">{participant.cantonRole.split(' ')[0]}</p>
            </div>
          </div>
          {onRemove && (
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="text-white/20 hover:text-red-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5">
          <div>
            <p className="text-[9px] text-white/40 uppercase">Assets</p>
            <p className="text-[10px] font-mono font-medium text-white/90">{participant.holdings || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[9px] text-white/40 uppercase">Validator</p>
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${participant.validatorNodes && participant.validatorNodes > 0 ? 'bg-green-500' : 'bg-gray-600'}`} />
              <p className="text-[10px] font-mono font-medium text-white/90">{participant.validatorNodes ? 'Active' : 'None'}</p>
            </div>
          </div>
        </div>

        {/* Selection Ring */}
        <div className="absolute -inset-px rounded-xl border-2 border-white/0 group-hover:border-white/10 transition-all pointer-events-none" />
      </div>
    </motion.div>
  );
};

// Removed HubNode as it is replaced by the User Node


export const ConnectionLine: React.FC<{ x1: number; y1: number; x2: number; y2: number; color?: string }> = ({
  x1,
  y1,
  x2,
  y2,
  color = '#3b82f6',
}) => {
  return (
    <svg 
      className="absolute top-1/2 left-1/2 pointer-events-none overflow-visible" 
      style={{ zIndex: -1 }}
    >
      <defs>
        <linearGradient id={`grad-${x1}-${y1}-${x2}-${y2}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="50%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill={color} fillOpacity="0.2" />
        </marker>
      </defs>
      <motion.path
        d={`M ${x1} ${y1} L ${x2} ${y2}`}
        stroke={`url(#grad-${x1}-${y1}-${x2}-${y2})`}
        strokeWidth="1.5"
        fill="none"
        markerEnd="url(#arrowhead)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      {/* Moving Packet Animation */}
      <motion.circle r="2" fill={color}>
        <animateMotion 
          dur="2s" 
          repeatCount="indefinite"
          path={`M ${x1} ${y1} L ${x2} ${y2}`}
        />
      </motion.circle>
    </svg>
  );
};
