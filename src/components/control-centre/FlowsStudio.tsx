"use client";

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Command,
  HelpCircle,
  CheckCircle2,
  Database,
  Workflow,
  LayoutTemplate,
  } from 'lucide-react';
import { StudioSidebar } from './StudioSidebar';
import { NetworkGrid } from './NetworkGrid';
import { NavigatePathways } from './NavigatePathways';
import { FlowSections } from './FlowSections';
import { ActivateEngine } from './ActivateEngine';
import { RydAITerminal } from './RydAITerminal';
import { OnboardingWizard } from './OnboardingWizard';
import { CollectiveHub } from './CollectiveHub';
import { TemplateGallery } from './TemplateGallery';
import { FlowBlueprintLibrary } from './FlowBlueprintLibrary';
import { TemplateFlowBuilder } from './TemplateFlowBuilder';
import { AdminPanel } from './AdminPanel';
import { authFetch } from '@/lib/auth-fetch';

import dynamic from 'next/dynamic';
const IntelligenceDashboard = dynamic(
  () => import('./IntelligenceDashboard'),
  { ssr: false, loading: () => <div className="w-full h-full bg-zinc-950" /> }
);

import { RetainerWidget } from './RetainerWidget';
import { CommandPalette } from './CommandPalette';
import { NotificationPanel } from './NotificationPanel';
import { HelpModal } from './HelpModal';
import { useCantonAuth } from '@/lib/auth-context';
import type { CantonFlow, CantonFlowStep } from '@/lib/canton-templates-data';
import type { Participant } from '@/lib/canton-data';

type Tier = 'DISCOVER' | 'NAVIGATE' | 'ACTIVATE' | 'JOIN' | 'ADMIN' | 'INTEL';
type NavigateView = 'templates' | 'blueprints' | 'library' | 'create' | 'template-builder';

interface SelectedJumpCut {
  id: string;
  name: string;
  nodes: Array<{ role: string; participantId: string; position: { x: number; y: number } }>;
}

