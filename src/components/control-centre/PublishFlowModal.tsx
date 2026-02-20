"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Modal } from '@/components/ui';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface PublishFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (options: { isPublic: boolean }) => Promise<void>;
  flowTitle: string;
  nodeCount: number;
  edgeCount: number;
}

const Toggle: React.FC<{ 
  checked: boolean; 
  onChange: (checked: boolean) => void; 
}> = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`
      w-10 h-5 rounded-full transition-colors relative
      ${checked ? 'bg-white/40' : 'bg-white/20'}
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

export const PublishFlowModal: React.FC<PublishFlowModalProps> = ({
  isOpen,
  onClose,
  onPublish,
  flowTitle,
  nodeCount,
  edgeCount,
}) => {
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsPublic(true);
      setIsLoading(false);
      setShowSuccess(false);
    }
  }, [isOpen]);

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      await onPublish({ isPublic });
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to publish flow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasWarning = nodeCount < 2;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Publish Flow" size="md">
      {showSuccess ? (
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4"
          >
            <CheckCircle className="w-8 h-8 text-green-400" />
          </motion.div>
          <h3 className="text-lg font-semibold text-white mb-2">Flow Published!</h3>
          <p className="text-sm text-white/60">
            Your flow is now {isPublic ? 'publicly' : 'privately'} available.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded p-4">
            <h3 className="text-sm font-medium text-white/80 mb-3">Flow Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Title:</span>
                <span className="text-white">{flowTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Nodes:</span>
                <span className="text-white">{nodeCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Connections:</span>
                <span className="text-white">{edgeCount}</span>
              </div>
            </div>
          </div>

          {hasWarning && (
            <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded">
              <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-yellow-400 mb-1">
                  Incomplete Flow
                </div>
                <div className="text-xs text-yellow-400/80">
                  This flow has fewer than 2 nodes. Consider adding more participants.
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded">
            <div>
              <div className="text-sm font-medium text-white/80">Public Visibility</div>
              <div className="text-xs text-white/50">
                Make this flow discoverable by other users
              </div>
            </div>
            <Toggle
              checked={isPublic}
              onChange={setIsPublic}
            />
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
              onClick={handlePublish}
              disabled={isLoading}
              className="px-4 py-2 bg-white/10 text-white rounded text-sm font-medium hover:bg-white/20 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? 'Publishing...' : 'Publish Flow'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};