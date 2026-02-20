"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, BookOpen, FileText, Mail, Shield, ArrowUpRight } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const shortcuts = [
    { keys: ['⌘K'], description: 'Open Command Palette' },
    { keys: ['Esc'], description: 'Close modal / panel' },
    { keys: ['⌘S'], description: 'Save current flow' },
    { keys: ['↑', '↓'], description: 'Navigate command list' },
    { keys: ['↵'], description: 'Select command' },
  ];

  const quickLinks = [
    { label: 'Documentation', url: 'https://flowryd.com/docs', icon: BookOpen },
    { label: 'Changelog', url: 'https://flowryd.com/changelog', icon: FileText },
    { label: 'Contact Support', url: 'mailto:support@flowryd.com', icon: Mail },
    { label: 'Privacy Policy', url: '/privacy', icon: Shield },
  ];

  const platformInfo = [
    { label: 'Version', value: 'Flowryd v1.2' },
    { label: 'Platform', value: 'Canton Network' },
    { label: 'Status', value: 'Connected', hasStatusDot: true },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <motion.div
              className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-[20px] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-white/60" />
                  <span className="text-sm font-bold text-white">Help</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>

              <div className="p-5 space-y-6 max-h-[60vh] overflow-y-auto">
                <div>
                  <h3 className="text-[9px] font-bold text-white/20 tracking-widest uppercase mb-3">
                    Keyboard Shortcuts
                  </h3>
                  <div className="space-y-0">
                    {shortcuts.map((shortcut, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, keyIndex) => (
                            <React.Fragment key={keyIndex}>
                              {keyIndex > 0 && <span className="text-white/30 text-xs mx-1">+</span>}
                              <kbd className="bg-white/[0.08] border border-white/[0.12] rounded-md px-2 py-1 text-[10px] font-mono text-white/60 inline-flex items-center gap-1">
                                {key}
                              </kbd>
                            </React.Fragment>
                          ))}
                        </div>
                        <span className="text-xs text-white/50">{shortcut.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[9px] font-bold text-white/20 tracking-widest uppercase mb-3">
                    Resources
                  </h3>
                  <div className="space-y-1">
                    {quickLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors">
                          <link.icon className="w-4 h-4 text-white/40" />
                        </div>
                        <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors">
                          {link.label}
                        </span>
                        <ArrowUpRight className="w-3 h-3 text-white/20 ml-auto" />
                      </a>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[9px] font-bold text-white/20 tracking-widest uppercase mb-3">
                    About
                  </h3>
                  <div className="space-y-0">
                    {platformInfo.map((info, index) => (
                      <div key={index} className="flex items-center justify-between py-2 text-xs">
                        <span className="text-white/30">{info.label}</span>
                        <div className="flex items-center gap-2">
                          {info.hasStatusDot && (
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          )}
                          <span className="text-white/60 font-mono">{info.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-white/[0.06]">
                <p className="text-[9px] text-white/15 text-center">
                  © 2026 Gravity Core LLC
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};