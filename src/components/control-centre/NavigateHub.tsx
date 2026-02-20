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
  Settings,
  Undo,
  Redo,
} from 'lucide-react';
import { ParticipantTray } from './ParticipantTray';
import { WorkbenchCanvas } from './WorkbenchCanvas';
import { NodeConfigPanel } from './NodeConfigPanel';
import { FlowCreationModal } from './FlowCreationModal';
import { FlowSettingsPanel } from './FlowSettingsPanel';
import { PublishFlowModal } from './PublishFlowModal';
import { useFlows, useFlow } from '@/hooks/use-flows';
import type { Flow } from '@/hooks/use-flows';
import { useAutoSave } from '@/hooks/use-auto-save';
import { useUndoRedo } from '@/hooks/use-undo-redo';
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
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showNodeConfig, setShowNodeConfig] = useState(false);
  const [selectedNodeData, setSelectedNodeData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Flow[]>([]);
  const [, setTemplatesLoading] = useState(false);
  
  const { flows, isLoading: flowsLoading, refetch: refetchFlows } = useFlows();
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const { version, saveVersion, createFlow } = useFlow(activeFlowId);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [isCreatingDeal, setIsCreatingDeal] = useState(false);
  const initialOrgPlaced = useRef(false);
  
  const { undo, redo, canUndo, canRedo, pushState } = useUndoRedo();
  const { isSaving: autoSaving, lastSavedAt, isDirty } = useAutoSave({
    flowId: activeFlowId,
    nodes,
    edges,
    saveVersion,
  });
  
  const { screenToFlowPosition } = useReactFlow();
  const { user } = useCantonAuth();

  const activeFlow = flows.find(f => f.id === activeFlowId);

  const fetchTemplates = useCallback(async () => {
    try {
      setTemplatesLoading(true);
      const res = await fetch('/api/flows/templates');
      if (res.ok) {
        const json = await res.json();
        setTemplates(json.data ?? []);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setTemplatesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!activeFlowId && flows.length > 0) {
      fetchTemplates();
    }
  }, [activeFlowId, flows.length, fetchTemplates]);

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
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const newNodes = applyNodeChanges(changes, nds);
        pushState(newNodes, edges);
        return newNodes;
      });
    },
    [edges, pushState]
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const newEdges = applyEdgeChanges(changes, eds);
        pushState(nodes, newEdges);
        return newEdges;
      });
    },
    [nodes, pushState]
  );
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        const newEdges = addEdge({ ...params, type: 'liquid', animated: true }, eds);
        pushState(nodes, newEdges);
        return newEdges;
      });
    },
    [nodes, pushState]
  );

  const handleSave = useCallback(async () => {
    if (!activeFlowId || isSaving) return;
    setIsSaving(true);
    try {
      await saveVersion(nodes, edges);
    } catch (error) {
      console.error('Failed to save flow:', error);
      setError('Failed to save flow');
      setTimeout(() => setError(null), 4000);
    } finally {
      setIsSaving(false);
    }
  }, [activeFlowId, nodes, edges, saveVersion, isSaving]);

  const handleCreateFlow = useCallback(async (data: { title: string; description?: string; workflowType?: string }) => {
    try {
      const flow = await createFlow(data);
      if (flow) {
        setActiveFlowId(flow.id);
        refetchFlows();
        setShowFlowSelector(false);
        if (orgName) {
          setNodes([makeUserOrgNode(orgName)]);
          setEdges([]);
        }
      } else {
        throw new Error('Failed to create flow');
      }
    } catch (error) {
      console.error('Failed to create flow:', error);
      setError('Failed to create flow');
      setTimeout(() => setError(null), 4000);
    }
  }, [createFlow, refetchFlows, orgName, makeUserOrgNode]);

  const selectFlow = useCallback((flowId: string) => {
    setActiveFlowId(flowId);
    setShowFlowSelector(false);
  }, []);

  const handleUndo = useCallback(() => {
    const state = undo();
    if (state) {
      setNodes(state.nodes);
      setEdges(state.edges);
    }
  }, [undo]);

  const handleRedo = useCallback(() => {
    const state = redo();
    if (state) {
      setNodes(state.nodes);
      setEdges(state.edges);
    }
  }, [redo]);

  const handleUpdateFlow = useCallback(async (data: Partial<{ 
    title: string; 
    description: string; 
    isPublic: boolean; 
    isTemplate: boolean; 
    workflowType: string 
  }>) => {
    if (!activeFlowId) return;
    try {
      const response = await fetch(`/api/flows/${activeFlowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        refetchFlows();
      } else {
        throw new Error('Update request failed');
      }
    } catch (error) {
      console.error('Failed to update flow:', error);
      setError('Failed to update flow');
      setTimeout(() => setError(null), 4000);
    }
  }, [activeFlowId, refetchFlows]);

  const handlePublishFlow = useCallback(async (options: { isPublic: boolean }) => {
    if (!activeFlowId || isPublishing) return;
    setIsPublishing(true);
    try {
      const response = await fetch(`/api/flows/${activeFlowId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public: options.isPublic })
      });
      if (response.ok) {
        setPublishSuccess(true);
        setTimeout(() => setPublishSuccess(false), 2000);
      } else {
        throw new Error('Publish request failed');
      }
    } catch (error) {
      console.error('Failed to publish flow:', error);
      setError('Failed to publish flow');
      setTimeout(() => setError(null), 4000);
    } finally {
      setIsPublishing(false);
    }
  }, [activeFlowId, isPublishing]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave, handleUndo, handleRedo]);

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

  const onNodeClick = useCallback((nodeId: string, _nodeData: Record<string, unknown>) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNodeId(nodeId);
      setSelectedNodeData(node.data);
      setShowNodeConfig(true);
    }
  }, [nodes]);

  const handleCloseNodeConfig = useCallback(() => {
    setShowNodeConfig(false);
    setSelectedNodeId(null);
    setSelectedNodeData(null);
  }, []);

  const handleUpdateNode = useCallback((nodeId: string, data: Record<string, unknown>) => {
    setNodes((nds) => nds.map(node => 
      node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
    ));
  }, []);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter(node => node.id !== nodeId));
    setEdges((eds) => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
  }, []);

  const handleSelectTemplate = useCallback(async (templateId: string) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) return;

      const flow = await createFlow({
        title: `${template.title} Copy`,
        description: template.description || undefined,
        workflowType: template.workflowType || undefined,
      });
      if (flow) {
        setActiveFlowId(flow.id);
        refetchFlows();
      }
    } catch (error) {
      console.error('Failed to create flow from template:', error);
      setError('Failed to create flow from template');
      setTimeout(() => setError(null), 4000);
    }
  }, [templates, createFlow, refetchFlows]);

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
            {flowsLoading && !activeFlow ? (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-white/30 animate-pulse" />
                <span className="text-xs font-mono text-white/50">Loading...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xs font-mono text-white/80 truncate">
                  {activeFlow?.title || 'Select a flow...'}
                </span>
                {activeFlow && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    activeFlow.status === 'published' 
                      ? 'text-white/30' 
                      : 'text-white/20'
                  }`}>
                    {activeFlow.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                )}
              </div>
            )}
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
                  {flowsLoading ? (
                    <div className="space-y-1">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="px-3 py-2 rounded-lg bg-white/5 animate-pulse">
                          <div className="h-3 bg-white/10 rounded w-full" />
                        </div>
                      ))}
                    </div>
                  ) : flows.length === 0 ? (
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
                        <div className="flex items-center justify-between">
                          <span className="truncate">{f.title}</span>
                          <span className={`text-[8px] font-mono ml-2 ${
                            f.status === 'published' 
                              ? 'text-white/30' 
                              : 'text-white/20'
                          }`}>
                            {f.status === 'published' ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <div className="border-t border-white/5 p-2">
                  <button
                    onClick={() => setShowCreationModal(true)}
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
          onClick={() => setShowCreationModal(true)}
          className="px-3 py-1.5 border border-white/20 text-white rounded-lg text-[10px] font-bold hover:border-white/40 transition-colors flex items-center gap-1.5 tracking-wide"
        >
          <Plus className="w-3 h-3" /> New
        </button>

        <div className="h-4 w-px bg-white/5" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="px-2 py-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-white/40"
            title="Undo (⌘Z)"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className="px-2 py-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-white/40"
            title="Redo (⇧⌘Z)"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Auto-save indicator */}
        {activeFlowId && (
          <div className="flex items-center gap-1.5 text-[9px] font-mono">
            {autoSaving ? (
              <span className="text-white/30 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" />
                Saving...
              </span>
            ) : isDirty ? (
              <span className="text-white/25 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
                Unsaved
              </span>
            ) : lastSavedAt ? (
              <span className="text-white/20">Saved</span>
            ) : null}
          </div>
        )}

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
              onClick={() => setShowSettingsPanel(true)}
              className="px-2 py-1.5 bg-white/5 text-white/50 rounded-lg hover:bg-white/10 hover:text-white/70 transition-colors"
              title="Flow Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}

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
              onClick={() => setShowPublishModal(true)}
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
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-2 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-mono"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {!activeFlowId && flows.length === 0 && !flowsLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <div className="text-center space-y-3">
                <Layers className="w-10 h-10 text-white/10 mx-auto" />
                <h3 className="text-sm font-bold text-white/40">No flows yet</h3>
                <p className="text-[11px] text-white/20 max-w-xs">Create your first flow to start building multi-party workflows on Canton Network.</p>
                <button 
                  onClick={() => setShowCreationModal(true)} 
                  className="px-4 py-2 bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white/60 hover:bg-white/15 hover:text-white/80 transition-colors flex items-center gap-1.5 mx-auto"
                >
                  <Plus className="w-3.5 h-3.5" /> Create First Flow
                </button>
              </div>
            </div>
          ) : !activeFlowId && flows.length > 0 && templates.length > 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-8">
              <div className="text-center mb-6">
                <h3 className="text-sm font-bold text-white/40 mb-1">Start with a template</h3>
                <p className="text-[11px] text-white/20">Choose a template to quickly start building</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
                {templates.slice(0, 4).map((template) => (
                  <motion.button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 hover:bg-white/10 transition-colors text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Layers className="w-4 h-4 text-white/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white/80 mb-1 truncate">{template.title}</h4>
                        {template.description && (
                          <p className="text-[10px] text-white/40 line-clamp-2">{template.description}</p>
                        )}
                        <span className="text-[8px] text-white/30 font-mono mt-1 inline-block">Template</span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
              <button 
                onClick={() => setShowCreationModal(true)} 
                className="mt-4 px-4 py-2 border border-white/20 rounded-lg text-xs font-bold text-white/60 hover:border-white/40 hover:text-white/80 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Start from Scratch
              </button>
            </div>
          ) : (
            <WorkbenchCanvas 
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              selectedNodeId={selectedNodeId}
            />
          )}
          <NodeConfigPanel
            isOpen={showNodeConfig}
            onClose={handleCloseNodeConfig}
            node={selectedNodeId && selectedNodeData ? { 
              id: selectedNodeId, 
              data: selectedNodeData as { participantId: string; isUserOrg?: boolean; orgName?: string }
            } : null}
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleDeleteNode}
          />
        </div>
      </div>

      {/* Click-away for flow selector */}
      {showFlowSelector && (
        <div className="fixed inset-0 z-10" onClick={() => setShowFlowSelector(false)} />
      )}

      <FlowCreationModal
        isOpen={showCreationModal}
        onClose={() => setShowCreationModal(false)}
        onCreate={handleCreateFlow}
      />

      <FlowSettingsPanel
        isOpen={showSettingsPanel}
        onClose={() => setShowSettingsPanel(false)}
        flow={activeFlow ? {
          id: activeFlow.id,
          title: activeFlow.title,
          description: activeFlow.description ?? null,
          status: activeFlow.status ?? null,
          isPublic: activeFlow.isPublic ?? null,
          isTemplate: activeFlow.isTemplate ?? null,
          workflowType: activeFlow.workflowType ?? null,
        } : null}
        onUpdate={handleUpdateFlow}
      />

      <PublishFlowModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onPublish={handlePublishFlow}
        flowTitle={activeFlow?.title || ''}
        nodeCount={nodes.length}
        edgeCount={edges.length}
      />
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
