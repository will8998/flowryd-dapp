"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  volume: string | null;
  flowId: string | null;
  createdBy: string;
  updatedAt: string;
  createdAt: string;
}

interface DealSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal;
  onUpdate: () => void;
  dealId: string;
}

const STAGES = [
  { key: 'draft', label: 'Draft', color: 'bg-white/40' },
  { key: 'open', label: 'Open', color: 'bg-white/20' },
  { key: 'negotiating', label: 'Negotiate', color: 'bg-white/20' },
  { key: 'locked', label: 'Locked', color: 'bg-white/20' },
  { key: 'committed', label: 'Committed', color: 'bg-white/40' },
];

export default function DealSettings({ isOpen, onClose, deal, onUpdate, dealId }: DealSettingsProps) {
  const [localTitle, setLocalTitle] = useState('');
  const [localDescription, setLocalDescription] = useState('');
  const [localVolume, setLocalVolume] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (deal) {
      setLocalTitle(deal.title || '');
      setLocalDescription(deal.description || '');
      setLocalVolume(deal.volume || '');
    }
  }, [deal]);

  const updateDeal = async (updates: Partial<{ title: string; description: string; volume: string }>) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update deal:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTitleBlur = async () => {
    if (localTitle !== deal.title && localTitle.trim()) {
      await updateDeal({ title: localTitle.trim() });
    }
  };

  const handleDescriptionBlur = async () => {
    if (localDescription !== (deal.description || '')) {
      await updateDeal({ description: localDescription.trim() });
    }
  };

  const handleVolumeBlur = async () => {
    if (localVolume !== (deal.volume || '')) {
      await updateDeal({ volume: localVolume.trim() });
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onClose();
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Failed to delete deal:', error);
    }
    setShowDeleteConfirm(false);
  };

  const currentStage = STAGES.find(s => s.key === deal.status) || STAGES[0];

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
            className="fixed right-0 top-0 h-full w-80 bg-[#0a0a0a] border-l border-white/5 z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white tracking-wide">Deal Settings</h2>
                <button
                  onClick={onClose}
                  className="text-white/40 hover:text-white/70 transition-colors p-1 rounded hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-[11px] font-bold text-white/30 tracking-wide mb-4">GENERAL</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[8px] font-mono text-white/30 tracking-wide mb-1.5 block">
                        TITLE
                      </label>
                      <input
                        type="text"
                        value={localTitle}
                        onChange={(e) => setLocalTitle(e.target.value)}
                        onBlur={handleTitleBlur}
                        disabled={isUpdating}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-[13px] text-white/70 placeholder:text-white/30 focus:border-white/30 focus:outline-none disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-mono text-white/30 tracking-wide mb-1.5 block">
                        DESCRIPTION
                      </label>
                      <textarea
                        value={localDescription}
                        onChange={(e) => setLocalDescription(e.target.value)}
                        onBlur={handleDescriptionBlur}
                        disabled={isUpdating}
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-[12px] text-white/70 placeholder:text-white/30 focus:border-white/30 focus:outline-none resize-none disabled:opacity-50"
                        placeholder="Optional description..."
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-mono text-white/30 tracking-wide mb-1.5 block">
                        VOLUME
                      </label>
                      <input
                        type="text"
                        value={localVolume}
                        onChange={(e) => setLocalVolume(e.target.value)}
                        onBlur={handleVolumeBlur}
                        disabled={isUpdating}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-[13px] text-white/70 placeholder:text-white/30 focus:border-white/30 focus:outline-none disabled:opacity-50"
                        placeholder="e.g., $1.5M"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 my-4" />

                <div>
                  <h3 className="text-[11px] font-bold text-white/30 tracking-wide mb-4">STATUS</h3>
                  <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded">
                    <div className={`w-3 h-3 rounded-full ${currentStage.color}`} />
                    <div>
                      <div className="text-[12px] font-bold text-white/80">{currentStage.label}</div>
                      <div className="text-[9px] text-white/30 tracking-wide">Current Status</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 my-4" />

                <div>
                  <h3 className="text-[11px] font-bold text-white/30 tracking-wide mb-4">METADATA</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[8px] font-mono text-white/30 tracking-wide mb-1">CREATED</p>
                      <p className="text-[11px] text-white/50">{new Date(deal.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-mono text-white/30 tracking-wide mb-1">LAST UPDATED</p>
                      <p className="text-[11px] text-white/50">{new Date(deal.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 my-4" />

                <div>
                  <h3 className="text-[11px] font-bold text-red-400/70 tracking-wide mb-4">DANGER ZONE</h3>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-red-400 border border-red-400/30 rounded hover:bg-red-400/10 transition-colors tracking-wide"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    DELETE DEAL
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {showDeleteConfirm && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#0a0a0a] border border-white/10 rounded p-6 max-w-sm w-full"
              >
                <h3 className="text-lg font-bold text-white mb-2">Delete Deal</h3>
                <p className="text-[12px] text-white/60 mb-4 leading-relaxed">
                  Are you sure you want to delete &ldquo;{deal.title}&rdquo;? This action cannot be undone and will permanently remove all messages and files.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-3 py-2 text-[10px] font-bold text-white/60 border border-white/20 rounded hover:bg-white/5 transition-colors tracking-wide"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-3 py-2 text-[10px] font-bold text-white bg-red-600 rounded hover:bg-red-700 transition-colors tracking-wide"
                  >
                    DELETE
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}