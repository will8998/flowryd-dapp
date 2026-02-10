"use client";

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FlowsDashboard } from '@/components/demo/FlowsDashboard';
import { DemoFlowBuilder } from '@/components/demo/DemoFlowBuilder';
import { ActivationScreen } from '@/components/demo/ActivationScreen';

export type DemoView = 'DASHBOARD' | 'CANVAS' | 'READY';

export default function DemoPage() {
  const [view, setView] = useState<DemoView>('DASHBOARD');
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);

  const handleOpenFlow = (id: string) => {
    setSelectedFlowId(id);
    setView('CANVAS');
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#020202]">
      <AnimatePresence mode="wait">
        {view === 'DASHBOARD' && (
          <FlowsDashboard 
            key="dashboard" 
            onOpenFlow={handleOpenFlow} 
          />
        )}
        {view === 'CANVAS' && (
          <DemoFlowBuilder 
            key="canvas" 
            flowId={selectedFlowId} 
            onBack={() => setView('DASHBOARD')}
            onReady={() => setView('READY')}
          />
        )}
        {view === 'READY' && (
          <ActivationScreen 
            key="ready" 
            onBack={() => setView('CANVAS')}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
