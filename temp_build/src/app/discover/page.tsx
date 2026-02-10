"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { participants, workflows, Participant } from '@/lib/canton-data';
import { Workflow, ArrowRight, Plus, X, ArrowLeft } from 'lucide-react';
import { ParticipantNode, ConnectionLine } from '@/components/discover/FlowComponents';
import { ZapierAddModal } from '@/components/discover/ZapierAddModal';
import { NavigateTeaser } from '@/components/discover/NavigateTeaser';
import { CantonLogin } from '@/components/discover/CantonLogin';
import { WizardOverlay } from '@/components/discover/WizardOverlay';
import { WorkflowRequirements } from '@/components/discover/WorkflowRequirements';
import FlowRydHeroAnimation from '@/components/FlowRydHeroAnimation';
import DemoSequence from '@/components/DemoSequence';

// Helper: Check if participant has a specific capability
const hasCap = (p: Participant, cap: string) => p.capabilities[cap] === 1;

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
  const [viewState, setViewState] = useState<'LANDING' | 'LOGIN' | 'APP'>('LANDING');

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
        {viewState === 'LANDING' && (
          <LandingView key="landing" onStart={() => setViewState('LOGIN')} />
        )}
        {viewState === 'LOGIN' && (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-20"
          >
            <CantonLogin onComplete={() => setViewState('APP')} />
          </motion.div>
        )}
        {viewState === 'APP' && (
          <AppView key="app" />
        )}
      </AnimatePresence>
    </div>
  );
}

