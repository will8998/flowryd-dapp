"use client";

import React from 'react';
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
  Handle,
  NodeChange,
  EdgeChange
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';
import { participants } from '@/lib/canton-data';
import { Building2, Zap, ShieldCheck, Database, Network, Shield, Wallet, Globe, Landmark, BarChart3, Plus, Layers, ArrowLeft } from 'lucide-react';

const getRoleIcon = (cantonRole: string) => {
  const role = cantonRole.toLowerCase();
  if (role.includes('custody') || role.includes('custod')) return <Shield className="w-4 h-4 text-white/70" />;
  if (role.includes('exchange')) return <BarChart3 className="w-4 h-4 text-white/70" />;
  if (role.includes('liquidity') || role.includes('market') || role.includes('prime')) return <Zap className="w-4 h-4 text-white/70" />;
  if (role.includes('registry') || role.includes('issuer')) return <Database className="w-4 h-4 text-white/70" />;
  if (role.includes('compliance') || role.includes('legal')) return <ShieldCheck className="w-4 h-4 text-white/70" />;
  if (role.includes('wallet')) return <Wallet className="w-4 h-4 text-white/70" />;
  if (role.includes('oracle') || role.includes('data') || role.includes('onchain')) return <Globe className="w-4 h-4 text-white/70" />;
  if (role.includes('bank') || role.includes('financ') || role.includes('repo') || role.includes('loan')) return <Landmark className="w-4 h-4 text-white/70" />;
  if (role.includes('infrastructure') || role.includes('infra') || role.includes('orchestr')) return <Network className="w-4 h-4 text-white/70" />;
  if (role.includes('identity')) return <ShieldCheck className="w-4 h-4 text-white/70" />;
  if (role.includes('stablecoin') || role.includes('stable')) return <Landmark className="w-4 h-4 text-white/70" />;
  if (role.includes('token') || role.includes('asset manager')) return <Layers className="w-4 h-4 text-white/70" />;
  if (role.includes('collateral')) return <Shield className="w-4 h-4 text-white/70" />;
  return <Building2 className="w-4 h-4 text-white/70" />;
};

const getCriticalityStyle = (criticality: string) => {
  switch (criticality) {
    case 'CRITICAL': return 'bg-amber-500 shadow-[0_0_6px_#f59e0b]';
    case 'REQUIRED': return 'bg-white/30';
    default: return 'bg-white/10';
  }
};

const LiquidEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
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
        className="react-flow__edge-path"
        d={edgePath}
        style={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 2 }}
      />
      <motion.path
        d={edgePath}
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1.5}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <circle r="2" fill="rgba(255,255,255,0.5)">
        <animateMotion dur="3s" repeatCount="indefinite" path={edgePath} />
      </circle>
    </>
  );
};

interface NodeData {
  participantId: string;
  isUserOrg?: boolean;
  orgName?: string;
  isRecommended?: boolean;
}

const InstitutionalNode = ({ data }: { data: NodeData }) => {
  const isUserOrg = data.isUserOrg;
  const p = isUserOrg ? null : participants.find(part => part.id === data.participantId);
  
  return (
    <div className="group relative">
      <div className={`absolute -inset-1 blur-lg opacity-0 group-hover:opacity-100 transition-opacity rounded-full pointer-events-none ${isUserOrg ? 'bg-white/10' : 'bg-white/10'}`} />
      <div className={`w-40 bg-black/30 rounded p-3 shadow-xl backdrop-blur-3xl transition-all ${
        isUserOrg
          ? 'border border-white/20 hover:border-white/30'
          : 'border border-white/10 hover:border-white/30'
      }`}>
        <Handle
          type="target"
          position={Position.Top}
          className={isUserOrg
            ? '!bg-white/60 !w-2 !h-2 !border-none'
            : '!bg-white/60 !w-2 !h-2 !border-none'
          }
        />
        
        {isUserOrg ? (
          <>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-white/70" />
              </div>
              <p className="text-[11px] font-bold font-sans text-white/90 truncate leading-tight">
                {data.orgName || 'Your Org'}
              </p>
            </div>
            <div className="pl-[42px]">
              <span className="text-[7px] font-bold text-white/70 bg-white/10 px-1.5 py-0.5 rounded-full tracking-wide">
                YOU
              </span>
            </div>
          </>
        ) : (
          <>
            {p && (
              <div className={`absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full ${getCriticalityStyle(p.criticality)}`} />
            )}

            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                {p ? getRoleIcon(p.cantonRole) : <Building2 className="w-4 h-4 text-white/20" />}
              </div>
              <p className="text-[11px] font-bold font-sans text-white/90 truncate leading-tight">{p?.name || 'Unassigned'}</p>
            </div>

            <p className="text-[8px] text-white/30 tracking-wide truncate pl-[42px]">{p?.cantonRole || 'Select Role'}</p>
          </>
        )}

        <Handle
          type="source"
          position={Position.Bottom}
          className={isUserOrg
            ? '!bg-white/60 !w-2 !h-2 !border-none'
            : '!bg-white/60 !w-2 !h-2 !border-none'
          }
        />
      </div>
    </div>
  );
};

const nodeTypes = { institutional: InstitutionalNode };
const edgeTypes = { liquid: LiquidEdge };

export const WorkbenchCanvas: React.FC<{ 
  nodes: Node[]; 
  edges: Edge[]; 
  onNodesChange: (changes: NodeChange[]) => void; 
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onDrop: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
}> = ({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onDrop, onDragOver }) => {

  return (
    <div className="w-full h-full bg-[#050505] relative overflow-hidden" onDrop={onDrop} onDragOver={onDragOver}>
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
        <Controls className="!bg-black/60 !border-white/10 !fill-white !rounded" />
      </ReactFlow>

      {nodes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
              <Plus className="w-6 h-6 text-white/20" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-white/40 font-sans">Drop participants here</p>
              <p className="text-[10px] text-white/20 font-mono">Drag from the sidebar to start building your flow</p>
            </div>
          </div>
        </motion.div>
      )}

      {nodes.length === 1 && nodes[0]?.id === 'user-org' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
        >
          <div className="flex items-center gap-2.5 bg-[#0a0a0a]/90 border border-white/10 rounded px-4 py-2.5 backdrop-blur-md shadow-2xl">
            <ArrowLeft className="w-3.5 h-3.5 text-white/60 shrink-0" />
            <p className="text-[11px] text-white/60 font-sans">
              <span className="text-white/80 font-bold">Drag partners</span> from the sidebar and connect them to your org
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
