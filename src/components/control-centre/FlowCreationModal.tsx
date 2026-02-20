"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui';

interface FlowCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { title: string; description?: string; workflowType?: string }) => Promise<void>;
}

const workflowTypeOptions = [
  { value: 'tokenization', label: 'Tokenization' },
  { value: 'settlement', label: 'Settlement' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'custody', label: 'Custody' },
  { value: 'lending', label: 'Lending' },
  { value: 'custom', label: 'Custom' },
];

export const FlowCreationModal: React.FC<FlowCreationModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [workflowType, setWorkflowType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setWorkflowType('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      titleInputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim() || undefined,
        workflowType: workflowType || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Failed to create flow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Flow" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-white/60 mb-1.5 block">
            Title *
          </label>
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter flow title..."
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-white/60 mb-1.5 block">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-white/60 mb-1.5 block">
            Workflow Type
          </label>
          <select
            value={workflowType}
            onChange={(e) => setWorkflowType(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
          >
            <option value="" className="bg-[#0a0a0a] text-white/60">
              Select type (optional)
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

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !title.trim()}
            className="px-4 py-2 bg-white/10 text-white rounded text-sm font-medium hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Flow'}
          </button>
        </div>
      </form>
    </Modal>
  );
};