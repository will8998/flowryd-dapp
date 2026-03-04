"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Workflow, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  ChevronDown, 
  ChevronRight, 
  X, 
  Users, 
  Layers,
  Loader2,
  AlertCircle,
  Hammer
} from 'lucide-react';
import { authFetch } from '@/lib/auth-fetch';
import { useCantonAuth } from '@/lib/auth-context';

// Types for API response
interface CantonTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  participantColumn: string | null;
}

interface CantonFlowStep {
  id: string;
  flowId: string;
  step: number;
  templateId: string;
  templateName: string;
  action: string | null;
  inputs: string | null;
  outputs: string | null;
  triggersNext: string | null;
  cantonPrivacy: string | null;
  notes: string | null;
}

interface CantonFlow {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  source: string | null;
  status: 'proven' | 'design' | 'active' | 'planned';
  stepCount: number;
  sortOrder: number;
}

// Internal editable types
interface EditableStage {
  id: string;
  templateId: string;
  templateName: string;
  action: string;
  inputs: string;
  outputs: string;
  triggersNext: string;
  cantonPrivacy: string;
  notes: string;
}

interface EditableFlow {
  id: string;
  name: string;
  description: string;
  category: string;
  source: string;
  status: string;
  stages: EditableStage[];
  isNew?: boolean;
}

export interface JumpCutsManagerProps {
  onSelectJumpCut?: (jumpCut: { id: string; name: string; nodes: Array<{ role: string; participantId: string; position: { x: number; y: number } }> }) => void;
}

