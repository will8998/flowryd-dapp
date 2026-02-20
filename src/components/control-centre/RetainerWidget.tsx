"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronDown, 
  ArrowUpRight, 
  Sparkles, 
  Check 
} from 'lucide-react';

export const RetainerWidget: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    const dismissedTimestamp = localStorage.getItem('flowryd_retainer_dismissed');
    
    if (dismissedTimestamp) {
      const dismissedDate = new Date(dismissedTimestamp);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      if (dismissedDate > sevenDaysAgo) {
        return;
      }
    }
    
    setVisible(true);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('flowryd_retainer_dismissed', new Date().toISOString());
    setVisible(false);
  };

  const handleMinimize = () => {
    setMinimized(!minimized);
  };

  const handleBookCall = () => {
    window.open('https://flowryd.typeform.com/to/gESTfumm', '_blank');
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 20, scale: 0.95 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25
        }}
        className={`fixed bottom-24 right-6 z-40 ${minimized ? '' : 'w-80'}`}
      >
        {minimized ? (
          <div
            onClick={handleMinimize}
            className="px-4 py-2 bg-[#0a0a0a] border border-white/10 rounded cursor-pointer hover:bg-[#111] transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-white/60" />
            <span className="text-xs font-bold text-white">Retainer</span>
          </div>
        ) : (
          <div className="bg-black/30 border border-white/10 rounded shadow-2xl shadow-black/50 overflow-hidden">
            <div className="h-px bg-white/20" />
            
            <div className="p-4 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Flowryd Retainer</h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleMinimize}
                  className="p-1 hover:bg-white/10 rounded-md transition-colors"
                >
                  <ChevronDown className="w-4 h-4 text-white/60" />
                </button>
                <button
                  onClick={handleDismiss}
                  className="p-1 hover:bg-white/10 rounded-md transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>
            </div>
            
            <div className="px-4 pb-4 space-y-4">
              <p className="text-xs text-white/50 leading-relaxed">
                Get dedicated Canton Network integration support with a Flowryd Retainer.
              </p>
              
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-xs text-white/40">
                  <Check className="w-3 h-3 text-white/40 mt-0.5 flex-shrink-0" />
                  Priority workflow design assistance
                </li>
                <li className="flex items-start gap-2 text-xs text-white/40">
                  <Check className="w-3 h-3 text-white/40 mt-0.5 flex-shrink-0" />
                  Dedicated integration engineer
                </li>
                <li className="flex items-start gap-2 text-xs text-white/40">
                  <Check className="w-3 h-3 text-white/40 mt-0.5 flex-shrink-0" />
                  Custom app stack development
                </li>
              </ul>
              
              <button
                onClick={handleBookCall}
                className="w-full py-3 border border-white/30 text-white rounded font-bold text-xs tracking-wide hover:border-white/50 transition-all flex items-center justify-center gap-2"
              >
                Book a Call
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};