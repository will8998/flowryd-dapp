"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Monitor, Bell, Layout, Save, Check } from 'lucide-react';

interface UserPreferences {
  id: string;
  userId: string;
  theme: 'dark' | 'light' | 'system';
  displayDensity: 'compact' | 'comfortable' | 'spacious';
  defaultView: string;
  notificationsEnabled: boolean;
  emailDigest: 'off' | 'daily' | 'weekly';
  updatedAt: string;
}

interface UserPreferencesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserPreferencesPanel: React.FC<UserPreferencesPanelProps> = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const fetchPreferences = useCallback(async () => {
    try {
      const response = await fetch('/api/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.data.preferences);
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchPreferences();
    }
  }, [isOpen, fetchPreferences]);

  const updatePreference = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!preferences) return;

    setSaving(true);
    setSaveStatus('saving');

    try {
      const response = await fetch('/api/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.data.preferences);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  }, [preferences]);

  const handleThemeChange = (theme: string) => {
    updatePreference({ theme: theme as 'dark' | 'light' | 'system' });
  };

  const handleDensityChange = (displayDensity: string) => {
    updatePreference({ displayDensity: displayDensity as 'compact' | 'comfortable' | 'spacious' });
  };

  const handleDefaultViewChange = (defaultView: string) => {
    updatePreference({ defaultView });
  };

  const handleNotificationsToggle = () => {
    updatePreference({ notificationsEnabled: !preferences?.notificationsEnabled });
  };

  const handleEmailDigestChange = (emailDigest: string) => {
    updatePreference({ emailDigest: emailDigest as 'off' | 'daily' | 'weekly' });
  };

  const SettingSection = ({ 
    icon: Icon, 
    title, 
    children 
  }: { 
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-white/60" />
        <h3 className="text-sm font-bold text-white/80">{title}</h3>
      </div>
      <div className="space-y-3 pl-7">
        {children}
      </div>
    </div>
  );

  const RadioGroup = ({ 
    label, 
    value, 
    options, 
    onChange 
  }: { 
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
  }) => (
    <div className="space-y-2">
      <label className="text-xs text-white/60">{label}</label>
      <div className="space-y-1">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`w-full flex items-center gap-3 p-2 rounded text-left transition-all ${
              value === option.value 
                ? 'bg-white/10 border border-white/20 text-white' 
                : 'hover:bg-white/5 text-white/60'
            }`}
          >
            <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
              value === option.value ? 'border-white' : 'border-white/30'
            }`}>
              {value === option.value && (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </div>
            <span className="text-xs">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const Toggle = ({ 
    label, 
    checked, 
    onChange 
  }: { 
    label: string;
    checked: boolean;
    onChange: () => void;
  }) => (
    <div className="flex items-center justify-between">
      <label className="text-xs text-white/60">{label}</label>
      <button
        onClick={onChange}
        className={`relative w-10 h-5 rounded-full transition-colors ${
          checked ? 'bg-white/20' : 'bg-white/10'
        }`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`} />
      </button>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-zinc-900 border-l border-white/10 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white">User Preferences</h2>
                {saveStatus === 'saving' && (
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </div>
                )}
                {saveStatus === 'saved' && (
                  <div className="flex items-center gap-1 text-xs text-green-400">
                    <Check className="w-3 h-3" />
                    Saved
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="text-xs text-red-400">
                    Save failed
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              ) : preferences ? (
                <>
                  <SettingSection icon={Monitor} title="Display">
                    <RadioGroup
                      label="Theme"
                      value={preferences.theme}
                      options={[
                        { value: 'dark', label: 'Dark' },
                        { value: 'light', label: 'Light' },
                        { value: 'system', label: 'System' },
                      ]}
                      onChange={handleThemeChange}
                    />
                    
                    <RadioGroup
                      label="Display Density"
                      value={preferences.displayDensity}
                      options={[
                        { value: 'compact', label: 'Compact' },
                        { value: 'comfortable', label: 'Comfortable' },
                        { value: 'spacious', label: 'Spacious' },
                      ]}
                      onChange={handleDensityChange}
                    />
                  </SettingSection>

                  <SettingSection icon={Bell} title="Notifications">
                    <Toggle
                      label="Enable notifications"
                      checked={preferences.notificationsEnabled}
                      onChange={handleNotificationsToggle}
                    />
                    
                    <RadioGroup
                      label="Email Digest"
                      value={preferences.emailDigest}
                      options={[
                        { value: 'off', label: 'Off' },
                        { value: 'daily', label: 'Daily' },
                        { value: 'weekly', label: 'Weekly' },
                      ]}
                      onChange={handleEmailDigestChange}
                    />
                  </SettingSection>

                  <SettingSection icon={Layout} title="Default View">
                    <RadioGroup
                      label="Default tab on login"
                      value={preferences.defaultView}
                      options={[
                        { value: 'intelligence', label: 'Intelligence' },
                        { value: 'discover', label: 'Discover' },
                        { value: 'workbench', label: 'Workbench' },
                        { value: 'deals', label: 'Deals' },
                        { value: 'marketplace', label: 'Marketplace' },
                      ]}
                      onChange={handleDefaultViewChange}
                    />
                  </SettingSection>
                </>
              ) : (
                <div className="text-center py-12 text-white/60">
                  Failed to load preferences
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};