export const JumpCutsManager: React.FC<JumpCutsManagerProps> = ({ onSelectJumpCut }) => {
  const [flows, setFlows] = useState<EditableFlow[]>([]);
  const [templates, setTemplates] = useState<CantonTemplate[]>([]);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<Set<string>>(new Set());
  
  const { user } = useCantonAuth();
  const isAdmin = user?.role === 'admin';

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch flows and templates in parallel
      const [flowsRes, templatesRes] = await Promise.all([
        authFetch('/api/canton-flows'),
        authFetch('/api/canton-templates'),
      ]);
      
      if (!flowsRes.ok || !templatesRes.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const [flowsData, templatesData] = await Promise.all([
        flowsRes.json(),
        templatesRes.json(),
      ]);
      
      setTemplates(templatesData.templates || []);
      
      // Fetch steps for each flow in parallel
      const flowsList: CantonFlow[] = flowsData.flows || [];
      const flowsWithSteps = await Promise.all(
        flowsList.map(async (flow) => {
          try {
            const stepsRes = await authFetch(`/api/canton-flows/${flow.id}/steps`);
            if (stepsRes.ok) {
              const stepsData = await stepsRes.json();
              const steps: CantonFlowStep[] = stepsData.steps || [];
              return transformToEditable(flow, steps);
            }
          } catch {
            // If steps fetch fails, return flow without steps
          }
          return transformToEditable(flow, []);
        })
      );
      
      setFlows(flowsWithSteps);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, []);

  const transformToEditable = (flow: CantonFlow, steps: CantonFlowStep[]): EditableFlow => ({
    id: flow.id,
    name: flow.name,
    description: flow.description || '',
    category: flow.category || '',
    source: flow.source || '',
    status: flow.status || 'planned',
    stages: steps.map((step) => ({
      id: step.id || `step_${step.step}`,
      templateId: step.templateId,
      templateName: step.templateName,
      action: step.action || '',
      inputs: step.inputs || '',
      outputs: step.outputs || '',
      triggersNext: step.triggersNext || '',
      cantonPrivacy: step.cantonPrivacy || '',
      notes: step.notes || '',
    })),
  });

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateNew = () => {
    if (!isAdmin) return;
    
    const newFlow: EditableFlow = {
      id: `NEW-${Date.now()}`,
      name: 'New Jump Cut',
      description: '',
      category: '',
      source: 'JumpCuts Manager',
      status: 'planned',
      stages: [],
      isNew: true,
    };
    
    setFlows(prev => [...prev, newFlow]);
    setEditingCard(newFlow.id);
    setExpandedCard(newFlow.id);
    setUnsavedChanges(prev => new Set(prev).add(newFlow.id));
  };

  const handleSave = async (flow: EditableFlow) => {
    if (!isAdmin) return;
    
    setSaving(prev => new Set(prev).add(flow.id));
    setError(null);
    try {
      const payload = {
        name: flow.name,
        category: flow.category || null,
        description: flow.description || null,
        source: flow.source || 'JumpCuts Manager',
        status: flow.status || 'planned',
        steps: flow.stages.map((stage, index) => ({
          step: index + 1,
          templateId: stage.templateId,
          templateName: stage.templateName,
          action: stage.action,
          inputs: stage.inputs,
          outputs: stage.outputs,
          triggersNext: stage.triggersNext,
          cantonPrivacy: stage.cantonPrivacy,
          notes: stage.notes,
        })),
      };
      
      let res;
      if (flow.isNew) {
        res = await authFetch('/api/canton-flows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await authFetch(`/api/canton-flows/${flow.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save');
      }

      // Re-fetch to get server-side IDs
      await fetchData();
      
      setUnsavedChanges(prev => {
        const newSet = new Set(prev);
        newSet.delete(flow.id);
        return newSet;
      });
      setEditingCard(null);
    } catch (err) {
      console.error('Error saving flow:', err);
      setError(err instanceof Error ? err.message : 'Failed to save workflow');
    } finally {
      setSaving(prev => {
        const newSet = new Set(prev);
        newSet.delete(flow.id);
        return newSet;
      });
    }
  };

  const handleDelete = async (flowId: string) => {
    if (!isAdmin) return;
    
    try {
      if (!flowId.startsWith('NEW-')) {
        const res = await authFetch(`/api/canton-flows/${flowId}`, {
          method: 'DELETE',
        });
        
        if (!res.ok) {
          throw new Error('Failed to delete workflow');
        }
      }
      
      setFlows(prev => prev.filter(f => f.id !== flowId));
      setUnsavedChanges(prev => {
        const newSet = new Set(prev);
        newSet.delete(flowId);
        return newSet;
      });
      if (expandedCard === flowId) setExpandedCard(null);
      if (editingCard === flowId) setEditingCard(null);
    } catch (err) {
      console.error('Error deleting flow:', err);
      setError('Failed to delete workflow');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-background text-white">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-white/60" />
          <span className="text-white/60">Loading templates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background text-white">
      <div className="flex-none">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Workflow className="w-6 h-6 text-white/70" />
                <h1 className="text-2xl font-bold text-white">Jump Cuts</h1>
              </div>
              <p className="text-white/60 text-sm">Manage workflow templates</p>
            </div>
            {isAdmin && (
              <motion.button
                onClick={handleCreateNew}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 border border-white/20 hover:border-white/40 rounded text-white text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create New Jump Cut
              </motion.button>
            )}
          </div>
          
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{error}</span>
              <button 
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-8 space-y-6">
          {flows.length === 0 ? (
            <div className="text-center py-12">
              <Workflow className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white/40 mb-2">No Jump Cuts Yet</h3>
              <p className="text-sm text-white/30">
                {isAdmin ? 'Create your first workflow template to get started.' : 'No workflow templates available.'}
              </p>
            </div>
          ) : (
            flows.map(flow => (
              <FlowCard
                key={flow.id}
                flow={flow}
                templates={templates}
                isExpanded={expandedCard === flow.id}
                isEditing={editingCard === flow.id}
                hasUnsavedChanges={unsavedChanges.has(flow.id)}
                isSaving={saving.has(flow.id)}
                isAdmin={isAdmin}
                onToggleExpand={() => setExpandedCard(expandedCard === flow.id ? null : flow.id)}
                onToggleEdit={() => {
                  if (!isAdmin) return;
                  const newEditingCard = editingCard === flow.id ? null : flow.id;
                  setEditingCard(newEditingCard);
                  if (newEditingCard === flow.id) {
                    setExpandedCard(flow.id);
                  }
                }}
                onUpdate={(updated) => {
                  if (!isAdmin) return;
                  setFlows(prev => prev.map(f => f.id === updated.id ? updated : f));
                  setUnsavedChanges(prev => new Set(prev).add(updated.id));
                }}
                onSave={handleSave}
                onDelete={handleDelete}
                onSelectJumpCut={onSelectJumpCut}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ─── FlowCard ───────────────────────────────────────────────

interface FlowCardProps {
  flow: EditableFlow;
  templates: CantonTemplate[];
  isExpanded: boolean;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  isAdmin: boolean;
  onToggleExpand: () => void;
  onToggleEdit: () => void;
  onUpdate: (flow: EditableFlow) => void;
  onSave: (flow: EditableFlow) => void;
  onDelete: (flowId: string) => void;
  onSelectJumpCut?: (jumpCut: { id: string; name: string; nodes: Array<{ role: string; participantId: string; position: { x: number; y: number } }> }) => void;
}

const STATUS_COLORS: Record<string, string> = {
  proven: 'bg-green-500/20 text-green-400 border-green-500/30',
  active: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  design: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  planned: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
};

const STATUSES = ['planned', 'design', 'active', 'proven'] as const;

const FlowCard: React.FC<FlowCardProps> = ({
  flow,
  templates,
  isExpanded,
  isEditing,
  hasUnsavedChanges,
  isSaving,
  isAdmin,
  onToggleExpand,
  onToggleEdit,
  onUpdate,
  onSave,
  onDelete,
  onSelectJumpCut,
}) => {
  const [local, setLocal] = useState<EditableFlow>(flow);

  useEffect(() => {
    setLocal(flow);
  }, [flow]);

  const updateLocal = (updates: Partial<EditableFlow>) => {
    const updated = { ...local, ...updates };
    setLocal(updated);
    onUpdate(updated);
  };

  const addStage = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    
    const newStage: EditableStage = {
      id: `stage_${Date.now()}`,
      templateId: template.id,
      templateName: template.name,
      action: '',
      inputs: '',
      outputs: '',
      triggersNext: '',
      cantonPrivacy: '',
      notes: '',
    };
    updateLocal({ stages: [...local.stages, newStage] });
  };

  const updateStage = (stageId: string, updates: Partial<EditableStage>) => {
    updateLocal({
      stages: local.stages.map(s => s.id === stageId ? { ...s, ...updates } : s),
    });
  };

  const removeStage = (stageId: string) => {
    updateLocal({
      stages: local.stages.filter(s => s.id !== stageId),
    });
  };

  const changeStageTemplate = (stageId: string, templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    updateStage(stageId, { templateId: template.id, templateName: template.name });
  };

  return (
    <motion.div
      layout
      className="bg-zinc-950 border border-white/10 rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={onToggleExpand}
              className="text-white/60 hover:text-white transition-colors flex-shrink-0"
            >
              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            
            {isEditing ? (
              <input
                type="text"
                value={local.name}
                onChange={(e) => updateLocal({ name: e.target.value })}
                className="text-lg font-semibold bg-transparent border-b border-white/20 focus:border-white/40 outline-none text-white flex-1 min-w-0"
              />
            ) : (
              <h3 className="text-lg font-semibold text-white truncate">{flow.name}</h3>
            )}
            
            {isEditing ? (
              <select
                value={local.status}
                onChange={(e) => updateLocal({ status: e.target.value })}
                className="text-xs bg-zinc-900 border border-white/20 rounded px-2 py-1 text-white/70 focus:outline-none focus:border-white/40"
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s.toUpperCase()}</option>
                ))}
              </select>
            ) : (
              <span className={`px-2 py-1 text-xs rounded border flex-shrink-0 ${STATUS_COLORS[flow.status] || STATUS_COLORS.planned}`}>
                {flow.status}
              </span>
            )}
            
            {hasUnsavedChanges && (
              <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded flex-shrink-0">
                Unsaved
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {/* Build Flow Button - visible to all users */}
            <motion.button
              onClick={() => {
                if (onSelectJumpCut) {
                  // Convert flow to jumpCut format for navigation
                  const jumpCut = {
                    id: flow.id,
                    name: flow.name,
                    nodes: flow.stages.map((stage, index) => ({
                      role: stage.templateName,
                      participantId: `participant_${index}`,
                      position: { x: 350 + (index * 300), y: 250 }
                    }))
                  };
                  onSelectJumpCut(jumpCut);
                }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
              title="Build Flow"
            >
              <Hammer className="w-4 h-4" />
            </motion.button>
            
            {isAdmin && (
              <>
                {isEditing ? (
                  <>
                    <motion.button
                      onClick={() => onSave(local)}
                      disabled={isSaving}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                      title="Save"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </motion.button>
                    <motion.button
                      onClick={onToggleEdit}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-white/60 hover:text-white transition-colors"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      onClick={onToggleEdit}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-white/60 hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => onDelete(flow.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-red-400/60 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </>
                )}
              </>
            )}
        </div>
        </div>

        {isEditing ? (
          <div className="ml-8 space-y-3">
            <textarea
              value={local.description}
              onChange={(e) => updateLocal({ description: e.target.value })}
              placeholder="Enter description..."
              className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-white/80 text-sm resize-none focus:border-white/30 outline-none"
              rows={2}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={local.category}
                onChange={(e) => updateLocal({ category: e.target.value })}
                placeholder="Category (e.g. Collateral Mobility)"
                className="bg-zinc-900 border border-white/10 rounded px-3 py-2 text-white/80 text-sm focus:border-white/30 outline-none"
              />
              <input
                type="text"
                value={local.source}
                onChange={(e) => updateLocal({ source: e.target.value })}
                placeholder="Source (e.g. Canton Working Group)"
                className="bg-zinc-900 border border-white/10 rounded px-3 py-2 text-white/80 text-sm focus:border-white/30 outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="ml-8">
            <p className="text-white/60 text-sm mb-3">{flow.description || 'No description'}</p>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-white/50 ml-8 mt-2">
          <div className="flex items-center gap-1">
            <Layers className="w-4 h-4" />
            <span>{flow.stages.length} stages</span>
          </div>
          {flow.category && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{flow.category}</span>
            </div>
          )}
        </div>
      </div>

      {/* Expanded stages */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/10"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-white/80">Workflow Stages</h4>
                {isEditing && isAdmin && templates.length > 0 && (
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addStage(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="text-xs bg-zinc-900 border border-white/20 hover:border-white/40 rounded px-3 py-1.5 text-white/70 transition-colors focus:outline-none focus:border-white/40"
                  >
                    <option value="">+ Add Stage (select template)...</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-3">
                {local.stages.map((stage, index) => (
                  <div key={stage.id} className="flex items-start gap-3 p-4 bg-white/5 rounded border border-white/10">
                    <div className="flex-shrink-0 w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/60 mt-0.5">
                      {index + 1}
                    </div>
                    
                    {isEditing ? (
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <select
                            value={stage.templateId}
                            onChange={(e) => changeStageTemplate(stage.id, e.target.value)}
                            className="flex-1 bg-zinc-900 border border-white/20 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-white/40"
                          >
                            {templates.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                            {/* Keep current value visible even if template not in list */}
                            {!templates.find(t => t.id === stage.templateId) && (
                              <option value={stage.templateId}>{stage.templateName}</option>
                            )}
                          </select>
                          
                          <motion.button
                            onClick={() => removeStage(stage.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        </div>
                        
                        <input
                          type="text"
                          value={stage.action}
                          onChange={(e) => updateStage(stage.id, { action: e.target.value })}
                          placeholder="Action description..."
                          className="w-full bg-zinc-900 border border-white/10 rounded px-2 py-1.5 text-white/80 text-sm focus:border-white/30 outline-none"
                        />
                        
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={stage.inputs}
                            onChange={(e) => updateStage(stage.id, { inputs: e.target.value })}
                            placeholder="Inputs..."
                            className="bg-zinc-900 border border-white/10 rounded px-2 py-1.5 text-white/60 text-xs focus:border-white/30 outline-none"
                          />
                          <input
                            type="text"
                            value={stage.outputs}
                            onChange={(e) => updateStage(stage.id, { outputs: e.target.value })}
                            placeholder="Outputs..."
                            className="bg-zinc-900 border border-white/10 rounded px-2 py-1.5 text-white/60 text-xs focus:border-white/30 outline-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white text-sm font-medium">{stage.templateName}</span>
                        </div>
                        {stage.action && (
                          <p className="text-white/60 text-xs mb-1">{stage.action}</p>
                        )}
                        {(stage.inputs || stage.outputs) && (
                          <div className="flex items-center gap-3 text-xs text-white/40">
                            {stage.inputs && <span>In: {stage.inputs}</span>}
                            {stage.outputs && <span>Out: {stage.outputs}</span>}
                          </div>
                        )}
                        {stage.notes && (
                          <p className="text-white/40 text-xs mt-1 italic">{stage.notes}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {local.stages.length === 0 && (
                  <div className="text-center py-8 text-white/40 text-sm">
                    {isEditing ? 'Select a template above to add the first stage' : 'No stages defined'}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
