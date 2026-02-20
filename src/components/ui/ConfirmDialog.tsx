"use client";

import { useState } from 'react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  variant?: 'danger' | 'default';
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  variant = 'default'
}: ConfirmDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Confirm action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmButtonClasses = variant === 'danger'
    ? 'border-red-400/30 text-red-400 hover:border-red-400/50'
    : 'border-white/20 text-white hover:border-white/40';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        {description && (
          <p className="text-white/70 text-sm">
            {description}
          </p>
        )}
        
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="border border-white/20 hover:border-white/40 text-white rounded px-3 py-1.5 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`
              border rounded px-3 py-1.5 text-sm transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              ${confirmButtonClasses}
              ${isLoading ? 'cursor-wait' : ''}
            `}
          >
            {isLoading ? 'Loading...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};