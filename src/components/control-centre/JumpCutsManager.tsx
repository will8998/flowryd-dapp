"use client";

import React, { useState, useEffect } from 'react';
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
  Layers 
} from 'lucide-react';
import { workflows, participants, type Workflow as WorkflowType, type WorkflowStage, type FeaturedApp } from '@/lib/canton-data';

interface CustomWorkflow extends WorkflowType {
  isCustom?: boolean;
}

interface EditableWorkflowStage extends WorkflowStage {
  id: string;
}

interface EditableWorkflow extends Omit<CustomWorkflow, 'stages'> {
  stages: EditableWorkflowStage[];
}

export const JumpCutsManager: React.FC = () => {
  const [jumpCuts, setJumpCuts] = useState<EditableWorkflow[]>([]);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedCustomizations = localStorage.getItem('flowryd_jumpcuts_custom');
    const customData = savedCustomizations ? JSON.parse(savedCustomizations) : [];
    
    const editableWorkflows: EditableWorkflow[] = workflows.map(wf => ({
      ...wf,
      stages: wf.stages.map((stage, index) => ({
        ...stage,
        id: `${wf.id}_stage_${index}`
      }))
    }));

    const mergedData = [...editableWorkflows];
    customData.forEach((custom: EditableWorkflow) => {
      const existingIndex = mergedData.findIndex(wf => wf.id === custom.id);
      if (existingIndex >= 0) {
        mergedData[existingIndex] = { ...custom, isCustom: true };
      } else {
        mergedData.push({ ...custom, isCustom: true });
      }
    });

    setJumpCuts(mergedData);
  }, []);

  const handleCreateNew = () => {
    const newWorkflow: EditableWorkflow = {
      id: `WF-${Date.now()}`,
      name: 'New Jump Cut',
      description: 'Enter description...',
      roles: [],
      stages: [],
      featuredApps: [],
      orchestrationFee: 0,
      stackCategory: 'custom',
      isCustom: true
    };
    setJumpCuts(prev => [...prev, newWorkflow]);
    setEditingCard(newWorkflow.id);
    setExpandedCard(newWorkflow.id);
    setUnsavedChanges(prev => new Set(prev).add(newWorkflow.id));
  };

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
            <motion.button
              onClick={handleCreateNew}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 border border-white/20 hover:border-white/40 rounded text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Jump Cut
            </motion.button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-8 space-y-6">
          {jumpCuts.length === 0 ? (
            <div className="text-center py-12">
              <Workflow className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white/40 mb-2">No Jump Cuts Yet</h3>
              <p className="text-sm text-white/30">Create your first workflow template to get started.</p>
            </div>
          ) : (
            jumpCuts.map(jumpCut => (
              <WorkflowCard
                key={jumpCut.id}
                workflow={jumpCut}
                isExpanded={expandedCard === jumpCut.id}
                isEditing={editingCard === jumpCut.id}
                hasUnsavedChanges={unsavedChanges.has(jumpCut.id)}
                onToggleExpand={() => setExpandedCard(expandedCard === jumpCut.id ? null : jumpCut.id)}
                onToggleEdit={() => {
                  const newEditingCard = editingCard === jumpCut.id ? null : jumpCut.id;
                  setEditingCard(newEditingCard);
                  if (newEditingCard === jumpCut.id) {
                    setExpandedCard(jumpCut.id);
                  }
                }}
                onUpdate={(updatedWorkflow) => {
                  setJumpCuts(prev => prev.map(wf => wf.id === updatedWorkflow.id ? updatedWorkflow : wf));
                  setUnsavedChanges(prev => new Set(prev).add(updatedWorkflow.id));
                }}
                onSave={(workflow) => {
                  const customWorkflows = jumpCuts.filter(wf => wf.isCustom).map(wf => 
                    wf.id === workflow.id ? workflow : wf
                  );
                  localStorage.setItem('flowryd_jumpcuts_custom', JSON.stringify(customWorkflows));
                  setUnsavedChanges(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(workflow.id);
                    return newSet;
                  });
                }}
                onDelete={(workflowId) => {
                  setJumpCuts(prev => prev.filter(wf => wf.id !== workflowId));
                  const customWorkflows = jumpCuts.filter(wf => wf.isCustom && wf.id !== workflowId);
                  localStorage.setItem('flowryd_jumpcuts_custom', JSON.stringify(customWorkflows));
                  setUnsavedChanges(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(workflowId);
                    return newSet;
                  });
                  if (expandedCard === workflowId) setExpandedCard(null);
                  if (editingCard === workflowId) setEditingCard(null);
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

interface WorkflowCardProps {
  workflow: EditableWorkflow;
  isExpanded: boolean;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  onToggleExpand: () => void;
  onToggleEdit: () => void;
  onUpdate: (workflow: EditableWorkflow) => void;
  onSave: (workflow: EditableWorkflow) => void;
  onDelete: (workflowId: string) => void;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  isExpanded,
  isEditing,
  hasUnsavedChanges,
  onToggleExpand,
  onToggleEdit,
  onUpdate,
  onSave,
  onDelete
}) => {
  const [localWorkflow, setLocalWorkflow] = useState<EditableWorkflow>(workflow);

  useEffect(() => {
    setLocalWorkflow(workflow);
  }, [workflow]);

  const updateLocalWorkflow = (updates: Partial<EditableWorkflow>) => {
    const updatedWorkflow = { ...localWorkflow, ...updates };
    setLocalWorkflow(updatedWorkflow);
    onUpdate(updatedWorkflow);
  };

  const addStage = () => {
    const newStage: EditableWorkflowStage = {
      id: `${localWorkflow.id}_stage_${Date.now()}`,
      name: 'New Stage',
      roles: []
    };
    updateLocalWorkflow({
      stages: [...localWorkflow.stages, newStage]
    });
  };

  const updateStage = (stageId: string, updates: Partial<EditableWorkflowStage>) => {
    updateLocalWorkflow({
      stages: localWorkflow.stages.map(stage =>
        stage.id === stageId ? { ...stage, ...updates } : stage
      )
    });
  };

  const removeStage = (stageId: string) => {
    updateLocalWorkflow({
      stages: localWorkflow.stages.filter(stage => stage.id !== stageId)
    });
  };

  const addRoleToStage = (stageId: string, role: string) => {
    updateLocalWorkflow({
      stages: localWorkflow.stages.map(stage =>
        stage.id === stageId 
          ? { ...stage, roles: [...stage.roles, role] }
          : stage
      ),
      roles: [...new Set([...localWorkflow.roles, role])]
    });
  };

  const removeRoleFromStage = (stageId: string, roleToRemove: string) => {
    const updatedStages = localWorkflow.stages.map(stage =>
      stage.id === stageId 
        ? { ...stage, roles: stage.roles.filter(role => role !== roleToRemove) }
        : stage
    );
    
    const allRoles = [...new Set(updatedStages.flatMap(stage => stage.roles))];
    
    updateLocalWorkflow({
      stages: updatedStages,
      roles: allRoles
    });
  };

  const availableRoles = [
    'Issuer', 'Registry', 'Settlement', 'Custody', 'Wallet', 'Exchange',
    'Liquidity_Provider', 'Market_Maker', 'Collateral_Agent', 'Collateral_Provider',
    'Collateral_Taker', 'Data_Oracle', 'Payment_Stablecoin', 'Identity_Provider',
    'Cash_Lender', 'Cash_Borrower', 'Repo_Platform'
  ];
  return (
    <motion.div
      layout
      className="bg-black/30 border border-white/10 rounded overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {isEditing ? (
                <input
                  type="text"
                  value={localWorkflow.name}
                  onChange={(e) => updateLocalWorkflow({ name: e.target.value })}
                  className="text-lg font-semibold text-white bg-white/5 border border-white/10 rounded px-3 py-1 focus:outline-none focus:border-white/30"
                />
              ) : (
                <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
              )}
              {workflow.isCustom && (
                <span className="px-2 py-1 bg-white/10 text-white/60 rounded text-xs font-medium">
                  Custom
                </span>
              )}
              {hasUnsavedChanges && (
                <span className="px-2 py-1 bg-amber-500/20 text-amber-500 rounded text-xs font-medium">
                  Unsaved
                </span>
              )}
            </div>
            {isEditing ? (
              <textarea
                value={localWorkflow.description}
                onChange={(e) => updateLocalWorkflow({ description: e.target.value })}
                className="w-full text-white/60 text-sm bg-white/5 border border-white/10 rounded px-3 py-2 resize-none focus:outline-none focus:border-white/30"
                rows={2}
              />
            ) : (
              <p className="text-white/60 text-sm mb-3">{workflow.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1 text-white/40">
                <Layers className="w-3 h-3" />
                <span>{localWorkflow.stages.length} stages</span>
              </div>
              <div className="flex items-center gap-1 text-white/40">
                <Users className="w-3 h-3" />
                <span>{localWorkflow.roles.length} roles</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleEdit}
              className={`p-2 rounded transition-colors ${
                isEditing 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleExpand}
              className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded transition-colors"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5"
          >
            <div className="p-6 space-y-6">
              {localWorkflow.stages.length === 0 ? (
                <div className="text-center py-8">
                  <Layers className="w-8 h-8 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">No stages defined yet</p>
                  {isEditing && (
                    <button
                      onClick={addStage}
                      className="mt-4 flex items-center gap-2 px-4 py-2 border border-white/20 hover:border-white/40 rounded text-white text-sm font-medium mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Stage
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Workflow Stages
                    </h4>
                    {isEditing && (
                      <button
                        onClick={addStage}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white/60 rounded text-xs font-medium transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Add Stage
                      </button>
                    )}
                  </div>
                  {localWorkflow.stages.map((stage, stageIndex) => (
                    <div key={stage.id} className="bg-white/5 rounded p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 text-white/80 text-xs font-mono">
                          {stageIndex + 1}
                        </div>
                        {isEditing ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={stage.name}
                              onChange={(e) => updateStage(stage.id, { name: e.target.value })}
                              className="flex-1 font-medium text-white bg-white/10 border border-white/20 rounded px-2 py-1 text-sm focus:outline-none focus:border-white/30"
                            />
                            <button
                              onClick={() => removeStage(stage.id)}
                              className="p-1.5 text-red-400 hover:bg-red-600/20 rounded transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <h5 className="font-medium text-white">{stage.name}</h5>
                        )}
                      </div>
                      <div className="ml-9">
                        <div className="text-xs text-white/40 mb-2 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Roles ({stage.roles.length})
                          {isEditing && (
                            <select
                              onChange={(e) => {
                                if (e.target.value && !stage.roles.includes(e.target.value)) {
                                  addRoleToStage(stage.id, e.target.value);
                                }
                                e.target.value = '';
                              }}
                              className="ml-2 bg-white/10 border border-white/20 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-white/30"
                            >
                              <option value="">Add role...</option>
                              {availableRoles
                                .filter(role => !stage.roles.includes(role))
                                .map(role => (
                                  <option key={role} value={role} className="bg-gray-800">
                                    {role.replace('_', ' ')}
                                  </option>
                                ))}
                            </select>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {stage.roles.map(role => (
                            <span
                              key={role}
                              className="px-2 py-1 bg-white/10 text-white/80 rounded text-xs font-medium flex items-center gap-1"
                            >
                              {role.replace('_', ' ')}
                              {isEditing && (
                                <button
                                  onClick={() => removeRoleFromStage(stage.id, role)}
                                  className="text-white/40 hover:text-red-400 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                        {!isEditing && stage.roles.length > 0 && (
                          <div className="mt-3">
                            <div className="text-xs text-white/40 mb-2">Recommended Participants</div>
                            <div className="space-y-1">
                              {stage.roles.map(role => {
                                const matchingParticipants = participants.filter(p => 
                                  p.capabilities[role] || 
                                  p.cantonRole.toLowerCase().includes(role.toLowerCase())
                                ).slice(0, 3);
                                
                                return matchingParticipants.length > 0 ? (
                                  <div key={role} className="text-xs">
                                    <span className="text-white/60">{role.replace('_', ' ')}: </span>
                                    <span className="text-white/40">
                                      {matchingParticipants.map(p => p.name).join(', ')}
                                      {participants.filter(p => p.capabilities[role] || p.cantonRole.toLowerCase().includes(role.toLowerCase())).length > 3 && ' +more'}
                                    </span>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(isEditing || (localWorkflow.featuredApps && localWorkflow.featuredApps.length > 0)) && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white/70 flex items-center gap-2">
                      <Workflow className="w-4 h-4" />
                      App Stack {localWorkflow.featuredApps && localWorkflow.featuredApps.length > 0 && `(${localWorkflow.featuredApps.length})`}
                    </h4>
                  </div>

                  <div className="bg-white/5 rounded p-4 space-y-4">
                    {isEditing && (
                      <>
                        {/* Stack Category */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Stack Category</label>
                          <select
                            value={localWorkflow.stackCategory || 'custom'}
                            onChange={(e) => updateLocalWorkflow({ stackCategory: e.target.value as 'defi' | 'custody' | 'compliance' | 'issuance' | 'custom' })}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                          >
                            <option value="defi">DeFi</option>
                            <option value="custody">Custody</option>
                            <option value="compliance">Compliance</option>
                            <option value="issuance">Issuance</option>
                            <option value="custom">Custom</option>
                          </select>
                        </div>

                        {/* Orchestration Fee */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                            Orchestration Fee: {localWorkflow.orchestrationFee ?? 0}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="25"
                            value={localWorkflow.orchestrationFee ?? 0}
                            onChange={(e) => updateLocalWorkflow({ orchestrationFee: parseInt(e.target.value) })}
                            className="w-full h-2 bg-white/10 rounded appearance-none slider-thumb:appearance-none slider-thumb:w-4 slider-thumb:h-4 slider-thumb:rounded-full slider-thumb:bg-white/40 slider-thumb:cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/20"
                          />
                          <div className="flex justify-between text-xs text-white/40">
                            <span>0%</span>
                            <span>25%</span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Featured Apps */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                          Featured Apps {localWorkflow.featuredApps && `(${localWorkflow.featuredApps.length})`}
                        </label>
                        {isEditing && (
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                const existingApps = localWorkflow.featuredApps || [];
                                const newApp: FeaturedApp = {
                                  participantId: e.target.value,
                                  revenueSharePct: 10
                                };
                                updateLocalWorkflow({
                                  featuredApps: [...existingApps, newApp]
                                });
                                e.target.value = '';
                              }
                            }}
                            className="bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-white/30"
                          >
                            <option value="">Add App...</option>
                            {participants
                              .filter(p => !localWorkflow.featuredApps?.some(fa => fa.participantId === p.id))
                              .map(participant => (
                                <option key={participant.id} value={participant.id} className="bg-gray-800">
                                  {participant.name}
                                </option>
                              ))}
                          </select>
                        )}
                      </div>

                      {localWorkflow.featuredApps && localWorkflow.featuredApps.length > 0 ? (
                        <div className="space-y-2">
                          {localWorkflow.featuredApps.map((app, index) => {
                            const participant = participants.find(p => p.id === app.participantId);
                            return (
                              <div key={app.participantId} className="flex items-center justify-between p-3 bg-white/5 rounded">
                                <div className="flex items-center gap-3">
                                  <span className="text-white font-medium text-sm">
                                    {participant?.name || app.participantId}
                                  </span>
                                  {!isEditing && (
                                     <span className="px-2 py-1 bg-white/10 text-white/50 rounded text-xs font-mono">
                                       {app.revenueSharePct}%
                                     </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {isEditing && (
                                    <>
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={app.revenueSharePct}
                                        onChange={(e) => {
                                          const updatedApps = localWorkflow.featuredApps!.map((fa, i) =>
                                            i === index ? { ...fa, revenueSharePct: parseInt(e.target.value) || 0 } : fa
                                          );
                                          updateLocalWorkflow({ featuredApps: updatedApps });
                                        }}
                                         className="w-16 text-center bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-white/30"
                                      />
                                      <span className="text-white/60 text-sm">%</span>
                                      <button
                                        onClick={() => {
                                          const updatedApps = localWorkflow.featuredApps!.filter((_, i) => i !== index);
                                          updateLocalWorkflow({ featuredApps: updatedApps });
                                        }}
                                        className="p-1.5 text-red-400 hover:bg-red-600/20 rounded transition-colors"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-white/40 text-sm">No featured apps selected</p>
                        </div>
                      )}
                    </div>

                    {/* Read-only view for non-editing mode */}
                    {!isEditing && (
                      <div className="flex flex-wrap gap-2">
                        {localWorkflow.stackCategory && (
                          <span className="px-2 py-1 bg-white/10 text-white/60 rounded text-xs font-medium">
                            {localWorkflow.stackCategory.toUpperCase()}
                          </span>
                        )}
                        {(localWorkflow.orchestrationFee ?? 0) > 0 && (
                          <span className="px-2 py-1 bg-white/10 text-white/50 rounded text-xs font-medium">
                            {localWorkflow.orchestrationFee}% Fee
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!isEditing && localWorkflow.roles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    All Workflow Roles
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {localWorkflow.roles.map(role => (
                      <span
                        key={role}
                        className="px-3 py-1.5 bg-white/10 text-white/60 rounded text-sm font-medium border border-white/10"
                      >
                        {role.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                {isEditing && (
                  <>
                    <button
                      onClick={() => onSave(localWorkflow)}
                      disabled={!hasUnsavedChanges}
                      className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${
                        hasUnsavedChanges
                          ? 'border border-white/30 text-white hover:border-white/50'
                          : 'bg-white/5 text-white/40 cursor-not-allowed'
                      }`}
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                    {workflow.isCustom && (
                      <button
                        onClick={() => onDelete(workflow.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-sm font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};