import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, ArrowLeft, Building2, ShieldCheck, Database, Scale, Clock } from 'lucide-react';
import { Participant } from '@/lib/canton-data';
import Image from 'next/image';

interface NavigateTeaserProps {
  onBack: () => void;
  network: Participant[];
}

export const NavigateTeaser: React.FC<NavigateTeaserProps> = ({ onBack, network }) => {
  const participantCount = network.length;
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute inset-0 z-50 bg-[#080808] text-white overflow-y-auto font-sans"
    >
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-[#080808]/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Discover
        </button>
        <div className="text-sm font-mono text-blue-400">FLOWRYD NAVIGATE [PREVIEW]</div>
      </div>

      <div className="max-w-5xl mx-auto p-6 pb-24 space-y-12">
        
        {/* Header */}
        <header className="text-center space-y-4 py-8">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-wider mb-2"
          >
            PROFORMA GENERATED
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Flowryd Navigate</span>
          </h1>
          <p className="text-sm text-white/40 uppercase tracking-wider mt-1">
            Preview based on {participantCount} participants in your repo network
          </p>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Here&apos;s how we&apos;d orchestrate your Repo workflow based on your network configuration.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Analysis & Participants */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Section 1: Network Analysis */}
            <section className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <ActivityIcon className="w-5 h-5 text-blue-400" />
                Your Repo Network Analysis
              </h2>
              
              <div className="space-y-6">
                {/* Roles Covered */}
                <div>
                  <div className="text-xs font-bold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" /> Roles You Have Covered
                  </div>
                  <div className="space-y-3">
                    <div className="bg-black/30 rounded-lg p-3 border-l-2 border-green-500/50">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-white">Custody</span>
                        <span className="text-white/40">2/2 participants</span>
                      </div>
                      <div className="text-xs text-white/60">• Cygnet • State Street</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3 border-l-2 border-green-500/50">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-white">Oracle</span>
                        <span className="text-white/40">1/1 participants</span>
                      </div>
                      <div className="text-xs text-white/60">• Kaiko</div>
                    </div>
                  </div>
                </div>

                {/* Roles Needed */}
                <div>
                  <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Roles You Still Need
                  </div>
                  <div className="space-y-3">
                    <div className="bg-black/30 rounded-lg p-3 border-l-2 border-orange-500/50">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-white">Registry</span>
                        <span className="text-white/40">Need 2 more (have 1/3)</span>
                      </div>
                      <div className="text-xs text-white/60">Current: DTCC</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3 border-l-2 border-orange-500/50">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-white">Collateral Management</span>
                        <span className="text-white/40">Need 2 more (have 0/2)</span>
                      </div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3 border-l-2 border-orange-500/50">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-white">Legal</span>
                        <span className="text-white/40">Need 1 more (have 0/1)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Suggested Participants */}
            <section>
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                Suggested Participants (AI-Matched)
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {/* DTCC Card */}
                <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl border border-white/10 p-5 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-blue-900/30 border border-blue-500/30 flex items-center justify-center">
                        <Database className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-bold">DTCC</div>
                        <div className="text-xs text-white/50">Role: Registry</div>
                      </div>
                    </div>
                    <div className="text-xs font-mono text-green-400 bg-green-900/20 px-2 py-1 rounded">95/100</div>
                  </div>
                  <p className="text-sm text-white/60 mb-4 flex-1">
                    Foundation member, well connected across 45+ nodes, existing validator infrastructure.
                  </p>
                  <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded text-sm font-medium transition-colors">
                    Select for Offer
                  </button>
                </div>

                {/* Clearstream Card */}
                <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl border border-white/10 p-5 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-purple-900/30 border border-purple-500/30 flex items-center justify-center">
                        <Database className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="font-bold">Clearstream</div>
                        <div className="text-xs text-white/50">Role: Registry</div>
                      </div>
                    </div>
                    <div className="text-xs font-mono text-green-400 bg-green-900/20 px-2 py-1 rounded">88/100</div>
                  </div>
                  <p className="text-sm text-white/60 mb-4 flex-1">
                    Multi-region coverage, specialized in cross-border repo workflows.
                  </p>
                  <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded text-sm font-medium transition-colors">
                    Select for Offer
                  </button>
                </div>

                {/* HQLAx Card */}
                <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl border border-white/10 p-5 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-orange-900/30 border border-orange-500/30 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <div className="font-bold">HQLAx</div>
                        <div className="text-xs text-white/50">Role: Collateral</div>
                      </div>
                    </div>
                    <div className="text-xs font-mono text-green-400 bg-green-900/20 px-2 py-1 rounded">92/100</div>
                  </div>
                  <p className="text-sm text-white/60 mb-4 flex-1">
                    Market leader for collateral mobility, pre-integrated with major custodians.
                  </p>
                  <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded text-sm font-medium transition-colors">
                    Select for Offer
                  </button>
                </div>

                {/* Allen & Overy Card */}
                <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl border border-white/10 p-5 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-gray-800 border border-white/20 flex items-center justify-center">
                        <Scale className="w-5 h-5 text-white/70" />
                      </div>
                      <div>
                        <div className="font-bold">Allen & Overy</div>
                        <div className="text-xs text-white/50">Role: Legal</div>
                      </div>
                    </div>
                    <div className="text-xs font-mono text-green-400 bg-green-900/20 px-2 py-1 rounded">85/100</div>
                  </div>
                  <p className="text-sm text-white/60 mb-4 flex-1">
                    Pre-approved legal frameworks for digital asset repo contracts.
                  </p>
                  <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded text-sm font-medium transition-colors">
                    Select for Offer
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Roadmap & CTA */}
          <div className="space-y-8">
            
            {/* Section 3: Orchestration Pathway */}
            <section className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-bold mb-6">Activation Roadmap</h2>
              <div className="relative space-y-8 pl-6 border-l border-white/10">
                
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#080808] shadow-[0_0_0_4px_rgba(34,197,94,0.2)]"></div>
                  <h3 className="text-sm font-bold text-green-400 mb-1">Step 1: Establish Custody</h3>
                  <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">BEACHHEAD • COMPLETE</p>
                  <div className="text-sm text-white/70 bg-black/30 p-3 rounded-lg border border-white/5">
                    • Cygnet committed<br/>
                    • State Street committed
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-blue-500 animate-pulse border-2 border-[#080808] shadow-[0_0_0_4px_rgba(59,130,246,0.2)]"></div>
                  <h3 className="text-sm font-bold text-white mb-1">Step 2: Add Registries</h3>
                  <p className="text-xs text-blue-400 mb-2 uppercase tracking-wider">NEXT ACTION</p>
                  <div className="text-sm text-white/70 bg-blue-900/10 p-3 rounded-lg border border-blue-500/20">
                    • Contact DTCC (Priority)<br/>
                    • Contact Clearstream (Backup)
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-[#222] border-2 border-white/20"></div>
                  <h3 className="text-sm font-bold text-white/60 mb-1">Step 3: Secure Collateral</h3>
                  <p className="text-xs text-white/30 mb-2 uppercase tracking-wider">THEN</p>
                  <div className="text-sm text-white/40">
                    Engage HQLAx after registries confirm participation.
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-[#222] border-2 border-white/20"></div>
                  <h3 className="text-sm font-bold text-white/60 mb-1">Step 4: Legal Framework</h3>
                  <p className="text-xs text-white/30 mb-2 uppercase tracking-wider">FINALLY</p>
                  <div className="text-sm text-white/40">
                    Bring in Allen & Overy for multi-party contract deployment.
                  </div>
                </div>

              </div>
            </section>

            {/* Section 4: Call to Action */}
            <section className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-2xl border border-white/10 p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20"></div>

              <div className="relative z-10">
                <div className="w-12 h-12 mx-auto bg-white rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Image src="/flow.svg" alt="Flowryd" width={32} height={32} className="w-8 h-8" />
                </div>

                <h2 className="text-xl font-bold mb-4">This is Flowryd Navigate</h2>

                <p className="text-sm text-white/70 mb-4">
                  Full platform launches <b>Q1 2026</b> with:
                </p>

                <ul className="text-sm text-white/80 mb-6 space-y-1 text-left max-w-sm mx-auto">
                  <li>• Send/receive coordination offers</li>
                  <li>• Direct participant messaging</li>
                  <li>• Contract orchestration</li>
                  <li>• Success tracking</li>
                </ul>

                <div className="space-y-3 mb-3">
                  <a
                    href="https://flowryd.typeform.com/to/UkJLqGuB"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 bg-white text-black hover:bg-gray-100 font-bold rounded-lg transition-all shadow-lg shadow-white/10"
                  >
                    [Subscribe Now - $3,500/year]
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <a
                    href="https://flowryd.typeform.com/to/UkJLqGuB"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg transition-all border border-white/20"
                  >
                    [Join Waitlist - Stay Updated]
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                <div className="text-xs text-white/60">
                  2025 Founders: 25% FA reward share
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Helper Icon Component
function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
