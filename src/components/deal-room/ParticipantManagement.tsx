"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, X, ChevronDown, Circle } from 'lucide-react';
import { templateParticipants } from '@/lib/canton-templates-data';

interface DealParticipant {
  id: string;
  userId: string;
  role: string | null;
  joinedAt: string | null;
  displayName: string | null;
  partyId: string | null;
}

interface ParticipantManagementProps {
  participants: DealParticipant[];
  dealId: string;
  onUpdate: () => void;
  currentUserRole: string | null;
}

const ROLES = [
  { value: 'admin', label: 'Admin', color: 'text-red-400', bgColor: 'bg-red-500/20' },
  { value: 'editor', label: 'Editor', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  { value: 'viewer', label: 'Viewer', color: 'text-green-400', bgColor: 'bg-green-500/20' },
  { value: 'custody', label: 'Custody Role', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  { value: 'settlement', label: 'Settlement Rail', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  { value: 'registry', label: 'Registry Role', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
  { value: 'issuer', label: 'Issuer Role', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
];

export default function ParticipantManagement({ 
  participants, 
  dealId, 
  onUpdate, 
  currentUserRole 
}: ParticipantManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [newUserRole, setNewUserRole] = useState('viewer');
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const canManageParticipants = currentUserRole === 'admin';

  const handleAddParticipant = async () => {
    if (!newUserId.trim() || !canManageParticipants) return;

    setIsAdding(true);
    try {
      const res = await fetch(`/api/deals/${dealId}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: newUserId.trim(), role: newUserRole }),
      });

      if (res.ok) {
        setNewUserId('');
        setNewUserRole('viewer');
        setShowAddForm(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to add participant:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveParticipant = async (userId: string) => {
    if (!canManageParticipants) return;

    setRemovingId(userId);
    try {
      const res = await fetch(`/api/deals/${dealId}/participants`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to remove participant:', error);
    } finally {
      setRemovingId(null);
    }
  };

  const getRoleColor = (role: string | null) => {
    const roleConfig = ROLES.find(r => r.value === role || r.label.toLowerCase().includes(role?.toLowerCase() || ''));
    return roleConfig?.color || 'text-white/30';
  };

  const getRoleBgColor = (role: string | null) => {
    const roleConfig = ROLES.find(r => r.value === role || r.label.toLowerCase().includes(role?.toLowerCase() || ''));
    return roleConfig?.bgColor || 'bg-white/5';
  };

  const getParticipantOrganization = (participant: DealParticipant) => {
    // Try to find organization from templateParticipants data
    const orgData = templateParticipants.find(tp => 
      tp.participantId === participant.partyId || 
      tp.organization.toLowerCase().includes((participant.displayName || '').toLowerCase())
    );
    return orgData?.organization || null;
  };

  const isParticipantOnline = (_participant: DealParticipant) => {
    // Placeholder for online status - in real app this would check active_sessions
    return Math.random() > 0.3; // Random for demo
  };

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2.5">
        <Users className="w-3 h-3 text-white/30" />
        <span className="text-[9px] font-bold tracking-wide text-white/30">
          PARTICIPANTS
        </span>
        <span className="text-[8px] text-white/20 ml-auto">{participants.length}</span>
        {canManageParticipants && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-4 h-4 rounded bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/10 transition-all ml-1"
          >
            <Plus className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showAddForm && canManageParticipants && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 p-2.5 bg-white/[0.02] border border-white/5 rounded"
          >
            <div className="space-y-2">
              <div>
                <label className="text-[8px] font-mono text-white/30 tracking-wide block mb-1">
                  USER ID / PARTY ID
                </label>
                <input
                  type="text"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  placeholder="Enter user or party ID"
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-[11px] text-white/70 placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[8px] font-mono text-white/30 tracking-wide block mb-1">
                  ROLE
                </label>
                <div className="relative">
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-[11px] text-white/70 focus:border-white/30 focus:outline-none appearance-none"
                  >
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value} className="bg-[#0a0a0a]">
                        {role.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleAddParticipant}
                  disabled={isAdding || !newUserId.trim()}
                  className="flex-1 px-2 py-1 text-[9px] font-bold text-white/80 bg-white/10 rounded hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
                >
                  {isAdding ? 'ADDING...' : 'ADD'}
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-2 py-1 text-[9px] font-bold text-white/40 border border-white/10 rounded hover:bg-white/5 transition-colors tracking-wide"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-1.5">
        {participants.map((participant) => {
          const organization = getParticipantOrganization(participant);
          const isOnline = isParticipantOnline(participant);
          const avatar = (participant.displayName || participant.partyId || participant.userId || 'U')[0].toUpperCase();

          return (
            <div
              key={participant.id}
              className="relative group"
            >
              <div className="flex items-center gap-2.5 py-2 px-2.5 rounded-md hover:bg-white/[0.03] transition-colors">
                {/* Avatar with Status Indicator */}
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-white/70">
                      {avatar}
                    </span>
                  </div>
                  {/* Online Status Dot */}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#050505] flex items-center justify-center ${
                    isOnline ? 'bg-green-500' : 'bg-white/20'
                  }`}>
                    <Circle className={`w-1.5 h-1.5 fill-current ${
                      isOnline ? 'text-green-500' : 'text-white/40'
                    }`} />
                  </div>
                </div>
                
                {/* Participant Info */}
                <div className="min-w-0 flex-1">
                  {/* Name */}
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[12px] font-semibold text-white/80 truncate">
                      {participant.displayName || 'Unknown'}
                    </p>
                    {isOnline && (
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    )}
                  </div>

                  {/* Organization */}
                  {organization && (
                    <p className="text-[9px] text-white/50 truncate mb-0.5">
                      {organization}
                    </p>
                  )}

                  {/* Party ID */}
                  {participant.partyId && (
                    <p className="text-[8px] text-white/30 font-mono truncate mb-1">
                      {participant.partyId}
                    </p>
                  )}

                  {/* Role Badge */}
                  {participant.role && (
                    <div className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[7px] font-bold tracking-wide ${
                      getRoleBgColor(participant.role)} ${getRoleColor(participant.role)}
                    }`}>
                      {participant.role.toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col items-end gap-1">
                  {/* Online Status Text */}
                  <span className={`text-[8px] font-mono ${
                    isOnline ? 'text-green-400' : 'text-white/25'
                  }`}>
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                  </span>

                  {/* Remove Button */}
                  {canManageParticipants && (
                    <button
                      onClick={() => handleRemoveParticipant(participant.userId)}
                      disabled={removingId === participant.userId}
                      className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 transition-all shrink-0 disabled:opacity-50"
                    >
                      {removingId === participant.userId ? (
                        <div className="w-2.5 h-2.5 border border-white/20 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {participants.length === 0 && (
          <div className="text-center py-4">
            <div className="w-8 h-8 rounded bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto mb-2">
              <Users className="w-3.5 h-3.5 text-white/20" />
            </div>
            <p className="text-[10px] text-white/30">No participants</p>
          </div>
        )}
      </div>
    </div>
  );
}