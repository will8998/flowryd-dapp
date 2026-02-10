"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { participants } from '@/lib/canton-data';
import { Building2, ShieldCheck, Database, Network } from 'lucide-react';

export const ParticipantTray: React.FC = () => {
  const onDragStart = (event: React.DragEvent, participantId: string) => {
    event.dataTransfer.setData('application/reactflow', participantId);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-full bg-black/40 backdrop-blur-2xl border-b border-white/5 p-6 flex items-center gap-6 overflow-x-auto no-scrollbar">
      <div className="shrink-0 space-y-1 pr-6 border-r border-white/5">
        <p className="text-[10px] font-black italic font-mono uppercase text-blue-500">Resource Tray</p>
        <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest">Drag to Canvas</p>
      </div>

      <div className="flex gap-4">
        {participants.slice(0, 10).map((p) => (
          <motion.div
            key={p.id}
            draggable
            onDragStart={(event) => onDragStart(event as unknown as React.DragEvent, p.id)}
            whileHover={{ y: -4, scale: 1.05 }}
            className="w-48 shrink-0 bg-white/5 border border-white/10 rounded-2xl p-4 cursor-grab active:cursor-grabbing hover:border-blue-500/50 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center border border-white/10 group-hover:border-blue-500/30">
                {p.name.includes('Goldman') ? <Building2 className="w-4 h-4 text-blue-500" /> : 
                 p.name.includes('DTCC') ? <Database className="w-4 h-4 text-blue-500" /> : 
                 <Network className="w-4 h-4 text-blue-500" />}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-black italic font-mono uppercase truncate text-white/90">{p.name}</p>
                <p className="text-[8px] text-white/30 uppercase tracking-tighter truncate">{p.cantonRole}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
