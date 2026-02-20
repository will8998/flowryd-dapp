"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';

interface FlowSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  flow: { 
    id: string; 
    title: string; 
    description: string | null; 
    status: string | null; 
    isPublic: boolean | null; 
    isTemplate: boolean | null; 
    workflowType: string | null 
  } | null;
  onUpdate: (data: Partial<{ 
    title: string; 
    description: string; 
    isPublic: boolean; 
    isTemplate: boolean; 
    workflowType: string 
  }>) => Promise<void>;
}

const workflowTypeOptions = [
  { value: 'tokenization', label: 'Tokenization' },
  { value: 'settlement', label: 'Settlement' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'custody', label: 'Custody' },
  { value: 'lending', label: 'Lending' },
  { value: 'custom', label: 'Custom' },
];

const Toggle: React.FC<{ 
  checked: boolean; 
  onChange: (checked: boolean) => void; 
  disabled?: boolean;
}> = ({ checked, onChange, disabled = false }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={`
      w-10 h-5 rounded-full transition-colors relative
      ${checked ? 'bg-white/40' : 'bg-white/20'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    <div
      className={`
        w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform
        ${checked ? 'translate-x-5' : 'translate-x-0.5'}
      `}
    />
  </button>
);

export const FlowSettingsPanel: React.FC<FlowSettingsPanelProps> = ({
  isOpen,
  onClose,
  flow,
  onUpdate,
}) => {
  const [localTitle, setLocalTitle] = useState('');
  const [localDescription, setLocalDescription] = useState('');
  const [localIsPublic, setLocalIsPublic] = useState(false);
  const [localIsTemplate, setLocalIsTemplate] = useState(false);
  const [localWorkflowType, setLocalWorkflowType] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (flow) {
      setLocalTitle(flow.title || '');
      setLocalDescription(flow.description || '');
      setLocalIsPublic(flow.isPublic || false);
      setLocalIsTemplate(flow.isTemplate || false);
      setLocalWorkflowType(flow.workflowType || '');
    }
  }, [flow]);

  const handleTitleBlur = async () => {
    if (flow && localTitle !== flow.title && localTitle.trim()) {
      await onUpdate({ title: localTitle.trim() });
    }
  };

  const handleDescriptionBlur = async () => {
    if (flow && localDescription !== (flow.description || '')) {
      await onUpdate({ description: localDescription.trim() });
    }
  };

  const handlePublicToggle = async (checked: boolean) => {
    setLocalIsPublic(checked);
    if (flow) {
      await onUpdate({ isPublic: checked });
    }
  };

  const handleTemplateToggle = async (checked: boolean) => {
    setLocalIsTemplate(checked);
    if (flow) {
      await onUpdate({ isTemplate: checked });
    }
  };

  const handleWorkflowTypeChange = async (value: string) => {
    setLocalWorkflowType(value);
    if (flow) {
      await onUpdate({ workflowType: value || undefined });
    }
  };

  const handleDelete = async () => {
    if (!flow) return;
    try {
      const response = await fetch(`/api/flows/${flow.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to delete flow:', error);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 z-40" 
            onClick={onClose}
          />
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="fixed right-0 top-0 h-full w-80 bg-[#0a0a0a] border-l border-white/10 z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Flow Settings</h2>
                <button
                  onClick={onClose}
                  className="text-white/40 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
                >
                  <X size={20} />
                </button>
              </div>

              {flow && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-white/80 mb-4">General</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-white/60 mb-1.5 block">
                          Title
                        </label>
                        <input
                          type="text"
                          value={localTitle}
                          onChange={(e) => setLocalTitle(e.target.value)}
                          onBlur={handleTitleBlur}
                          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-white/60 mb-1.5 block">
                          Description
                        </label>
                        <textarea
                          value={localDescription}
                          onChange={(e) => setLocalDescription(e.target.value)}
                          onBlur={handleDescriptionBlur}
                          rows={3}
                          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none resize-none"
                          placeholder="Optional description..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/5 my-4" />

                  <div>
                    <h3 className="text-sm font-medium text-white/80 mb-4">Visibility</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-white/80">Public</div>
                          <div className="text-xs text-white/50">Make this flow visible to others</div>
                        </div>
                        <Toggle
                          checked={localIsPublic}
                          onChange={handlePublicToggle}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-white/80">Template</div>
                          <div className="text-xs text-white/50">Allow others to use as template</div>
                        </div>
                        <Toggle
                          checked={localIsTemplate}
                          onChange={handleTemplateToggle}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/5 my-4" />

                  <div>
                    <h3 className="text-sm font-medium text-white/80 mb-4">Type</h3>
                    <div>
                      <label className="text-xs font-medium text-white/60 mb-1.5 block">
                        Workflow Type
                      </label>
                      <select
                        value={localWorkflowType}
                        onChange={(e) => handleWorkflowTypeChange(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
                      >
                        <option value="" className="bg-[#0a0a0a] text-white/60">
                          Select type
                        </option>
                        {workflowTypeOptions.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            className="bg-[#0a0a0a] text-white"
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-white/5 my-4" />

                  <div>
                    <h3 className="text-sm font-medium text-red-400 mb-4">Danger Zone</h3>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 border border-red-400/30 rounded hover:bg-red-400/10 transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete Flow
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {showDeleteConfirm && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-[#0a0a0a] border border-white/10 rounded p-6 max-w-sm w-full">
                <h3 className="text-lg font-semibold text-white mb-2">Delete Flow</h3>
                <p className="text-sm text-white/60 mb-4">
                  Are you sure you want to delete &ldquo;{flow?.title}&rdquo;? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-3 py-2 text-sm text-white/60 border border-white/20 rounded hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-3 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};