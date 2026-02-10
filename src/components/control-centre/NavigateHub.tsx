"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  Connection,
  ReactFlowProvider,
  useReactFlow,
  NodeChange,
  EdgeChange
} from '@xyflow/react';
import { 
  Plus, 
  ArrowRight, 
  ChevronRight, 
  Sparkles, 
  Send, 
  MessageSquare, 
  Zap, 
  Play,
  Lock,
  Workflow
} from 'lucide-react';
import { ParticipantTray } from './ParticipantTray';
import { WorkbenchCanvas } from './WorkbenchCanvas';
import { LiquidGlass } from './LiquidPrimitives';

const NavigateHubContent: React.FC = () => {
  const [activeView, setActiveView] = useState<'WORKBENCH'>('WORKBENCH');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  
  const { screenToFlowPosition } = useReactFlow();

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'liquid', animated: true }, eds)),
    []
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const participantId = event.dataTransfer.getData('application/reactflow');
      if (!participantId) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const snappedPos = {
        x: Math.round(position.x / 20) * 20,
        y: Math.round(position.y / 20) * 20,
      };

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: 'institutional',
        position: snappedPos,
        data: { participantId },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition]
  );

  const APP_STACKS = [
    { name: 'Tokenized Asset Stack', apps: 4 },
    { name: 'Verified Repo Stack', apps: 3 },
  ];

  return (
    <div className="h-full flex flex-col bg-[#020202] relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div 
          key="workbench"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="flex-1 flex flex-col min-h-0"
        >
          <ParticipantTray />

            <div className="flex-1 relative min-h-0 flex flex-col">
              <div className="p-6 absolute top-0 left-0 z-10 pointer-events-none">
                 <h2 className="text-xl font-bold uppercase tracking-tighter text-blue-500">Flow Workbench</h2>
                 <p className="text-white/40 text-[9px] font-bold tracking-widest uppercase">Stage 2: Institutional Coordination</p>
              </div>

              <div className="absolute top-20 left-6 z-10 space-y-2">
                 <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">Ready Stacks</p>
                 {APP_STACKS.map(s => (
                   <button key={s.name} className="block w-40 p-3 bg-white/5 border border-white/10 rounded-xl text-left hover:border-blue-500 transition-all group backdrop-blur-sm">
                      <p className="text-[9px] font-bold text-white/80 group-hover:text-blue-400">{s.name}</p>
                      <p className="text-[7px] text-white/30 uppercase mt-0.5">{s.apps} Apps</p>
                   </button>
                 ))}
              </div>

            {nodes.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
                  <button 
                    className="px-10 py-4 bg-white text-black rounded-2xl font-bold text-lg shadow-2xl hover:scale-105 transition-all flex items-center gap-3 opacity-50 cursor-not-allowed"
                  >
                    Initialize Deal Room <Play className="w-5 h-5 fill-black" />
                  </button>
              </div>
            )}

            <WorkbenchCanvas 
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export const NavigateHub: React.FC = () => {
  return (
    <ReactFlowProvider>
      <NavigateHubContent />
    </ReactFlowProvider>
  );
};
