"use client";

import React from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  MiniMap,
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

const getRoleColor = (cantonRole: string): string => {
  const r = cantonRole.toLowerCase();
  if (r.includes('registry')) return 'blue';
  if (r.includes('custody') || r.includes('custod')) return 'orange';
  if (r.includes('liquidity') || r.includes('financing') || r.includes('repo')) return 'green';
  if (r.includes('exchange')) return 'purple';
  if (r.includes('compliance') || r.includes('legal')) return 'amber';
  if (r.includes('oracle') || r.includes('data') || r.includes('onchain')) return 'cyan';
  if (r.includes('infrastructure') || r.includes('orchestr')) return 'indigo';
  return 'gray';
};

const roleColorClasses: Record<string, { border: string; glow: string; accent: string }> = {
  blue: { border: 'border-l-blue-500/60', glow: 'group-hover:shadow-blue-500/10', accent: 'bg-blue-500/10' },
  orange: { border: 'border-l-orange-500/60', glow: 'group-hover:shadow-orange-500/10', accent: 'bg-orange-500/10' },
  green: { border: 'border-l-green-500/60', glow: 'group-hover:shadow-green-500/10', accent: 'bg-green-500/10' },
  purple: { border: 'border-l-purple-500/60', glow: 'group-hover:shadow-purple-500/10', accent: 'bg-purple-500/10' },
  amber: { border: 'border-l-amber-500/60', glow: 'group-hover:shadow-amber-500/10', accent: 'bg-amber-500/10' },
  cyan: { border: 'border-l-cyan-500/60', glow: 'group-hover:shadow-cyan-500/10', accent: 'bg-cyan-500/10' },
  indigo: { border: 'border-l-indigo-500/60', glow: 'group-hover:shadow-indigo-500/10', accent: 'bg-indigo-500/10' },
  gray: { border: 'border-l-white/20', glow: 'group-hover:shadow-white/5', accent: 'bg-white/5' },
};

const LiquidEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition }: EdgeProps) => {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  
  return (
    <>
      <defs>
        <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="50%" stopColor="white" stopOpacity="0.15" />
          <stop offset="100%" stopColor="white" stopOpacity="0.03" />
        </linearGradient>
        <marker id={`arrow-${id}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="white" fillOpacity="0.15" />
        </marker>
      </defs>
      <path id={id} className="react-flow__edge-path" d={edgePath}
        style={{ stroke: `url(#grad-${id})`, strokeWidth: 1.5 }}
        markerEnd={`url(#arrow-${id})`}
      />
      <motion.path d={edgePath} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <circle r="2" fill="rgba(255,255,255,0.4)">
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
  selected?: boolean;
}

const InstitutionalNode = ({ data }: { data: NodeData }) => {
  const isUserOrg = data.isUserOrg;
  const isSelected = data.selected;
  const p = isUserOrg ? null : participants.find(part => part.id === data.participantId);
  const roleColor = p ? getRoleColor(p.cantonRole) : 'gray';
  const colorStyles = roleColorClasses[roleColor];
  
  return (
    <div className="group relative">
      <div className={`absolute -inset-1 blur-lg opacity-0 group-hover:opacity-100 transition-opacity rounded-full pointer-events-none ${isUserOrg ? 'bg-white/10' : 'bg-white/10'}`} />
      <div className={`w-48 bg-black/30 rounded p-3 shadow-xl backdrop-blur-3xl transition-all hover:scale-[1.02] group-hover:shadow-lg ${
        isUserOrg ? '' : `border-l-2 ${colorStyles.border} ${colorStyles.glow}`
      } ${
        isSelected 
          ? 'border border-white/40 ring-1 ring-white/40'
          : isUserOrg
            ? 'border border-white/20 hover:border-white/30'
            : 'border border-white/10 hover:border-white/30'
      }`}>
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-white/60 !w-2 !h-2 !border-none"
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
            
            {p && (
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5">
                <div>
                  <p className="text-[9px] text-white/40">Assets</p>
                  <p className="text-[10px] font-mono font-medium text-white/90">{p.holdings || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[9px] text-white/40">Validator</p>
                  <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${p.validatorNodes && p.validatorNodes > 0 ? 'bg-green-500' : 'bg-gray-600'}`} />
                    <p className="text-[10px] font-mono font-medium text-white/90">{p.validatorNodes && p.validatorNodes > 0 ? 'Active' : 'None'}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-white/60 !w-2 !h-2 !border-none"
        />
      </div>
    </div>
  );
};

const nodeTypes = { institutional: InstitutionalNode };
const edgeTypes = { liquid: LiquidEdge };

interface WorkbenchCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onDrop: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onNodeClick?: (nodeId: string, nodeData: Record<string, unknown>) => void;
  selectedNodeId?: string | null;
  selectedWorkflowId?: string | null;
}

export const WorkbenchCanvas: React.FC<WorkbenchCanvasProps> = ({ 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange, 
  onConnect, 
  onDrop, 
  onDragOver, 
  onNodeClick,
  selectedNodeId,
  selectedWorkflowId = null
}) => {
  const nodesWithSelection = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      selected: selectedNodeId === node.id
    }
  }));

  return (
    <div className="w-full h-full bg-[#050505] relative overflow-hidden" onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodesWithSelection}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => onNodeClick?.(node.id, node.data)}
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
        <MiniMap
          nodeColor={() => 'rgba(255,255,255,0.15)'}
          maskColor="rgba(0,0,0,0.8)"
          className="!bg-black/40 !border-white/10 !rounded"
          style={{ width: 160, height: 100 }}
          pannable
          zoomable
        />
      </ReactFlow>

      {nodes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded bg-gradient-to-br from-white/10 to-white/5 border border-dashed border-white/10 flex items-center justify-center">
              <Plus className="w-6 h-6 text-white/30" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-white/40 font-sans">Drop participants here</p>
              <p className="text-[10px] text-white/20 font-mono">Drag from the sidebar to start building your flow</p>
            </div>
          </div>
        </motion.div>
      )}

      {nodes.length === 1 && nodes[0]?.id === 'user-org' && !selectedWorkflowId && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
        >
          <div className="flex items-center gap-2.5 bg-[#0a0a0a]/90 border border-white/10 rounded px-4 py-2.5 backdrop-blur-md shadow-2xl">
            <motion.div
              animate={{ x: [-2, 0, -2] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-white/60 shrink-0" />
            </motion.div>
            <p className="text-[11px] text-white/60 font-sans">
              Choose a workflow template from the sidebar, then drag partners onto the canvas
            </p>
          </div>
        </motion.div>
      )}

      {nodes.length === 1 && nodes[0]?.id === 'user-org' && selectedWorkflowId && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
        >
          <div className="flex items-center gap-2.5 bg-[#0a0a0a]/90 border border-white/10 rounded px-4 py-2.5 backdrop-blur-md shadow-2xl">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-2 h-2 rounded-full bg-white/40" />
            </motion.div>
            <p className="text-[11px] text-white/60 font-sans">
              <span className="text-white/80 font-bold">Drag recommended partners</span> from the sidebar to build your flow
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
