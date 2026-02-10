"use client";

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Play, Info, Check, Send, X } from 'lucide-react';
import { mockPrivateFlows, FlowRole } from '@/lib/demo-data';
import { CanvasNode, CanvasEdge } from './CanvasComponents';

interface PrivateCanvasProps {
  flowId: string | null;
  onBack: () => void;
  onReady: () => void;
}

export const PrivateCanvas: React.FC<PrivateCanvasProps> = ({ flowId, onBack, onReady }) => {
  const flow = useMemo(() => mockPrivateFlows.find(f => f.id === flowId), [flowId]);
  const [roles, setRoles] = useState<FlowRole[]>(flow?.roles || []);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerStatus, setOfferStatus] = useState<'IDLE' | 'SENDING' | 'SENT'>('IDLE');

  // Canvas Transform State
  const [scale, setScale] = useState(1);
  const [pan] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number, y: number }> = {};
    if (!roles.length) return positions;

    // Layout Logic:
    // Top: Issuer
    positions[roles[0].id] = { x: 0, y: -200 };
    
    // Middle: Broker, TA, ATS
    positions[roles[1].id] = { x: -300, y: 0 };
    positions[roles[2].id] = { x: 0, y: 0 };
    positions[roles[3].id] = { x: 300, y: 0 };
    
    // Bottom: Custodian, Oracle, Compliance
    positions[roles[4].id] = { x: -300, y: 200 };
    positions[roles[5].id] = { x: 0, y: 200 };
    positions[roles[6].id] = { x: 300, y: 200 };

    return positions;
  }, [roles]);

  const handleSendOffer = () => {
    setOfferStatus('SENDING');
    setTimeout(() => {
      setOfferStatus('SENT');
      // Mock 'filling' the role after offer is accepted (for demo purposes we'll just mark it sent)
      setRoles(prev => prev.map(r => r.id === selectedRoleId ? { ...r, status: 'FILLED', filledBy: 'Anchorage Digital' } : r));
    }, 2000);
  };

  const isFlowReady = roles.every(r => r.status !== 'GAP');

  return (
    <div className="h-screen w-full bg-[#050505] flex flex-col overflow-hidden relative">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </button>
          <div>
            <h1 className="text-xl font-bold">{flow?.name}</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Status: {flow?.status} • {roles.filter(r => r.status !== 'GAP').length}/{roles.length} Roles Filled</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold hover:bg-white/10 transition-colors flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button 
            disabled={!isFlowReady}
            onClick={onReady}
            className={`px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${isFlowReady ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}
          >
            <Play className="w-4 h-4" /> ACTIVATE FLOW
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        onWheel={(e) => setScale(s => Math.min(Math.max(0.5, s - e.deltaY * 0.001), 2))}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', 
               backgroundSize: '40px 40px',
               transformOrigin: 'center'
             }} 
        />

        <motion.div 
          className="relative w-full h-full flex items-center justify-center"
          style={{ x: pan.x, y: pan.y, scale: scale }}
        >
          {/* Edges */}
          <CanvasEdge x1={0} y1={-200} x2={-300} y2={0} />
          <CanvasEdge x1={0} y1={-200} x2={0} y2={0} />
          <CanvasEdge x1={0} y1={-200} x2={300} y2={0} />
          <CanvasEdge x1={-300} y1={0} x2={-300} y2={200} />
          <CanvasEdge x1={0} y1={0} x2={0} y2={200} />
          <CanvasEdge x1={300} y1={0} x2={300} y2={200} />

          {/* Nodes */}
          {roles.map((role, i) => {
            const pos = nodePositions[role.id];
            return (
              <CanvasNode 
                key={role.id} 
                role={role} 
                x={pos?.x || 0} 
                y={pos?.y || 0} 
                delay={i}
                onFind={() => {
                  setSelectedRoleId(role.id);
                  setShowOfferForm(true);
                }}
              />
            );
          })}
        </motion.div>
      </div>

      {/* Role Detail Sidebar */}
      <AnimatePresence>
        {showOfferForm && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute top-0 right-0 w-96 h-screen bg-[#0a0a0a] border-l border-white/10 z-[60] p-8 shadow-2xl flex flex-col"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold">SEND FLOW OFFER</h2>
              <button onClick={() => { setShowOfferForm(false); setOfferStatus('IDLE'); }} className="p-2 hover:bg-white/5 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Target Candidate</p>
                <p className="text-lg font-bold">Anchorage Digital</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/20">C7 VERIFIED</span>
                  <span className="text-[10px] px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full border border-green-500/20">98% UPTIME</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest">Reward Share Proposed</label>
                  <div className="flex items-center gap-4">
                    <input type="range" className="flex-1 accent-blue-500" />
                    <span className="text-lg font-mono font-bold">15%</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest">Requirements Message</label>
                  <textarea 
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-blue-500/50 outline-none"
                    placeholder="We're building a first-of-kind DAT tokenization with crypto redemption..."
                  />
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                <p className="text-[10px] text-blue-300 leading-relaxed">Sending this offer creates an on-chain contract on Canton Network. Anchorage Digital can Accept, Counter, or Decline.</p>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <button 
                onClick={handleSendOffer}
                disabled={offerStatus !== 'IDLE'}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  offerStatus === 'IDLE' ? 'bg-white text-black hover:bg-blue-50' : 
                  offerStatus === 'SENDING' ? 'bg-blue-600 text-white' : 
                  'bg-green-600 text-white'
                }`}
              >
                {offerStatus === 'IDLE' && <><Send className="w-4 h-4" /> SEND OFFER</>}
                {offerStatus === 'SENDING' && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
                {offerStatus === 'SENT' && <><Check className="w-4 h-4" /> OFFER SENT ON-CHAIN</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
