"use client";

import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
  Play, 
  ArrowLeft
} from 'lucide-react';
import { ParticipantTray } from '@/components/control-centre/ParticipantTray';
import { WorkbenchCanvas } from '@/components/control-centre/WorkbenchCanvas';
import { mockPrivateFlows } from '@/lib/demo-data';

interface DemoFlowBuilderProps {
  flowId: string | null;
  onBack: () => void;
  onReady: () => void;
}

const DemoFlowBuilderContent: React.FC<DemoFlowBuilderProps> = ({ flowId, onBack, onReady }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [, setIsFlowReady] = useState(false);
  
  const { screenToFlowPosition } = useReactFlow();

  const flow = useMemo(() => mockPrivateFlows.find(f => f.id === flowId), [flowId]);

  // Pre-populate Nodes based on selected flow
  useEffect(() => {
    if (!flow) return;

    // Use the same layout logic as PrivateCanvas but mapped to ReactFlow nodes
    const initialNodes: Node[] = flow.roles.map((role, i) => {
      let position = { x: 0, y: 0 };
      
      // Simple static layout mapping
      if (i === 0) position = { x: 400, y: 50 }; // Top Center
      else if (i === 1) position = { x: 100, y: 250 }; // Mid Left
      else if (i === 2) position = { x: 400, y: 250 }; // Mid Center
      else if (i === 3) position = { x: 700, y: 250 }; // Mid Right
      else if (i === 4) position = { x: 100, y: 450 }; // Bot Left
      else if (i === 5) position = { x: 400, y: 450 }; // Bot Center
      else if (i === 6) position = { x: 700, y: 450 }; // Bot Right
      else position = { x: 100 + (i * 50), y: 600 };

      return {
        id: role.id,
        type: 'institutional',
        position,
        data: { 
          participantId: role.filledBy || `gap-${role.id}`, 
          // We can enhance InstitutionalNode to handle "Gap" state if we want, 
          // but for now reusing it with a mock ID or real one if filled.
          // Since NavigateHub uses 'institutional' type which expects 'participantId' to lookup 'participants' list.
          // We might need to ensure 'gap-...' isn't breaking it, or map 'filledBy' to valid IDs.
          // For the demo data: 'Treasury Co.', 'Texture' are names, not IDs. 
          // The 'participants' data in 'src/lib/canton-data.ts' uses IDs like 'participant-1'.
          // Let's assume for this mock we map to some default IDs if not found, or maybe just use 'participant-1' as placeholder
          // But to make it look good, we should try to match.
          // Actually, let's just let the node render 'Unassigned' if ID doesn't match, which InstitutionalNode does.
        },
      };
    });

    setNodes(initialNodes);

    // Create some initial connections
    const initialEdges: Edge[] = [
      { id: 'e1-2', source: flow.roles[0].id, target: flow.roles[1].id, type: 'liquid', animated: true },
      { id: 'e1-3', source: flow.roles[0].id, target: flow.roles[2].id, type: 'liquid', animated: true },
      { id: 'e2-5', source: flow.roles[1].id, target: flow.roles[4].id, type: 'liquid', animated: true },
    ];
    setEdges(initialEdges);

  }, [flow]);

  // Check readiness (Mock logic: if nodes count > 5, it's ready)
  useEffect(() => {
     setIsFlowReady(nodes.length >= 7);
  }, [nodes]);


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

  return (
    <div className="h-full flex flex-col bg-[#020202] relative overflow-hidden">
      {/* Top Bar for Demo Navigation */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-6 pointer-events-auto">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors backdrop-blur-md bg-black/20 border border-white/10">
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white shadow-black drop-shadow-lg">{flow?.name}</h1>
            <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Builder Mode • {nodes.length} Participants</p>
          </div>
        </div>
        
        <div className="pointer-events-auto">
             <button 
                onClick={onReady}
                // disabled={!isFlowReady} // Allow click for demo even if logic is loose
                className={`px-6 py-3 rounded-xl font-bold font-sans uppercase tracking-wider flex items-center gap-3 transition-all shadow-xl ${
                    true // Always enabled for smooth demo 
                    ? 'bg-white text-black hover:scale-105' 
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                Activate Flow <Play className="w-4 h-4 fill-current" />
              </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key="builder"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex-1 flex flex-col min-h-0 relative"
        >
          <ParticipantTray />

          <div className="flex-1 relative min-h-0 flex flex-col">
            <div className="p-6 absolute top-20 left-0 z-10 pointer-events-none">
                <h2 className="text-xl font-bold font-sans uppercase tracking-tighter text-blue-500">Flow Workbench</h2>
                <p className="text-white/40 text-[9px] font-bold tracking-widest uppercase">Stage 2: Institutional Coordination</p>
            </div>

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

export const DemoFlowBuilder: React.FC<DemoFlowBuilderProps> = (props) => {
  return (
    <ReactFlowProvider>
      <DemoFlowBuilderContent {...props} />
    </ReactFlowProvider>
  );
};
