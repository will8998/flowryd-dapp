"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [partyIdInput, setPartyIdInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyIdInput) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partyId: partyIdInput }),
      });

      if (response.ok) {
        window.location.href = '/';
      } else {
        const data = await response.json();
        const err = data.error;
        if (err?.code === 'USER_NOT_FOUND') {
          setError('No account found');
        } else if (err?.code === 'VALIDATION_ERROR') {
          const detail = Array.isArray(err.details)
            ? err.details[0]?.message
            : typeof err.details === 'object' && err.details !== null
              ? Object.values(err.details)[0]
              : null;
          setError(detail || err?.message || 'Invalid Party ID format');
        } else {
          setError(err?.message || 'An error occurred');
        }
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="space-y-12 text-center"
    >
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold tracking-wide text-white/40">
          <Zap className="w-3 h-3 text-blue-500" /> Canton Network
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none">
          Flowryd <span className="text-blue-600">OS</span>
        </h1>
        <p className="text-lg text-white/40 max-w-sm mx-auto leading-relaxed">
          The orchestration layer for institutional multi-party workflows.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-2 rounded-[32px] shadow-2xl ring-1 ring-white/5 group hover:ring-blue-500/30 transition-all duration-500">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <div className="absolute left-6 text-white/20 group-focus-within:text-blue-500 transition-colors">
              <Terminal className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              value={partyIdInput}
              onChange={(e) => setPartyIdInput(e.target.value)}
              placeholder="Enter Party ID (e.g. texture::1234)" 
              className="w-full bg-transparent border-none py-6 pl-14 pr-20 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-0"
              autoFocus
            />
            <div className="absolute right-2">
              <button 
                type="submit"
                disabled={!partyIdInput || isLoading}
                className="w-12 h-12 bg-white text-black rounded-[20px] flex items-center justify-center hover:bg-blue-50 hover:scale-105 transition-all disabled:opacity-20 disabled:scale-100 disabled:hover:bg-white"
              >
                {isLoading ? (
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1 }} 
                    className="w-5 h-5 border-2 border-black border-t-transparent rounded-full" 
                  />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-400 text-sm"
            >
              {error}
              {error === 'No account found' && (
                <div className="mt-2">
                  <Link href="/register" className="text-blue-400 hover:text-blue-300 underline">
                    Register your organization →
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-12 pt-8 opacity-30">
        <div className="text-center space-y-1">
          <p className="text-xl font-bold">25K+</p>
          <p className="text-[9px] tracking-wide font-bold">Parties</p>
        </div>
        <div className="text-center space-y-1">
          <p className="text-xl font-bold">$6T</p>
          <p className="text-[9px] tracking-wide font-bold">Volume</p>
        </div>
        <div className="text-center space-y-1">
          <p className="text-xl font-bold">99.9%</p>
          <p className="text-[9px] tracking-wide font-bold">Uptime</p>
        </div>
      </div>

      <div className="text-center">
        <Link href="/register" className="text-sm text-white/40 hover:text-white/60 transition-colors">
          New to Flowryd? Register your organization →
        </Link>
      </div>
    </motion.div>
  );
}