"use client";

import React, { useCallback } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  Node,
  Edge,
  Connection,
  EdgeProps,
  getBezierPath,
  Position,
  Handle
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';
import { participants } from '@/lib/canton-data';
import { Building2, Zap, ShieldCheck } from 'lucide-react';

const LiquidEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path !stroke-blue-500/20 !stroke-[3px]"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <motion.path
        d={edgePath}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={2}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <circle r="3" fill="#fff">
        <animateMotion dur="3s" repeatCount="indefinite" path={edgePath} />
      </circle>
    </>
  );
};

const InstitutionalNode = ({ data }: { data: any }) => {
  const p = participants.find(part => part.id === data.participantId);
  
  return (
    <div className="group relative">
      <div className="absolute -inset-2 bg-blue-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full pointer-events-none" />
      <div className="w-52 bg-[#0a0a0a] border border-white/10 rounded-[24px] p-4 shadow-2xl backdrop-blur-3xl group-hover:border-blue-500/50 transition-all">
        <Handle type="target" position={Position.Top} className="!bg-blue-500 !w-2.5 !h-2.5 !border-none shadow-[0_0_8px_#3b82f6]" />
        
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            {p ? <Building2 className="w-5 h-5 text-blue-500" /> : <Zap className="w-5 h-5 text-white/20" />}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold font-sans uppercase text-white/90 truncate">{p?.name || 'Unassigned'}</p>
            <p className="text-[8px] text-white/30 uppercase font-bold tracking-widest truncate">{p?.cantonRole || 'Select Role'}</p>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-white/5 font-mono">
          <span className="text-[8px] font-bold text-blue-400/60 uppercase">VP_Active</span>
          <span className="text-[8px] text-white/10 uppercase italic">Syncing...</span>
        </div>

        <Handle type="source" position={Position.Bottom} className="!bg-blue-500 !w-2.5 !h-2.5 !border-none shadow-[0_0_8px_#3b82f6]" />
      </div>
    </div>
  );
};

const nodeTypes = { institutional: InstitutionalNode };
const edgeTypes = { liquid: LiquidEdge };

export const WorkbenchCanvas: React.FC<{ 
  nodes: Node[]; 
  edges: Edge[]; 
  onNodesChange: (changes: any) => void; 
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  onDrop: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
}> = ({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onDrop, onDragOver }) => {

  return (
    <div className="w-full h-full bg-[#050505] relative overflow-hidden no-scrollbar" onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        snapToGrid={true}
        snapGrid={[20, 20]}
        defaultEdgeOptions={{ type: 'liquid', animated: true }}
        className="!bg-transparent"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1a1a1a" gap={20} size={1} />
        <Controls className="!bg-black/40 !border-white/10 !fill-white" />
      </ReactFlow>
      
      <div className="absolute top-8 right-8 z-10 flex gap-4">
         <div className="px-6 py-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl">
            <p className="text-[9px] font-bold font-sans uppercase text-white/40 tracking-widest mb-1">Flow Integrity</p>
            <p className="text-xl font-bold font-sans text-emerald-500 uppercase tracking-tighter">Verified 99.9%</p>
         </div>
      </div>
    </div>
  );
};
