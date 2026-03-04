"use client";

import { logger } from '@/lib/logger';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCantonAuth } from '@/lib/auth-context';
import { 
  Building2, 
  Shield, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  Globe,
  Mail,
  User,
  ArrowRight,
  Loader2,
  Search,
  Plus
} from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  roles: string[];
  contactEmail: string | null;
  contactName: string | null;
  verificationStatus: string;
}

const ROLE_OPTIONS = [
  'Custody', 'Liquidity', 'Compliance', 'Issuance', 'Oracle', 'Exchange', 
  'Wallet', 'Identity', 'Infrastructure', 'Data', 'Registry', 'Collateral', 
  'Legal', 'Banking', 'Stablecoins'
];

type Step = 'identity' | 'details' | 'confirmation';

export default function OnboardPage() {
  const { user, isConnected, partyId, isLoading } = useCantonAuth();
  const [currentStep, setCurrentStep] = useState<Step>('identity');
  const [matchingProfiles, setMatchingProfiles] = useState<Participant[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Participant | null>(null);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    description: string;
    website: string;
    contactEmail: string;
    contactName: string;
    roles: string[];
    isNewProfile: boolean;
    profileId: string;
  } | null>(null);

  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const searchMatchingProfiles = useCallback(async () => {
    if (!user?.orgId && !partyId) return;

    try {
      setSearching(true);
      const searchTerm = user?.orgId || partyId || '';
      const response = await fetch(`/api/participants?search=${encodeURIComponent(searchTerm)}&status=unclaimed`);
      
      if (response.ok) {
        const data = await response.json();
        setMatchingProfiles(data.data?.participants || []);
      }
    } catch (error) {
      console.error('Failed to search profiles:', error);
    } finally {
      setSearching(false);
    }
  }, [user?.orgId, partyId]);

  useEffect(() => {
    if (currentStep === 'identity' && (user || partyId)) {
      searchMatchingProfiles();
    }
  }, [currentStep, user, partyId, searchMatchingProfiles]);

  const handleClaimProfile = (profile: Participant) => {
    setSelectedProfile(profile);
    setCompanyName(profile.name);
    setDescription(profile.description || '');
    setWebsite(profile.website || '');
    setContactEmail(profile.contactEmail || '');
    setContactName(profile.contactName || '');
    setSelectedRoles(profile.roles || []);

    setCurrentStep('details');
  };

  const handleCreateNew = () => {
    setSelectedProfile(null);
    setCompanyName('');
    setDescription('');
    setWebsite('');
    setContactEmail('');
    setContactName('');
    setSelectedRoles([]);

    setCurrentStep('details');
  };

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleSubmit = async () => {
    if (!companyName.trim()) return;

    try {
      setSubmitting(true);
      
      let response;
      if (selectedProfile) {
        response = await fetch(`/api/participants/${selectedProfile.id}/claim`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: description.trim(),
            website: website.trim() || null,
            contactEmail: contactEmail.trim() || null,
            contactName: contactName.trim() || null
          })
        });
      } else {
        response = await fetch('/api/participants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: companyName.trim(),
            description: description.trim() || null,
            website: website.trim() || null,
            contactEmail: contactEmail.trim() || null,
            contactName: contactName.trim() || null,
            roles: selectedRoles
          })
        });
      }

      if (response.ok) {
        const data = await response.json();
        setSubmittedData({
          name: companyName,
          description,
          website,
          contactEmail,
          contactName,
          roles: selectedRoles,
          isNewProfile: !selectedProfile,
          profileId: data.data?.participant?.id || selectedProfile?.id
        });
        setCurrentStep('confirmation');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit application');
      }
    } catch (error) {
      logger.error('Submission error', { error });
      alert('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!isConnected && !partyId) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <div className="text-center text-white">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-white/60 mb-6">Please connect your Canton identity to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-white/10 border border-white/20 rounded-lg">
              <Building2 className="w-8 h-8 text-white/70" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Welcome to Flowryd</h1>
              <p className="text-white/60">Participant Onboarding</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
              currentStep === 'identity' 
                ? 'border-blue-500 bg-blue-500/20 text-white' 
                : 'border-green-500 bg-green-500/20 text-green-400'
            }`}>
              {currentStep !== 'identity' ? <CheckCircle className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              <span className="text-sm font-medium">1. Identity Check</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/40" />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
              currentStep === 'details' ? 'border-blue-500 bg-blue-500/20 text-white' : 
              currentStep === 'confirmation' ? 'border-green-500 bg-green-500/20 text-green-400' :
              'border-white/20 bg-white/5 text-white/40'
            }`}>
              {currentStep === 'confirmation' ? <CheckCircle className="w-4 h-4" /> : <User className="w-4 h-4" />}
              <span className="text-sm font-medium">2. Profile Details</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/40" />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
              currentStep === 'confirmation' ? 'border-blue-500 bg-blue-500/20 text-white' : 
              'border-white/20 bg-white/5 text-white/40'
            }`}>
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">3. Confirmation</span>
            </div>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-lg p-8">
          <AnimatePresence mode="wait">
            {currentStep === 'identity' && (
              <motion.div
                key="identity"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-4">Identity Check</h2>
                  <p className="text-white/60">
                    We&rsquo;re checking if there are any existing participant profiles that match your organization.
                  </p>
                </div>

                {searching ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Searching for matching profiles...</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {matchingProfiles.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Matching Profiles Found</h3>
                        <div className="grid gap-4 mb-6">
                          {matchingProfiles.map((profile) => (
                            <div 
                              key={profile.id}
                              className="border border-white/10 rounded-lg p-6 hover:border-white/20 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                                      <Building2 className="w-6 h-6 text-white/70" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold">{profile.name}</h4>
                                      {profile.description && (
                                        <p className="text-sm text-white/60 mt-1">{profile.description}</p>
                                      )}
                                    </div>
                                  </div>
                                  {profile.roles && profile.roles.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                      {profile.roles.slice(0, 5).map((role) => (
                                        <span 
                                          key={role}
                                          className="px-2 py-1 bg-white/10 rounded text-xs text-white/80"
                                        >
                                          {role}
                                        </span>
                                      ))}
                                      {profile.roles.length > 5 && (
                                        <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/80">
                                          +{profile.roles.length - 5} more
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleClaimProfile(profile)}
                                  className="flex items-center gap-2 px-4 py-2 border border-blue-500 hover:border-blue-400 text-blue-400 rounded transition-colors"
                                >
                                  <Shield className="w-4 h-4" />
                                  Claim This Profile
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-center">
                      <div className="border-t border-white/10 pt-6">
                        <button
                          onClick={handleCreateNew}
                          className="flex items-center gap-2 px-6 py-3 border border-white/20 hover:border-white/40 text-white rounded-lg transition-colors mx-auto"
                        >
                          <Plus className="w-4 h-4" />
                          Create New Profile
                        </button>
                        {matchingProfiles.length === 0 && (
                          <p className="text-white/60 text-sm mt-3">
                            No existing profiles found. You can create a new participant profile.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {currentStep === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-4">Profile Details</h2>
                  <p className="text-white/60">
                    {selectedProfile 
                      ? 'Review and update the profile information before claiming.'
                      : 'Fill out the details for your new participant profile.'
                    }
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Company Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      disabled={!!selectedProfile}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30 disabled:opacity-50"
                      placeholder="Enter company name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30 resize-none"
                      placeholder="Describe your organization and services"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Website
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Contact Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                          placeholder="contact@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Contact Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                        placeholder="Contact person name"
                      />
                    </div>
                  </div>

                  {!selectedProfile && (
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-4">
                        Roles <span className="text-red-400">*</span>
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {ROLE_OPTIONS.map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => handleRoleToggle(role)}
                            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                              selectedRoles.includes(role)
                                ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                                : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20'
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                      {selectedRoles.length === 0 && (
                        <p className="text-red-400 text-sm mt-2">Please select at least one role</p>
                      )}
                    </div>
                  )}

                  {selectedProfile && selectedProfile.roles && selectedProfile.roles.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-4">
                        Current Roles
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedProfile.roles.map((role) => (
                          <div
                            key={role}
                            className="px-3 py-2 rounded-lg border border-green-500/50 bg-green-500/10 text-green-400 text-sm font-medium text-center"
                          >
                            {role}
                          </div>
                        ))}
                      </div>
                      <p className="text-white/60 text-sm mt-2">
                        Roles can be updated by an admin after approval.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-6 border-t border-white/5">
                    <button
                      onClick={() => setCurrentStep('identity')}
                      className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || !companyName.trim() || (!selectedProfile && selectedRoles.length === 0)}
                      className="flex items-center gap-2 px-6 py-2 border border-blue-500 hover:border-blue-400 text-blue-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 justify-center"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {selectedProfile ? 'Submitting Claim...' : 'Submitting Application...'}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          {selectedProfile ? 'Submit Claim' : 'Submit Application'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'confirmation' && submittedData && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-500/20 border border-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Application Submitted</h2>
                  <p className="text-white/60">
                    Your {submittedData.isNewProfile ? 'application' : 'claim'} has been submitted for review.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold mb-4">Application Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Company Name:</span>
                      <span className="font-medium">{submittedData.name}</span>
                    </div>
                    {submittedData.description && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Description:</span>
                        <span className="font-medium text-right max-w-xs">{submittedData.description}</span>
                      </div>
                    )}
                    {submittedData.website && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Website:</span>
                        <span className="font-medium">{submittedData.website}</span>
                      </div>
                    )}
                    {submittedData.contactEmail && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Contact Email:</span>
                        <span className="font-medium">{submittedData.contactEmail}</span>
                      </div>
                    )}
                    {submittedData.contactName && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Contact Name:</span>
                        <span className="font-medium">{submittedData.contactName}</span>
                      </div>
                    )}
                    {submittedData.roles && submittedData.roles.length > 0 && (
                      <div>
                        <span className="text-white/60">Roles:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {submittedData.roles.map((role: string) => (
                            <span 
                              key={role}
                              className="px-2 py-1 bg-blue-500/20 border border-blue-500 text-blue-400 rounded text-sm"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-8">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-yellow-400 font-medium mb-1">Pending Review</p>
                      <p className="text-white/80 text-sm">
                        Your application is now in the review queue. An admin will review and either approve or request changes. 
                        You&rsquo;ll be notified once there&rsquo;s an update.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => window.location.href = '/'}
                    className="flex items-center gap-2 px-6 py-3 border border-white/20 hover:border-white/40 text-white rounded-lg transition-colors mx-auto"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Back to Dashboard
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}