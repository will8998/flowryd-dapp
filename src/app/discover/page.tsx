"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { participants, workflows, Participant } from '@/lib/canton-data';
import { Workflow, CheckCircle2, ArrowRight, Database, Activity, ShieldCheck, Plus, X, Loader2, ArrowLeft } from 'lucide-react';
import { ParticipantNode, HubNode, ConnectionLine } from '@/components/discover/FlowComponents';
import { ZapierAddModal } from '@/components/discover/ZapierAddModal';

// ... (Helper functions remain the same) ...

const parseHoldings = (val: string | undefined): number => {
  if (!val || val === 'N/A') return 0;
  const num = parseFloat(val.replace(/[^0-9.]/g, ''));
  if (val.includes('T')) return num * 1000000000000;
  if (val.includes('B')) return num * 1000000000;
  if (val.includes('M')) return num * 1000000;
  return num;
};

const formatLargeNumber = (num: number): string => {
  if (num >= 1000000000000) return `$${(num / 1000000000000).toFixed(1)}T`;
  if (num >= 1000000000) return `$${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  return `$${num.toLocaleString()}`;
};

export default function DiscoverPage() {
  const [hasStarted, setStarted] = useState(false);

  // Hide global header/footer while on Discover experience for full-canvas focus
  useEffect(() => {
    const headerEl = document.querySelector("header");
    const footerEl = document.querySelector("footer");

    const prevHeaderDisplay =
      headerEl instanceof HTMLElement ? headerEl.style.display : undefined;
    const prevFooterDisplay =
      footerEl instanceof HTMLElement ? footerEl.style.display : undefined;

    if (headerEl instanceof HTMLElement) headerEl.style.display = "none";
    if (footerEl instanceof HTMLElement) footerEl.style.display = "none";

    return () => {
      if (headerEl instanceof HTMLElement) {
        headerEl.style.display = prevHeaderDisplay ?? "";
      }
      if (footerEl instanceof HTMLElement) {
        footerEl.style.display = prevFooterDisplay ?? "";
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <AnimatePresence mode="wait">
        {!hasStarted ? (
          <LandingView key="landing" onStart={() => setStarted(true)} />
        ) : (
          <AppView key="app" />
        )}
      </AnimatePresence>
    </div>
  );
}

function LandingView({ onStart }: { onStart: () => void }) {
  // ... (LandingView implementation remains the same) ...
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0, y: -50 }}
      className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center lzr-background"
    >
      <div className="max-w-4xl space-y-8 z-10">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
              Discover Your
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Network Impact
            </span>
          </h1>
        </motion.div>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto leading-relaxed"
        >
          Visualize connection opportunities, calculate collateral efficiency, and simulate network effects with real-time Canton Network data.
        </motion.p>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
        >
          <button 
            onClick={onStart}
            className="group relative px-8 py-4 bg-white text-black rounded-lg font-semibold text-lg overflow-hidden transition-transform hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-10 transition-opacity" />
            <span className="flex items-center gap-2">
              Launch Discovery Engine <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left"
        >
          <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <Database className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Real-time Data</h3>
            <p className="text-sm text-white/60">Access holdings and capabilities from 50+ Canton participants.</p>
          </div>
          <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <Activity className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Impact Analysis</h3>
            <p className="text-sm text-white/60">Calculate network centrality and collateral efficiency instantly.</p>
          </div>
          <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <ShieldCheck className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Repo Readiness</h3>
            <p className="text-sm text-white/60">Assess workflow readiness with automated role validation.</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function AppView() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<typeof workflows[0] | null>(null);
  const [network, setNetwork] = useState<Participant[]>([]);
  const [showTeaser, setShowTeaser] = useState(false);
  
  // Smart Add Modal State
  const [smartAddOpen, setSmartAddOpen] = useState(false);

  // Canvas Transform State
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.node-interactive') || (e.target as HTMLElement).closest('button')) return;
    
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    
    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (containerRef.current) containerRef.current.style.cursor = 'grab';
  };

  // Zoom Handler
  const handleWheel = (e: React.WheelEvent) => {
    const zoomSensitivity = 0.001;
    const newScale = Math.min(Math.max(0.5, scale - e.deltaY * zoomSensitivity), 2);
    setScale(newScale);
  };

  // Layout logic remains similar but connects to other nodes
  const getLayoutPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI;
    const radius = 280;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    };
  };

  const addToNetwork = (p: Participant) => {
    if (!network.find(n => n.id === p.id)) {
      setNetwork(prev => [...prev, p]);
      setSmartAddOpen(false);
    }
  };

  const removeFromNetwork = (id: string) => {
    setNetwork(prev => prev.filter(n => n.id !== id));
  };

  // Calculations...
  const totalHoldingsVal = network.reduce((acc, p) => acc + parseHoldings(p.holdings), 0);
  const totalValidators = network.reduce((acc, p) => acc + (p.validatorNodes || 0), 0);

  const calculateCentrality = () => {
    if (network.length === 0) return 0;
    let score = 0;
    const foundationCount = network.filter(p => p.superValidator).length;
    score += (foundationCount / network.length) * 25;
    const validatorCount = network.filter(p => (p.validatorNodes || 0) > 0).length;
    score += (validatorCount / network.length) * 25;
    const uniqueRoles = new Set(network.flatMap(p => Object.keys(p.capabilities)));
    score += Math.min(uniqueRoles.size / 8, 1) * 25;
    score += Math.min(network.length / 10, 1) * 25;
    return Math.round(score);
  };

  const centralityScore = calculateCentrality();

  // Readiness
  const requiredRoles = selectedWorkflow ? selectedWorkflow.roles : [];
  const fulfilledRoles = requiredRoles.filter(role => 
    network.some(p => p.capabilities[role] === 1)
  );
  const readinessScore = selectedWorkflow 
    ? Math.round((fulfilledRoles.length / requiredRoles.length) * 100) 
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="h-screen flex flex-col bg-[#050505] overflow-hidden relative font-sans"
    >
      {/* Back to main site */}
      <div className="absolute top-4 left-4 z-40">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Back to Flowryd</span>
        </Link>
      </div>
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', 
             backgroundSize: '40px 40px',
             transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
             transformOrigin: 'center'
           }} 
      />

      {/* Workflow Selector */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30">
        <div className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-full p-1.5 flex items-center gap-2 shadow-2xl">
          {selectedWorkflow ? (
            <>
              <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-2">
                <Workflow className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-bold text-white">{selectedWorkflow.name}</span>
          </div>
              <button
                onClick={() => { setSelectedWorkflow(null); setNetwork([]); }}
                className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              {workflows.map(wf => (
                <button
                  key={wf.id}
                  onClick={() => setSelectedWorkflow(wf)}
                  className="px-4 py-2 hover:bg-white/10 rounded-full text-sm text-white/70 hover:text-white transition-colors whitespace-nowrap"
                >
                  {wf.name}
              </button>
            ))}
          </div>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 relative flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Transform Container */}
        <motion.div 
          className="relative w-full h-full flex items-center justify-center"
          style={{ 
            x: pan.x, 
            y: pan.y, 
            scale: scale 
          }}
        >
          {/* Determine connections based on "Smart Money Flow" logic */}
          {network.map((source, i) => {
            const sourcePos = getLayoutPosition(i, network.length);
            
            // Find relevant connections based on roles
            const connections = network.map((target, j) => {
              if (i === j) return null;
              
              // Role-based connection logic
              const sRole = source.cantonRole.toLowerCase();
              const tRole = target.cantonRole.toLowerCase();
              
              let shouldConnect = false;
              let connectionColor = '#3b82f6'; // default blue

              if (selectedWorkflow?.id === 'WF-021') { // Collateral Management
                // Collateral Provider <-> Custody
                if (sRole.includes('collateral') && tRole.includes('custody')) {
                  shouldConnect = true;
                  connectionColor = '#3b82f6'; // blue
                }
                // Collateral Provider <-> Collateral Taker
                else if (sRole.includes('collateral_provider') && tRole.includes('collateral_taker')) {
                  shouldConnect = true;
                  connectionColor = '#22c55e'; // green
                }
                // Everyone <-> Registry
                else if (sRole.includes('registry') || tRole.includes('registry')) {
                  shouldConnect = true;
                  connectionColor = '#6b7280'; // gray
                }
              } else if (selectedWorkflow?.id === 'WF-022') { // Repo Processing
                // Cash Lender <-> Cash Borrower
                if ((sRole.includes('lender') && tRole.includes('borrower')) || (sRole.includes('borrower') && tRole.includes('lender'))) {
                  shouldConnect = true;
                  connectionColor = '#22c55e'; // green
                }
                // Borrower <-> Collateral Provider
                else if (sRole.includes('borrower') && tRole.includes('collateral')) {
                  shouldConnect = true;
                  connectionColor = '#f97316'; // orange
                }
                // Collateral Provider <-> Custody
                else if (sRole.includes('collateral') && tRole.includes('custody')) {
                  shouldConnect = true;
                  connectionColor = '#3b82f6'; // blue
                }
                // Everyone <-> Registry
                else if (sRole.includes('registry') || tRole.includes('registry')) {
                  shouldConnect = true;
                  connectionColor = '#6b7280'; // gray
                }
              } else {
                // Default / Fallback Logic
                // Registry connects to everyone (central infrastructure)
                if (sRole.includes('registry')) {
                  shouldConnect = true;
                  connectionColor = '#60a5fa'; // blue
                }
                // Custody connects to Financing/Trading
                else if (sRole.includes('custody') && (tRole.includes('financing') || tRole.includes('liquidity'))) {
                  shouldConnect = true;
                  connectionColor = '#f97316'; // orange
                }
                // Financing connects to Collateral
                else if (sRole.includes('financing') && tRole.includes('collateral')) {
                  shouldConnect = true;
                  connectionColor = '#22c55e'; // green
                }
              }
              
              if (shouldConnect) {
                const targetPos = getLayoutPosition(j, network.length);
                return (
                  <ConnectionLine 
                    key={`${source.id}-${target.id}`} 
                    x1={sourcePos.x} 
                    y1={sourcePos.y} 
                    x2={targetPos.x} 
                    y2={targetPos.y} 
                    color={connectionColor} 
                  />
                );
              }
              return null;
            });

            return (
              <React.Fragment key={source.id}>
                {connections}
                <div className="node-interactive">
                  <ParticipantNode 
                    participant={source} 
                    x={sourcePos.x} 
                    y={sourcePos.y} 
                    onRemove={() => removeFromNetwork(source.id)}
                    delay={i}
                  />
          </div>
              </React.Fragment>
            );
          })}
          
          {/* Center Hub if no direct connections logic applies or for visual anchoring */}
          {network.length > 0 && <HubNode />}
        </motion.div>

        {/* Smart Add Button (Fixed relative to viewport) */}
        <div className={`absolute z-40 transition-all duration-500 ${network.length === 0 ? 'top-1/2 left-1/2 -translate-x-1/2 translate-y-16' : 'bottom-32 left-1/2 -translate-x-1/2'}`}>
          <div className="relative">
             <button 
              onClick={() => {
                if (selectedWorkflow) {
                  setSmartAddOpen(true);
                }
              }}
              disabled={!selectedWorkflow}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-lg transition-all hover:scale-105 ${
                selectedWorkflow 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30' 
                  : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
              }`}
            >
              <Plus className="w-5 h-5" />
              Add Participant
             </button>
             {!selectedWorkflow && (
               <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 whitespace-nowrap">
                 <div className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-md text-xs font-medium animate-pulse">
                   Select a workflow to begin
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Power Bar (Bottom Dock) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
        <div className="bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center gap-4 shadow-2xl">
          {/* Metrics */}
          <div className="flex gap-6 px-4 border-r border-white/10">
           <div className="text-center">
              <div className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1 justify-center">
                Assets
                <span className="text-[8px] text-white/20 border border-white/10 px-1 rounded bg-white/5" title="Estimated total assets of participants">EST</span>
              </div>
              <div className="text-sm font-mono font-bold text-white">{formatLargeNumber(totalHoldingsVal)}</div>
           </div>
            <div className="text-center">
              <div className="text-[10px] text-white/40 uppercase tracking-wider">Validators</div>
              <div className="text-sm font-mono font-bold text-white">{totalValidators}</div>
              </div>
            <div className="text-center">
              <div className="text-[10px] text-white/40 uppercase tracking-wider">Centrality</div>
              <div className="text-sm font-mono font-bold text-blue-400">{centralityScore}</div>
              </div>
           </div>

          {/* Readiness */}
          {selectedWorkflow && (
            <div className="flex items-center gap-4 px-2">
              <div className="w-32">
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] text-white/60">Readiness</span>
                  <span className="text-[10px] text-white font-bold">{readinessScore}%</span>
              </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-500 to-green-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${readinessScore}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => setShowTeaser(true)}
                disabled={readinessScore < 40}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-xs transition-colors"
              >
                Deploy Flow <ArrowRight className="w-3 h-3" />
              </button>
           </div>
          )}
        </div>
      </div>

      {/* Zapier-style Add Modal */}
      <AnimatePresence>
        {smartAddOpen && (
          <ZapierAddModal 
            isOpen={smartAddOpen}
            onClose={() => setSmartAddOpen(false)} 
            onSelect={(p) => {
              addToNetwork(p);
              setSmartAddOpen(false);
            }}
            participants={participants}
            existingParticipantIds={network.map(n => n.id)}
          />
        )}
      </AnimatePresence>

      {/* Teaser Modal */}
      <AnimatePresence>
        {showTeaser && (
          <TeaserModal onClose={() => setShowTeaser(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ... (TeaserModal remains the same) ...
function TeaserModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate network request
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
        
        {step === 1 ? (
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <Workflow className="w-8 h-8 text-blue-400" />
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
        </div>
        
            <h2 className="text-2xl font-bold text-white mb-2">Deploy this Workflow</h2>
            <p className="text-white/60 mb-6 text-sm leading-relaxed">
              You are about to initiate a multi-party orchestration flow. To proceed to the <b>FlowRyd Navigate</b> environment and invite participants, please verify your credentials.
            </p>

            <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/5 space-y-3">
              <div className="flex items-center gap-3 text-sm text-white/80">
                <CheckCircle2 className="w-4 h-4 text-green-400" /> Smart Contract Generation
              </div>
              <div className="flex items-center gap-3 text-sm text-white/80">
                <CheckCircle2 className="w-4 h-4 text-green-400" /> Participant Invitation
              </div>
              <div className="flex items-center gap-3 text-sm text-white/40">
                <div className="w-4 h-4 border border-white/20 rounded-full flex-shrink-0" /> Network Deployment
              </div>
        </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">Work Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-black border border-white/20 rounded-lg p-3 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-white/20"
                  placeholder="name@company.com"
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue to Navigate"}
              </button>
            </form>
          </div>
        ) : (
          <div className="p-12 text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">Request Received</h2>
            <p className="text-white/60 mb-8 text-sm leading-relaxed max-w-xs mx-auto">
              We have queued your workflow request. A member of the FlowRyd onboarding team will contact you at <span className="text-white font-medium">{email}</span> shortly.
            </p>
        <button 
              onClick={onClose}
              className="px-8 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors text-sm"
        >
              Return to Discovery
        </button>
      </div>
        )}
    </motion.div>
    </div>
  );
}
