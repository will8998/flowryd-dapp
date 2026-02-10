import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Building2, Database, ShieldCheck, Coins, Server, X, LayoutGrid, Star, ChevronRight, Plus, Wallet } from 'lucide-react';
import { Participant } from '@/lib/canton-data';

interface ZapierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (participant: Participant) => void;
  participants: Participant[];
  existingParticipantIds: string[];
}

// Map UI categories to underlying capabilities
const CATEGORY_MAPPING: Record<string, string[]> = {
  infrastructure: ['Registry', 'Settlement', 'Infrastructure'],
  data_identity: ['Data_Oracle', 'Identity_Provider', 'Valuation_Pricing', 'Compliance_Provider', 'Legal_Compliance'],
  custody: ['Custody', 'Wallet', 'Collateral_Agent', 'Staking'],
  liquidity: ['Exchange', 'Liquidity_Provider', 'Market_Maker', 'Collateral_Taker'],
  financing: ['Cash_Lender', 'Cash_Borrower', 'Repo_Platform', 'Collateral_Provider'],
  issuance: ['Issuer', 'Payment_Stablecoin']
};

const CATEGORIES = [
  { id: 'all', name: 'All Apps', icon: LayoutGrid },
  { id: 'infrastructure', name: 'Infrastructure', icon: Server },
  { id: 'data_identity', name: 'Data & Identity', icon: Database },
  { id: 'custody', name: 'Custody', icon: ShieldCheck },
  { id: 'liquidity', name: 'Liquidity', icon: Coins },
  { id: 'financing', name: 'Financing', icon: Building2 },
  { id: 'issuance', name: 'Issuance', icon: Wallet },
];

// Helper to get capabilities for a participant
const getParticipantCaps = (p: Participant): string[] => {
  return Object.keys(p.capabilities).filter(k => p.capabilities[k] === 1);
};

export const ZapierAddModal: React.FC<ZapierModalProps> = ({ isOpen, onClose, onSelect, participants, existingParticipantIds }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Filter logic
  const filteredParticipants = participants.filter(p => {
    const caps = getParticipantCaps(p);
    
    // Search matches name, role label, or specific capability keys
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.cantonRole.toLowerCase().includes(search.toLowerCase()) ||
      caps.some(c => c.toLowerCase().includes(search.toLowerCase().replace(' ', '_'))); // Handle "Cash Lender" -> "Cash_Lender"

    const notAdded = !existingParticipantIds.includes(p.id);
    
    let matchesCategory = true;
    if (activeCategory !== 'all') {
      const targetCaps = CATEGORY_MAPPING[activeCategory];
      matchesCategory = caps.some(c => targetCaps.includes(c));
    }

    return matchesSearch && notAdded && matchesCategory;
  });

  // Get top apps (simulated by criticality/fame)
  const topApps = participants.filter(p => p.criticality === 'CRITICAL' && !existingParticipantIds.includes(p.id)).slice(0, 6);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#18181b] w-full max-w-5xl h-[80vh] rounded-xl border border-white/10 shadow-2xl flex overflow-hidden font-sans"
      >
        {/* Left Sidebar - Categories */}
        <div className="w-64 border-r border-white/10 bg-[#111] flex flex-col">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-500" />
              Add Participant
            </h2>
          </div>
          <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === cat.id 
                      ? 'bg-white/10 text-white' 
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-white/10">
            <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-xs font-bold uppercase">Pro Tip</span>
              </div>
              <p className="text-xs text-blue-200/70 leading-relaxed">
                Search by specific role like &quot;Lender&quot; or &quot;Custodian&quot; to find matches quickly.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-[#0a0a0a]">
          {/* Search Header */}
          <div className="p-6 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-white/40" />
              <input 
                autoFocus
                type="text"
                placeholder="Search participants (e.g., 'Lender', 'Coinbase')..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-base"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {/* Top Apps Section (Only show on 'all' and empty search) */}
            {activeCategory === 'all' && search === '' && (
              <div className="mb-10">
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">Most Popular</h3>
                <div className="grid grid-cols-2 gap-4">
                  {topApps.map(p => (
                    <ParticipantRow 
                      key={p.id} 
                      participant={p} 
                      onSelect={() => onSelect(p)} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Main Grid */}
            <div>
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">
                {search ? 'Search Results' : `${CATEGORIES.find(c => c.id === activeCategory)?.name}`}
              </h3>
              
              {filteredParticipants.length === 0 ? (
                <div className="text-center py-20 text-white/30">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No participants found matching {search}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredParticipants.map(p => (
                    <ParticipantCard 
                      key={p.id} 
                      participant={p} 
                      onSelect={() => onSelect(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </motion.div>
    </div>
  );
};

// Smaller List Row for "Popular"
const ParticipantRow = ({ participant, onSelect }: { participant: Participant, onSelect: () => void }) => {
  const roleColor = getRoleColor(participant.cantonRole);
  const capabilities = getParticipantCaps(participant).slice(0, 2); // Show max 2
  
  return (
    <button 
      onClick={onSelect}
      className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group text-left w-full"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border bg-[#111] group-hover:scale-110 transition-transform ${roleColor}`}>
        <Building2 className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">{participant.name}</h4>
        <p className="text-xs text-white/40 truncate">{participant.cantonRole}</p>
        
        {/* Capability Tags for Row */}
        <div className="flex flex-wrap gap-1 mt-1.5">
          {capabilities.map(cap => (
            <span key={cap} className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] text-white/60 whitespace-nowrap">
              {cap.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-white/20 ml-auto group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0" />
    </button>
  );
};

// Larger Card for Main Grid
const ParticipantCard = ({ participant, onSelect }: { participant: Participant, onSelect: () => void }) => {
  const roleColor = getRoleColor(participant.cantonRole);
  const capabilities = getParticipantCaps(participant).slice(0, 3); // Top 3 caps

  return (
    <button 
      onClick={onSelect}
      className="flex flex-col p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-white/[0.08] transition-all text-left group h-full"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border bg-[#111] ${roleColor}`}>
          <Building2 className="w-5 h-5" />
        </div>
        {participant.criticality === 'CRITICAL' && (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            TOP TIER
          </span>
        )}
      </div>
      
      <h4 className="text-sm font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{participant.name}</h4>
      <p className="text-xs text-white/50 mb-3 line-clamp-2 min-h-[2.5em]">{participant.description || participant.cantonRole}</p>

      {/* Capability Tags - Increased visibility */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {capabilities.map(cap => (
          <span key={cap} className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-medium text-white/70 border border-white/5 hover:bg-white/20 transition-colors">
            {cap.replace(/_/g, ' ')}
          </span>
        ))}
      </div>
      
      <div className="mt-auto pt-3 border-t border-white/5 flex items-center gap-3 text-[10px] text-white/40">
        <span className="flex items-center gap-1">
          <Database className="w-3 h-3" /> {participant.holdings || 'N/A'}
        </span>
        {participant.validatorNodes && participant.validatorNodes > 0 && (
          <span className="flex items-center gap-1 text-green-400/70">
            <ShieldCheck className="w-3 h-3" /> Validator
          </span>
        )}
      </div>
    </button>
  );
};

// Helper for icons
const getRoleColor = (role: string) => {
  const r = role.toLowerCase();
  if (r.includes('registry')) return 'border-blue-500/30 text-blue-400';
  if (r.includes('financing') || r.includes('liquidity')) return 'border-green-500/30 text-green-400';
  if (r.includes('custody')) return 'border-orange-500/30 text-orange-400';
  return 'border-gray-500/30 text-gray-400';
};