export const FlowsStudio: React.FC = () => {
  const { user } = useCantonAuth();
  const [activeTier, setActiveTier] = useState<Tier>('DISCOVER');
  const [notifications, setNotifications] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [pendingJumpCut, setPendingJumpCut] = useState<SelectedJumpCut | null>(null);
  const [pendingParticipant, setPendingParticipant] = useState<Participant | null>(null);
  const [navigateView, setNavigateView] = useState<NavigateView>('templates');
  const [previousNavigateView, setPreviousNavigateView] = useState<NavigateView>('blueprints');
  const [selectedBlueprint, setSelectedBlueprint] = useState<{ flow: CantonFlow; steps: CantonFlowStep[] } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const hasSeen = localStorage.getItem('flowryd_onboarding_seen');
    if (!hasSeen) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('flowryd_onboarding_seen', 'true');
  };

  const handleTierChange = (tier: Tier) => {
    setActiveTier(tier);
    setShowCommandPalette(false);
    setShowNotifications(false);
    if (tier === 'NAVIGATE') {
      setNavigateView('templates');
    }
  };

  return (
    <div className="flex h-screen bg-background text-white overflow-hidden selection:bg-white/30">
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingWizard onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      <StudioSidebar activeTier={activeTier} onTierChange={handleTierChange} />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between px-8 z-40">
           <div className="flex items-center gap-8">
             <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 tracking-wide">
               <span className="text-white/60">Mission Control</span>
               <ChevronRight className="w-3 h-3" />
                <span className="text-white/80">{activeTier === 'DISCOVER' ? 'Discover Network' : activeTier === 'NAVIGATE' ? 'Build Flow' : activeTier === 'ACTIVATE' ? 'Finalise Deals' : activeTier === 'ADMIN' ? 'Administration' : activeTier === 'INTEL' ? 'Intelligence' : 'Marketplace'}</span>
             </div>

             <div className="h-4 w-px bg-white/5" />

             <div className="flex gap-4">
               {[
                 { id: 'DISCOVER', step: 1, label: '1. Discover Network' },
                 { id: 'NAVIGATE', step: 2, label: '2. Build Flow' },
                 { id: 'ACTIVATE', step: 3, label: '3. Finalise Deals' }
               ].map(t => (
                 <div key={t.id} className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold font-mono transition-all ${
                      activeTier === t.id ? 'border border-white/30 bg-black/40 text-white' : 
                      (t.step < (activeTier === 'DISCOVER' ? 1 : activeTier === 'NAVIGATE' ? 2 : activeTier === 'ACTIVATE' ? 3 : 4) ? 'bg-white/20 text-white/60' : 'bg-white/5 text-white/20')
                    }`}>
                     {t.step < (activeTier === 'DISCOVER' ? 1 : activeTier === 'NAVIGATE' ? 2 : activeTier === 'ACTIVATE' ? 3 : 4) ? <CheckCircle2 className="w-3 h-3" /> : t.step}
                   </div>
                   <span className={`text-[9px] font-bold tracking-wide ${activeTier === t.id ? 'text-white' : 'text-white/20'}`}>{t.label}</span>
                 </div>
               ))}
             </div>
           </div>

           <div className="flex items-center gap-6">
              <div 
                className="relative group hidden md:block cursor-pointer"
                onClick={() => setShowCommandPalette(true)}
              >
                <Command className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                <div className="bg-white/5 border border-white/10 rounded py-2 pl-9 pr-4 text-[10px] w-64 font-mono text-white/30 hover:border-white/20 transition-all">
                  Command Palette (⌘K)
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <button 
                    className="p-2 text-white/40 hover:text-white transition-colors relative"
                    onClick={() => setShowNotifications(prev => !prev)}
                  >
                    <Bell className="w-4 h-4" />
                    {notifications > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                  </button>
                  <NotificationPanel
                    isOpen={showNotifications}
                    onClose={() => setShowNotifications(false)}
                    onCountChange={setNotifications}
                  />
                </div>
                <button 
                  className="p-2 text-white/40 hover:text-white transition-colors"
                  onClick={() => setShowHelp(true)}
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
           </div>
        </header>

        <main className="flex-1 relative overflow-hidden min-h-0">
          <div className="h-full overflow-y-auto custom-scrollbar relative">
            <AnimatePresence mode="wait">
              {activeTier === 'DISCOVER' && <NetworkGrid key="discover" onSelectJumpCut={(jumpCut) => { setPendingJumpCut({ id: jumpCut.id, name: jumpCut.name, nodes: jumpCut.nodes }); handleTierChange('NAVIGATE'); setNavigateView('create'); }} onSelectParticipant={(participant) => { setPendingParticipant(participant); handleTierChange('NAVIGATE'); setNavigateView('create'); }} />}

              {activeTier === 'NAVIGATE' && (
                <div key="navigate" className="h-full flex flex-col">
                  {/* Navigation Sub-tabs */}
                  <div className="p-6 pb-0 border-b border-white/5">
                    <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded w-fit mb-4">
                      {[
                        { key: 'templates' as const, label: 'Templates', icon: Database },
                        { key: 'blueprints' as const, label: 'Blueprints', icon: Workflow },
                        { key: 'library' as const, label: 'My Flows', icon: LayoutTemplate }
                      ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = navigateView === tab.key;
                        
                        return (
                          <button
                            key={tab.key}
                            onClick={() => setNavigateView(tab.key)}
                            className={`
                              flex items-center gap-2 px-4 py-2 rounded transition-all duration-200 text-sm font-medium
                              ${isActive 
                                ? 'border border-white/30 bg-black/40 text-white' 
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                              }
                            `}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Create New Flow Button - only show on library view */}
                    {navigateView === 'library' && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => setNavigateView('create')}
                          className="px-4 py-2 border border-white/20 hover:border-white/40 rounded text-white text-sm font-medium transition-colors"
                        >
                          + Create New Flow
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 min-h-0">
                    <AnimatePresence mode="wait">
                      {navigateView === 'templates' && (
                        <TemplateGallery
                          key="templates"
          onNavigateToFlow={(flow, steps) => {
                            setSelectedBlueprint({ flow, steps });
                            setPreviousNavigateView(navigateView);
                            setNavigateView('template-builder');
                          }}
                        />
                      )}
                      {navigateView === 'blueprints' && (
                        <FlowBlueprintLibrary 
                          key="blueprints" 
          onUseBlueprint={(flow, steps) => {
                            setSelectedBlueprint({ flow, steps });
                            setPreviousNavigateView(navigateView);
                            setNavigateView('template-builder');
                          }}
                        />
                      )}
                      {navigateView === 'library' && (
                        <FlowSections key="library" />
                      )}
                      {navigateView === 'create' && (
                        <NavigatePathways
                          key="create"
                          initialJumpCut={pendingJumpCut}
                          onJumpCutConsumed={() => setPendingJumpCut(null)}
                          initialParticipant={pendingParticipant}
                          onParticipantConsumed={() => setPendingParticipant(null)}
                          onNavigateToTier={(tier) => handleTierChange(tier as Tier)}
                          onBackToLibrary={() => setNavigateView('library')}
                        />
                      )}
                      {navigateView === 'template-builder' && selectedBlueprint && (
                        <TemplateFlowBuilder
                          key="template-builder"
                          flow={selectedBlueprint.flow}
                          steps={selectedBlueprint.steps}
                          onBack={() => setNavigateView(previousNavigateView)}
                          onCreateWorkflow={async (flow, steps, participants) => {
                            try {
                              const res = await authFetch('/api/deals', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  title: flow.name,
                                  description: flow.description,
                                  metadata: { steps, participants, templateFlowId: flow.id },
                                }),
                              });
                              if (!res.ok) throw new Error('Failed to create deal');
                              const { data } = await res.json();
                              window.location.href = `/deals/${data.deal.id}`;
                            } catch (err) {
                              console.error('Failed to create deal:', err);
                              handleTierChange('ACTIVATE');
                            }
                          }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
              {activeTier === 'ACTIVATE' && <ActivateEngine key="activate" />}
              {activeTier === 'JOIN' && <CollectiveHub key="collective" />}
              {activeTier === 'ADMIN' && (
                user?.role === 'admin' ? <AdminPanel key="admin" /> : (
                  <div key="admin-restricted" className="flex h-full items-center justify-center text-white/40">
                    <div className="text-center">
                      <p className="text-lg font-medium">Access Restricted</p>
                      <p className="mt-1 text-sm text-white/30">Admin access required</p>
                    </div>
                  </div>
                )
              )}
              {activeTier === 'INTEL' && <IntelligenceDashboard key="intel" />}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <RydAITerminal tier={activeTier} />
      <RetainerWidget />

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        activeTier={activeTier}
        onTierChange={(tier) => handleTierChange(tier as Tier)}
        userRole={user?.role}
      />
      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
};

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);
