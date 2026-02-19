"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ArrowRight, ArrowLeft, Zap, Building, User, Mail, type LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface FormData {
  orgName: string;
  partyId: string;
  displayName: string;
  email: string;
}

function InputField({ icon: Icon, placeholder, value, onChange, type = 'text', required = false }: {
  icon: LucideIcon;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="relative group">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-white/5 group-hover:ring-blue-500/20 group-focus-within:ring-blue-500/30 transition-all duration-500 group-focus-within:border-white/20">
        <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        
        <div className="relative flex items-center">
          <div className="absolute left-6 text-white/30 group-focus-within:text-blue-400 transition-all duration-300">
            <Icon className="w-5 h-5" />
          </div>
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent border-none py-4 pl-14 pr-6 text-sm text-white placeholder:text-white/30 focus:outline-none selection:bg-blue-500/30"
            required={required}
          />
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    orgName: '',
    partyId: '',
    displayName: '',
    email: '',
  });

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedStep1 = formData.orgName.trim() && formData.partyId.trim();
  const canProceedStep2 = formData.displayName.trim();

  const handleSubmit = async () => {
    if (currentStep < 3) {
      nextStep();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyId: formData.partyId,
          displayName: formData.displayName,
          orgName: formData.orgName,
          email: formData.email || undefined,
        }),
      });

      if (response.ok) {
        window.location.href = '/';
      } else {
        const data = await response.json();
        const err = data.error;
        if (response.status === 409) {
          setError(err?.message || 'Party-ID already registered');
        } else if (err?.code === 'VALIDATION_ERROR') {
          const detail = Array.isArray(err.details)
            ? err.details[0]?.message
            : typeof err.details === 'object' && err.details !== null
              ? Object.values(err.details)[0]
              : null;
          setError(detail || err?.message || 'Invalid registration data');
        } else {
          setError(err?.message || 'Registration failed');
        }
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const stepIndicators = [1, 2, 3].map((step) => (
    <div
      key={step}
      className={`w-3 h-3 rounded-full transition-all duration-500 backdrop-blur-sm border shadow-lg ${
        step === currentStep
          ? 'bg-blue-500 border-blue-400/50 ring-2 ring-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.5)]'
          : step < currentStep
          ? 'bg-blue-500/70 border-blue-400/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
          : 'bg-white/10 border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.3)]'
      }`}
    />
  ));

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
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-none">
          Join <span className="text-blue-600">Flowryd</span>
        </h1>
        <p className="text-lg text-white/40 max-w-sm mx-auto leading-relaxed">
          Register your organization to start orchestrating multi-party workflows.
        </p>
      </div>

      <div className="flex justify-center gap-3 mb-8">
        {stepIndicators}
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold mb-6">Organization Details</h2>
              
              <InputField
                icon={Building}
                placeholder="Organization Name"
                value={formData.orgName}
                onChange={(value) => updateFormData('orgName', value)}
                required
              />
              
              <InputField
                icon={Terminal}
                placeholder="Canton Party-ID (e.g. orgname::identifier)"
                value={formData.partyId}
                onChange={(value) => updateFormData('partyId', value)}
                required
              />
              
              <p className="text-xs text-white/30 mt-2">
                Format: orgname::identifier
              </p>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold mb-6">Your Profile</h2>
              
              <InputField
                icon={User}
                placeholder="Display Name"
                value={formData.displayName}
                onChange={(value) => updateFormData('displayName', value)}
                required
              />
              
              <InputField
                icon={Mail}
                placeholder="Email (optional)"
                value={formData.email}
                onChange={(value) => updateFormData('email', value)}
                type="email"
              />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold mb-6">Confirm Details</h2>
              
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[20px] p-6 space-y-4 text-left shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                
                <div className="relative z-10">
                  <p className="text-white/50 text-xs tracking-wide">Organization</p>
                  <p className="text-white font-medium">{formData.orgName}</p>
                </div>
                <div className="relative z-10">
                  <p className="text-white/50 text-xs tracking-wide">Party-ID</p>
                  <p className="text-white font-medium font-mono text-sm break-all">{formData.partyId}</p>
                </div>
                <div className="relative z-10">
                  <p className="text-white/50 text-xs tracking-wide">Display Name</p>
                  <p className="text-white font-medium">{formData.displayName}</p>
                </div>
                {formData.email && (
                  <div className="relative z-10">
                    <p className="text-white/50 text-xs tracking-wide">Email</p>
                    <p className="text-white font-medium">{formData.email}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-4">
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 text-white py-4 px-6 rounded-[20px] flex items-center justify-center gap-2 transition-all duration-300 hover:bg-white/10 hover:border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          
          <button
            onClick={handleSubmit}
            disabled={
              (currentStep === 1 && !canProceedStep1) ||
              (currentStep === 2 && !canProceedStep2) ||
              isLoading
            }
            className="flex-1 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl border border-white/20 text-black py-4 px-6 rounded-[20px] flex items-center justify-center gap-2 font-medium transition-all duration-300 disabled:opacity-20 disabled:hover:from-white/90 disabled:scale-100 hover:from-white hover:to-white/90 hover:scale-105 hover:shadow-[0_8px_32px_rgba(255,255,255,0.3),inset_0_1px_0_rgba(255,255,255,0.4)] shadow-[0_8px_32px_rgba(255,255,255,0.2),inset_0_1px_0_rgba(255,255,255,0.3)]"
          >
            {isLoading ? (
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1 }} 
                className="w-5 h-5 border-2 border-black border-t-transparent rounded-full" 
              />
            ) : currentStep === 3 ? (
              <>
                <span className="whitespace-nowrap">Connect to Flowryd</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="text-center pt-8">
        <Link href="/login" className="text-sm text-white/40 hover:text-white/60 transition-colors">
          Already have an account? Login →
        </Link>
      </div>
    </motion.div>
  );
}