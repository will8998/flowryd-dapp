"use client";

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';
import { Shortcut, groupShortcutsByCategory, formatKeyCombo } from '@/lib/keyboard-shortcuts';

interface ShortcutMapProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: Shortcut[];
}

export const ShortcutMap: React.FC<ShortcutMapProps> = ({ isOpen, onClose, shortcuts }) => {
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const shortcutsByCategory = groupShortcutsByCategory(shortcuts);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
            className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Keyboard className="w-4 h-4 text-white/60" />
                </div>
                <h2 className="text-lg font-bold text-white">Keyboard Shortcuts</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Close shortcuts"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              {Object.entries(shortcutsByCategory).map(([category, categoryShortcuts]) => (
                <div key={category} className="p-6 border-b border-white/5 last:border-b-0">
                  <h3 className="text-sm font-bold text-white/60 mb-4 tracking-wide uppercase">
                    {category}
                  </h3>
                  <div className="space-y-3">
                    {categoryShortcuts.map((shortcut, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">
                            {shortcut.label}
                          </div>
                          <div className="text-xs text-white/40 truncate">
                            {shortcut.description}
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <kbd className="inline-flex items-center px-2 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono text-white/80">
                            {formatKeyCombo(shortcut.key)}
                          </kbd>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/[0.02] border-t border-white/5">
              <div className="text-center text-xs text-white/30">
                Press <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-white/60 font-mono">Esc</kbd> to close
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};