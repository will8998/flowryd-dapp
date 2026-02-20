"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
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
  Play,
  Save,
  ChevronDown,
  Layers,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import { ParticipantTray } from './ParticipantTray';
import { WorkbenchCanvas } from './WorkbenchCanvas';
import { useFlows, useFlow } from '@/hooks/use-flows';
import { useCantonAuth } from '@/lib/auth-context';

interface JumpCutData {
  id: string;
  name: string;
  nodes: Array<{ role: string; participantId: string; position: { x: number; y: number } }>;
}

interface NavigateHubProps {
  initialJumpCut?: JumpCutData | null;
  onJumpCutConsumed?: () => void;
}

const NavigateHubContent: React.FC<NavigateHubProps> = ({ initialJumpCut, onJumpCutConsumed }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showFlowSelector, setShowFlowSelector] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  
  const { flows, refetch: refetchFlows } = useFlows();
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const { version, saveVersion, createFlow } = useFlow(activeFlowId);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [isCreatingDeal, setIsCreatingDeal] = useState(false);
  const initialOrgPlaced = useRef(false);
  
  const { screenToFlowPosition } = useReactFlow();
  const { user } = useCantonAuth();

  const activeFlow = flows.find(f => f.id === activeFlowId);

  const orgName = useMemo(() => {
    if (!user?.partyId) return null;
    const prefix = user.partyId.split('::')[0];
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }, [user?.partyId]);

  const makeUserOrgNode = useCallback((name: string): Node => ({
    id: 'user-org',
    type: 'institutional',
    position: { x: 300, y: 250 },
    data: { participantId: 'user_org', isUserOrg: true, orgName: name },
  }), []);

  useEffect(() => {
    if (version) {
      const versionNodes = version.nodes as Node[];
      const versionEdges = version.edges as Edge[];
      if (versionNodes.length === 0 && orgName) {
        setNodes([makeUserOrgNode(orgName)]);
      } else {
        setNodes(versionNodes);
      }
      setEdges(versionEdges);
    }
  }, [version, orgName, makeUserOrgNode]);

  useEffect(() => {
    if (initialOrgPlaced.current || activeFlowId || !orgName) return;
    initialOrgPlaced.current = true;
    setNodes([makeUserOrgNode(orgName)]);
  }, [activeFlowId, orgName, makeUserOrgNode]);

  useEffect(() => {
    if (!initialJumpCut || !orgName) return;
    const userNode = makeUserOrgNode(orgName);
    const jumpCutNodes: Node[] = initialJumpCut.nodes.map((n, i) => ({
      id: `jc-${Date.now()}-${i}`,
      type: 'institutional',
      position: { x: 300 + n.position.x, y: 250 + n.position.y },
      data: { participantId: n.participantId },
    }));
    setNodes([userNode, ...jumpCutNodes]);
    setEdges([]);
    onJumpCutConsumed?.();
  }, [initialJumpCut, orgName, makeUserOrgNode, onJumpCutConsumed]);

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

  const handleSave = useCallback(async () => {
    if (!activeFlowId || isSaving) return;
    setIsSaving(true);
    try {
      await saveVersion(nodes, edges);
    } finally {
      setIsSaving(false);
    }
  }, [activeFlowId, nodes, edges, saveVersion, isSaving]);

  const handlePublish = useCallback(async () => {
    if (!activeFlowId || isPublishing) return;
    setIsPublishing(true);
    try {
      const response = await fetch(`/api/flows/${activeFlowId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public: true })
      });
      if (response.ok) {
        setPublishSuccess(true);
        setTimeout(() => setPublishSuccess(false), 2000);
      }
    } catch (error) {
      console.error('Failed to publish flow:', error);
    } finally {
      setIsPublishing(false);
    }
  }, [activeFlowId, isPublishing]);

  const handleNewFlow = useCallback(async () => {
    const flow = await createFlow({ title: `Flow ${new Date().toLocaleDateString()}` });
    if (flow) {
      setActiveFlowId(flow.id);
      refetchFlows();
      setShowFlowSelector(false);
      if (orgName) {
        setNodes([makeUserOrgNode(orgName)]);
        setEdges([]);
      }
    }
  }, [createFlow, refetchFlows, orgName, makeUserOrgNode]);

  const selectFlow = useCallback((flowId: string) => {
    setActiveFlowId(flowId);
    setShowFlowSelector(false);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

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
    <div className="h-full flex flex-col bg-background relative overflow-hidden">
      {/* Unified Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 bg-black/40 backdrop-blur-md z-20 shrink-0">
        {/* Flow Selector */}
        <div className="relative">
          <button
            onClick={() => setShowFlowSelector(!showFlowSelector)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-colors min-w-[160px]"
          >
            <Layers className="w-3.5 h-3.5 text-white/70 shrink-0" />
            <span className="text-xs font-mono text-white/80 truncate">
              {activeFlow?.title || 'Select a flow...'}
            </span>
            <ChevronDown className="w-3 h-3 text-white/30 shrink-0 ml-auto" />
          </button>

          <AnimatePresence>
            {showFlowSelector && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 mt-1 w-64 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-2 max-h-48 overflow-y-auto">
                  {flows.length === 0 ? (
                    <p className="text-[10px] text-white/30 font-mono text-center py-3">No flows yet</p>
                  ) : (
                    flows.map(f => (
                      <button
                        key={f.id}
                        onClick={() => selectFlow(f.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors ${
                          f.id === activeFlowId ? 'bg-white/10 text-white/60' : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {f.title}
                      </button>
                    ))
                  )}
                </div>
                <div className="border-t border-white/5 p-2">
                  <button
                    onClick={handleNewFlow}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-white/60 hover:bg-white/10 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> New Flow
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={handleNewFlow}
          className="px-3 py-1.5 border border-white/20 text-white rounded-lg text-[10px] font-bold hover:border-white/40 transition-colors flex items-center gap-1.5 tracking-wide"
        >
          <Plus className="w-3 h-3" /> New
        </button>

        <div className="h-4 w-px bg-white/5" />

        {/* Status Indicators */}
        {nodes.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono text-white/30">
              {nodes.length} node{nodes.length !== 1 ? 's' : ''} · {edges.length} edge{edges.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 border border-white/10 rounded-md">
              <ShieldCheck className="w-3 h-3 text-white/70" />
              <span className="text-[9px] font-bold text-white/70 font-mono">99.9%</span>
            </div>
          </div>
        )}

        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-2">
          {activeFlowId && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1.5 bg-white/10 text-white rounded-lg text-[10px] font-bold hover:bg-white/20 transition-colors disabled:opacity-50 flex items-center gap-1.5 tracking-wide"
            >
              <Save className="w-3 h-3" />
              {isSaving ? 'Saving...' : 'Save'}
              <span className="text-white/30 font-normal">⌘S</span>
            </button>
          )}

          {activeFlowId && nodes.length >= 2 && (
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-3 py-1.5 border border-white/30 text-white rounded-lg text-[10px] font-bold hover:border-white/50 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Globe className="w-3 h-3" />
              {publishSuccess ? 'Published!' : isPublishing ? 'Publishing...' : 'Publish'}
            </button>
          )}

          {nodes.length > 1 && (
            <button
              onClick={async () => {
                if (isCreatingDeal) return;
                setIsCreatingDeal(true);
                try {
                  const title = activeFlow?.title || `Deal ${new Date().toLocaleDateString()}`;
                  const res = await fetch('/api/deals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, flowId: activeFlowId }),
                  });
                  if (res.ok) {
                    const { data } = await res.json();
                    window.location.href = `/deals/${data.id}`;
                  }
                } catch (error) {
                  console.error('Failed to create deal:', error);
                } finally {
                  setIsCreatingDeal(false);
                }
              }}
              disabled={isCreatingDeal}
              className="px-3 py-1.5 border border-white/30 text-white rounded-lg text-[10px] font-bold hover:border-white/50 transition-colors flex items-center gap-1.5 tracking-wide disabled:opacity-50"
            >
              <Play className="w-3 h-3 fill-white" /> {isCreatingDeal ? 'Creating...' : 'Deal Room'}
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Sidebar + Canvas */}
      <div className="flex-1 flex min-h-0">
        <ParticipantTray
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          selectedWorkflow={selectedWorkflow}
          onSelectWorkflow={setSelectedWorkflow}
        />

        <div className="flex-1 relative min-h-0">
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
      </div>

      {/* Click-away for flow selector */}
      {showFlowSelector && (
        <div className="fixed inset-0 z-10" onClick={() => setShowFlowSelector(false)} />
      )}
    </div>
  );
};

export const NavigateHub: React.FC<NavigateHubProps> = (props) => {
  return (
    <ReactFlowProvider>
      <NavigateHubContent {...props} />
    </ReactFlowProvider>
  );
};