function LandingView({ onStart }: { onStart: () => void }) {
  const handleLaunchClick = () => {
    onStart();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0, y: -50 }}
      className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#020202]"
    >
      <div className="max-w-5xl space-y-12 z-10 w-full">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center justify-center pt-8"
        >
          <div className="w-full max-w-2xl aspect-square sm:h-[500px] sm:w-[500px] flex items-center justify-center mb-8">
            <FlowRydHeroAnimation />
          </div>

          <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/10 border border-white/20 text-sm font-mono text-blue-300 tracking-wider backdrop-blur-sm">
            THE MISSING LINK NO-ONE IS TALKING ABOUT
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-tight">
            <span className="block text-white">
              The Orchestration Layer
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              for Canton Network
            </span>
          </h1>
        </motion.div>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed"
        >
          Stop coordinating complex transactions through email.<br/>
          <span className="text-white font-semibold">Start building on-chain activity with Flowryd.</span>
        </motion.p>
        
        <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.45 }}
           className="flex justify-center gap-8 py-4 text-sm font-mono text-white/50"
        >
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span>DISCOVER</span>
          <span className="flex items-center gap-2">→</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white/20"></span>NAVIGATE</span>
          <span className="flex items-center gap-2">→</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white/20"></span>ACTIVATE</span>
        </motion.div>

        <motion.div
           initial={{ y: 30, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.5 }}
           className="w-full max-w-4xl mx-auto py-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 text-white">How Flowryd Works</h2>
            <p className="text-white/60">From discovery to activation in three simple steps</p>
          </div>
          
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-black shadow-2xl shadow-blue-900/20">
             <DemoSequence />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl mx-auto w-full grid md:grid-cols-2 gap-6"
        >
          <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-2xl border border-blue-500/30 p-8 text-left relative overflow-hidden group hover:border-blue-500/50 transition-colors">
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
                   <Image src="/flow.svg" alt="Flowryd" width={24} height={24} className="w-6 h-6 text-white" />
                </div>
                <div className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-full border border-blue-500/20">
                  AVAILABLE NOW
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-1">DISCOVER</h2>
              <div className="text-3xl font-bold text-white mb-4">$100<span className="text-lg text-white/50 font-normal">/month</span></div>

              <p className="text-white/70 mb-6 text-sm leading-relaxed">
                Visualize connection opportunities, calculate collateral efficiency, and simulate network effects.
              </p>

              <ul className="text-sm text-white/80 space-y-3 mb-8">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full"/> Network grid builder</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full"/> VP badges (C7 Identity)</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full"/> Connection intelligence</li>
              </ul>

              <div className="mt-auto">
                <button 
                  onClick={() => window.open('https://flowryd.typeform.com/to/gESTfumm', '_blank')}
                  className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                >
                  Join as Provider <ArrowRight className="w-5 h-5" />
                </button>
                <div className="text-center mt-3 text-xs text-white/40">
                  Public Launch Pricing until April 30, 2026
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl border border-white/10 p-8 text-left relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 p-4 opacity-50">
               <Workflow className="w-24 h-24 text-white/5" />
            </div>

            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white/50 mb-6">Coming Soon</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-white/80 font-bold mb-1">
                    NAVIGATE <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded">WAITLIST</span>
                  </div>
                  <p className="text-sm text-white/50">Choose your path: Join existing flows, build from templates, or create custom workflows.</p>
                </div>
                
                <div className="w-full h-px bg-white/10" />

                <div>
                  <div className="flex items-center gap-2 text-white/80 font-bold mb-1">
                    ACTIVATE <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded">Q2 2026</span>
                  </div>
                  <p className="text-sm text-white/50">Deploy smart contracts, execute coordinated transactions, and earn FA markers.</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4">
                 <button
                    onClick={handleLaunchClick}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/30"
                  >
                    Launch App Demo
                    <ArrowRight className="w-4 h-4" />
                  </button>

                 <a
                    href="https://flowryd.typeform.com/to/UkJLqGuB"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all border border-white/10"
                  >
                    Join Waitlist
                    <ArrowRight className="w-4 h-4" />
                  </a>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="text-center pt-12 pb-4 space-y-2 opacity-60 hover:opacity-100 transition-opacity">
          <div className="text-sm font-semibold text-white tracking-wide">
            Canton Network - Let's Flow 🌊
          </div>
          <div className="text-[10px] text-zinc-500">
            © 2026 Flowryd Limited. All Rights Reserved.
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AppView() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<typeof workflows[0] | null>(null);
  const [network, setNetwork] = useState<Participant[]>([
    {
      id: 'user-node',
      name: 'Your Node',
      cantonRole: 'Participant',
      capabilities: { Custody: 1, Settlement: 1, Registry: 1 }, // Give user some basic caps
      criticality: 'REQUIRED',
      holdings: '$1.2B',
      validatorNodes: 1,
      description: 'Your local Canton participant node.',
      hosted: true,
      isUser: true
    }
  ]);
  const [showTeaser, setShowTeaser] = useState(false);
  
  // Smart Add Modal State
  const [smartAddOpen, setSmartAddOpen] = useState(false);
  
  // Wizard State
  const [showWizard, setShowWizard] = useState(true);

  // Canvas Transform State
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.node-interactive') || (e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.workflow-requirements')) return;
    
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
    if ((e.target as HTMLElement).closest('.custom-scrollbar')) return; // Don't zoom when scrolling list
    const zoomSensitivity = 0.001;
    const newScale = Math.min(Math.max(0.5, scale - e.deltaY * zoomSensitivity), 2);
    setScale(newScale);
  };

  // Calculate Node Positions (Layout Engine)
  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number, y: number }> = {};
    
    // 1. User Node always fixed at left-center
    positions['user-node'] = { x: -400, y: 0 };

    const otherNodes = network.filter(n => n.id !== 'user-node');
    if (otherNodes.length === 0) return positions;

    if (selectedWorkflow) {
      // 2. Workflow Sequence Layout
      const stages = selectedWorkflow.stages;
      // Create buckets for each stage + one for "Other/Unmatched"
      const stageGroups: Participant[][] = Array.from({ length: stages.length }, () => []);
      const leftovers: Participant[] = [];

      otherNodes.forEach(p => {
        let foundStage = -1;
        // Find the *earliest* stage that this participant can fulfill
        for (let i = 0; i < stages.length; i++) {
          const stage = stages[i];
          // Check if participant has ANY role required in this stage
          if (stage.roles.some(role => hasCap(p, role))) {
            foundStage = i;
            break;
          }
        }
        
        if (foundStage !== -1) {
          stageGroups[foundStage].push(p);
        } else {
          leftovers.push(p);
        }
      });

      // Position Stages
      // Start x from -100 (to right of User Node which is -400)
      let currentX = -100;
      const X_GAP = 300;
      const Y_GAP = 160;

      stageGroups.forEach((group) => {
        if (group.length > 0) {
          group.forEach((p, idx) => {
            // Center the column vertically around 0
            const y = (idx - (group.length - 1) / 2) * Y_GAP;
            positions[p.id] = { x: currentX, y };
          });
          currentX += X_GAP;
        }
      });

      // Position Leftovers (if any) at the end
      if (leftovers.length > 0) {
        leftovers.forEach((p, idx) => {
           const y = (idx - (leftovers.length - 1) / 2) * Y_GAP;
           positions[p.id] = { x: currentX, y };
        });
      }

    } else {
      // 3. Fallback Grid Layout (User Left, Others Grid Right)
      const GRID_X_START = -100;
      const COLS = 3;
      const X_GAP = 250;
      const Y_GAP = 150;

      otherNodes.forEach((p, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        
        // Center rows vertically based on total rows? 
        // Simple grid:
        positions[p.id] = { 
          x: GRID_X_START + (col * X_GAP), 
          y: -150 + (row * Y_GAP) // Start slightly up
        };
      });
    }
    
    return positions;
  }, [network, selectedWorkflow]);

  const addToNetwork = (p: Participant) => {
    if (!network.find(n => n.id === p.id)) {
      setNetwork(prev => [...prev, p]);
      setSmartAddOpen(false);
    }
  };

  const removeFromNetwork = (id: string) => {
    setNetwork(prev => prev.filter(n => n.id !== id));
  };

  // Metrics
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
      <div className="absolute top-4 left-4 z-50">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Back to Flowryd</span>
        </Link>
          </div>

      {/* Navigation Tabs - Global */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-black/40 backdrop-blur-xl border border-white/10 p-1 rounded-full">
        <button 
          onClick={() => setShowTeaser(false)}
          className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-all ${!showTeaser ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
          DISCOVER
        </button>
        <div className="w-px h-3 bg-white/10 mx-1" />
        <button 
          onClick={() => readinessScore >= 40 && setShowTeaser(true)}
          disabled={readinessScore < 40}
          className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-all ${showTeaser ? 'bg-blue-500 text-white shadow-lg shadow-blue-900/20' : (readinessScore >= 40 ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-white/20 cursor-not-allowed')}`}
        >
          NAVIGATE
        </button>
        <div className="w-px h-3 bg-white/10 mx-1" />
              <button
          disabled
          className="px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider text-white/20 cursor-not-allowed"
        >
          ACTIVATE
              </button>
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
      <div className="absolute top-24 left-4 z-30">
        <div className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-2 shadow-2xl min-w-[200px]">
           <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Select Workflow</h3>
          {selectedWorkflow ? (
            <div className="space-y-2">
               <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                   <Workflow className="w-4 h-4 text-blue-400" />
                   <span className="text-sm font-bold text-white">{selectedWorkflow.name}</span>
                </div>
                <button
                  onClick={() => { setSelectedWorkflow(null); setNetwork(network.filter(n => n.isUser)); }}
                  className="p-1 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[10px] text-white/50 leading-relaxed px-1">
                {selectedWorkflow.description}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {workflows.map(wf => (
                <button
                  key={wf.id}
                  onClick={() => setSelectedWorkflow(wf)}
                  className="text-left px-3 py-2 hover:bg-white/10 rounded-lg text-sm text-white/70 hover:text-white transition-colors"
                >
                  {wf.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Required Roles Checklist */}
      <AnimatePresence>
        {selectedWorkflow && (
           <WorkflowRequirements workflow={selectedWorkflow} network={network} />
        )}
      </AnimatePresence>

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
          {/* 1. Render Connections FIRST (Behind) */}
          {network.flatMap((source) => {
            const sourcePos = nodePositions[source.id];
            if (!sourcePos) return [];

            return network.map((target) => {
              if (source.id === target.id) return null;
              const targetPos = nodePositions[target.id];
              if (!targetPos) return null;
              
              let shouldConnect = false;
              let connectionColor = '#3b82f6';

              if (selectedWorkflow?.id === 'WF-001') {
                  if (
                    (hasCap(source, 'Issuer') && hasCap(target, 'Registry')) ||
                    (hasCap(source, 'Registry') && hasCap(target, 'Settlement')) ||
                    (hasCap(source, 'Settlement') && hasCap(target, 'Custody')) ||
                    (hasCap(source, 'Exchange') && hasCap(target, 'Settlement')) ||
                    (hasCap(source, 'Liquidity_Provider') && hasCap(target, 'Exchange'))
                  ) {
                    shouldConnect = true;
                    connectionColor = '#3b82f6'; 
                  }
              }
              else if (selectedWorkflow?.id === 'WF-021') {
                  if (
                    (hasCap(source, 'Collateral_Provider') && hasCap(target, 'Collateral_Agent')) ||
                    (hasCap(source, 'Collateral_Agent') && hasCap(target, 'Custody')) ||
                    (hasCap(source, 'Collateral_Taker') && hasCap(target, 'Liquidity_Provider')) ||
                    (hasCap(source, 'Custody') && hasCap(target, 'Settlement')) ||
                    (hasCap(source, 'Settlement') && hasCap(target, 'Registry'))
                  ) {
                     shouldConnect = true;
                     connectionColor = hasCap(source, 'Collateral_Provider') ? '#22c55e' : '#3b82f6';
                  }
              }
              else if (selectedWorkflow?.id === 'WF-022') {
                  if (
                    (hasCap(source, 'Cash_Lender') && hasCap(target, 'Repo_Platform')) ||
                    (hasCap(source, 'Cash_Borrower') && hasCap(target, 'Repo_Platform')) ||
                    (hasCap(source, 'Repo_Platform') && hasCap(target, 'Collateral_Agent')) ||
                    (hasCap(source, 'Collateral_Agent') && hasCap(target, 'Custody')) ||
                    (hasCap(source, 'Custody') && hasCap(target, 'Settlement'))
                  ) {
                    shouldConnect = true;
                    connectionColor = '#f97316'; 
                  }
              }
              if (!shouldConnect) {
                  if (hasCap(source, 'Registry') || hasCap(target, 'Registry')) {
                      shouldConnect = true;
                      connectionColor = '#ffffff';
                  }
              }

              if (shouldConnect) {
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
          })}

          {/* 2. Render Nodes SECOND (On Top) */}
          {network.map((participant, i) => {
            const pos = nodePositions[participant.id] || { x: 0, y: 0 };
            return (
              <div key={participant.id} className="node-interactive">
                <ParticipantNode 
                  participant={participant} 
                  x={pos.x} 
                  y={pos.y} 
                  onRemove={() => removeFromNetwork(participant.id)}
                  delay={i}
                />
          </div>
            );
          })}
        </motion.div>
          
        {/* Smart Add Button */}
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

      {/* Power Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
        <div className="bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center gap-4 shadow-2xl">
          <div className="flex gap-6 px-4 border-r border-white/10">
           <div className="text-center">
              <div className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1 justify-center">
                Assets <span className="text-[8px] text-white/20 border border-white/10 px-1 rounded bg-white/5">EST</span>
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

      <AnimatePresence>
        {showTeaser && (
          <NavigateTeaser 
            onBack={() => setShowTeaser(false)} 
            network={network}
          />
        )}
      </AnimatePresence>

      {showWizard && (
        <WizardOverlay 
          onComplete={() => setShowWizard(false)}
          onSkip={() => setShowWizard(false)}
        />
      )}
    </motion.div>
  );
}
