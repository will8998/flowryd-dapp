"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Globe, 
  Layers, 
  MessageSquare, 
  Users, 
  Shield, 
  Plus, 
  Terminal, 
  Bell, 
  HelpCircle,
  ArrowRight,
  FileText,
  Workflow,
  Building2,
  Brain
} from 'lucide-react';
import { authFetch } from '@/lib/auth-fetch';
import { participants, type Participant } from '@/lib/canton-data';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  activeTier: string;
  onTierChange: (tier: string) => void;
  userRole?: string;
}

interface BaseCommand {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
  action: () => void;
  subtitle?: string;
  badge?: string;
}

interface Deal {
  id: string;
  title: string;
  description?: string;
  status: string;
  createdAt: string;
}

interface Flow {
  id: string;
  title: string;
  description?: string;
  workflowType?: string;
  creatorDisplayName?: string;
}

type SearchResult = BaseCommand | Deal | Participant | Flow;

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  isOpen, 
  onClose, 
  activeTier: _activeTier, 
  onTierChange, 
  userRole 
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const debouncedQuery = useDebounce(query, 200);

  const navigationCommands: BaseCommand[] = useMemo(() => {
    const commands: BaseCommand[] = [
      {
        id: 'nav-intelligence',
        label: 'Intelligence',
        subtitle: 'Network analytics and insights',
        icon: Brain,
        group: 'Navigation',
        action: () => {
          onTierChange('INTEL');
          onClose();
        }
      },
      {
        id: 'nav-discover',
        label: 'Discover Network',
        subtitle: 'Explore Canton participants and relationships',
        icon: Globe,
        group: 'Navigation',
        action: () => {
          onTierChange('DISCOVER');
          onClose();
        }
      },
      {
        id: 'nav-navigate',
        label: 'Navigate Pathways',
        subtitle: 'Build and design workflows',
        icon: Layers,
        group: 'Navigation',
        action: () => {
          onTierChange('NAVIGATE');
          onClose();
        }
      },
      {
        id: 'nav-jumpcuts',
        label: 'JumpCuts',
        subtitle: 'Quick workflow templates',
        icon: Workflow,
        group: 'Navigation',
        action: () => {
          onTierChange('NAVIGATE');
          onClose();
        }
      },
      {
        id: 'nav-activate',
        label: 'Activate Engine',
        subtitle: 'Manage and execute deals',
        icon: MessageSquare,
        group: 'Navigation',
        action: () => {
          onTierChange('ACTIVATE');
          onClose();
        }
      },
      {
        id: 'nav-marketplace',
        label: 'Marketplace',
        subtitle: 'Join collective workflows',
        icon: Users,
        group: 'Navigation',
        action: () => {
          onTierChange('JOIN');
          onClose();
        }
      },
      {
        id: 'action-new-flow',
        label: 'Create New Flow',
        subtitle: 'Start building a new workflow',
        icon: Plus,
        group: 'Actions',
        action: () => {
          onTierChange('NAVIGATE');
          onClose();
        }
      },
      {
        id: 'action-new-deal',
        label: 'Create New Deal',
        subtitle: 'Start a new transaction',
        icon: Plus,
        group: 'Actions',
        action: () => {
          window.location.href = '/deals/new';
        }
      },
      {
        id: 'action-toggle-ai',
        label: 'Toggle Ryd AI',
        subtitle: 'Open AI assistant terminal',
        icon: Terminal,
        group: 'Actions',
        action: () => {
          window.dispatchEvent(new Event('toggle-ryd-ai'));
          onClose();
        }
      },
      {
        id: 'action-notifications',
        label: 'Open Notifications',
        subtitle: 'View recent activity',
        icon: Bell,
        group: 'Actions',
        action: () => {
          onClose();
        }
      },
      {
        id: 'action-help',
        label: 'Open Help',
        subtitle: 'Get support and documentation',
        icon: HelpCircle,
        group: 'Actions',
        action: () => {
          onClose();
        }
      }
    ];

    if (userRole === 'admin') {
      commands.splice(-5, 0, {
        id: 'nav-admin',
        label: 'Administration',
        subtitle: 'Manage system settings and users',
        icon: Shield,
        group: 'Navigation',
        action: () => {
          onTierChange('ADMIN');
          onClose();
        }
      });
    }

    return commands;
  }, [userRole, onTierChange, onClose]);

  // Fetch deals and flows when query changes
  useEffect(() => {
    const fetchData = async () => {
      if (!debouncedQuery.trim()) {
        setDeals([]);
        setFlows([]);
        return;
      }

      setIsLoading(true);
      try {
        const [dealsRes, flowsRes] = await Promise.all([
          authFetch('/api/deals?limit=5'),
          authFetch('/api/flows/public')
        ]);

        if (dealsRes.ok) {
          const dealsData = await dealsRes.json();
          setDeals(dealsData.data || []);
        }

        if (flowsRes.ok) {
          const flowsData = await flowsRes.json();
          setFlows(flowsData.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [debouncedQuery]);

  // Filter and group search results
  const searchResults = useMemo(() => {
    const queryLower = query.toLowerCase().trim();
    const results: Record<string, SearchResult[]> = {};
    
    if (!queryLower) {
      // Show quick actions when empty
      results['Quick Actions'] = navigationCommands.slice(0, 6);
      return results;
    }

    // Filter navigation commands
    const filteredNavigation = navigationCommands.filter(cmd => 
      cmd.label.toLowerCase().includes(queryLower) || 
      cmd.subtitle?.toLowerCase().includes(queryLower)
    );
    if (filteredNavigation.length > 0) {
      results['Navigation'] = filteredNavigation.slice(0, 5);
    }

    // Filter deals
    const filteredDeals = deals.filter(deal => 
      deal.title.toLowerCase().includes(queryLower) ||
      deal.description?.toLowerCase().includes(queryLower)
    );
    if (filteredDeals.length > 0) {
      results['Deals'] = filteredDeals.slice(0, 5);
    }

    // Filter participants
    const filteredParticipants = participants.filter(participant => 
      participant.name.toLowerCase().includes(queryLower) ||
      participant.description?.toLowerCase().includes(queryLower) ||
      participant.cantonRole.toLowerCase().includes(queryLower)
    );
    if (filteredParticipants.length > 0) {
      results['Participants'] = filteredParticipants.slice(0, 5);
    }

    // Filter flows
    const filteredFlows = flows.filter(flow => 
      flow.title.toLowerCase().includes(queryLower) ||
      flow.description?.toLowerCase().includes(queryLower) ||
      flow.workflowType?.toLowerCase().includes(queryLower)
    );
    if (filteredFlows.length > 0) {
      results['Flows'] = filteredFlows.slice(0, 5);
    }

    return results;
  }, [query, navigationCommands, deals, participants, flows]);

  // Get flat list of all results for keyboard navigation
  const allResults = useMemo(() => {
    const flatResults: SearchResult[] = [];
    Object.values(searchResults).forEach(groupResults => {
      flatResults.push(...groupResults);
    });
    return flatResults;
  }, [searchResults]);

  const executeAction = useCallback((result: SearchResult) => {
    if ('action' in result) {
      // Navigation command
      result.action();
    } else if ('status' in result) {
      // Deal
      window.location.href = `/deals/${result.id}`;
      onClose();
    } else if ('cantonRole' in result) {
      // Participant - could navigate to participant details or trigger selection
      console.log('Selected participant:', result);
      onClose();
    } else if ('workflowType' in result) {
      // Flow
      console.log('Selected flow:', result);
      onClose();
    }
  }, [onClose]);

  const highlightQuery = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <span key={index} className="bg-blue-500/20 text-blue-300">{part}</span> : 
        part
    );
  };

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedIndex >= allResults.length) {
      setSelectedIndex(Math.max(0, allResults.length - 1));
    }
  }, [allResults, selectedIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev >= allResults.length - 1 ? 0 : prev + 1
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev <= 0 ? allResults.length - 1 : prev - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (allResults[selectedIndex]) {
            executeAction(allResults[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allResults, selectedIndex, onClose, executeAction]);

  const renderResult = (result: SearchResult, index: number) => {
    const isSelected = index === selectedIndex;
    let icon: React.ComponentType<{ className?: string }>;
    let title: string;
    let subtitle: string;
    let badge: string | undefined;

    if ('action' in result) {
      // Navigation command
      icon = result.icon;
      title = result.label;
      subtitle = result.subtitle || '';
      badge = result.badge;
    } else if ('status' in result) {
      // Deal
      icon = FileText;
      title = result.title;
      subtitle = result.description || `Status: ${result.status}`;
      badge = result.status;
    } else if ('cantonRole' in result) {
      // Participant
      icon = Building2;
      title = result.name;
      subtitle = result.cantonRole;
      badge = result.criticality;
    } else {
      // Flow
      icon = Workflow;
      title = result.title;
      subtitle = result.description || `by ${result.creatorDisplayName || 'Unknown'}`;
      badge = result.workflowType;
    }

    const Icon = icon;

    return (
      <div
        key={result.id}
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors group ${
          isSelected 
            ? 'bg-white/[0.08] text-white' 
            : 'text-white/60 hover:bg-white/[0.04]'
        }`}
        onClick={() => executeAction(result)}
      >
        <Icon className={`w-4 h-4 flex-shrink-0 ${
          isSelected ? 'text-blue-400' : 'text-white/30'
        }`} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">
            {highlightQuery(title, query)}
          </div>
          {subtitle && (
            <div className="text-xs text-white/40 truncate mt-0.5">
              {highlightQuery(subtitle, query)}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {badge && (
            <span className="text-[9px] font-mono text-white/20 bg-white/[0.06] rounded px-1.5 py-0.5 uppercase">
              {badge}
            </span>
          )}
          <ArrowRight className={`w-3 h-3 transition-transform ${
            isSelected ? 'text-blue-400 translate-x-0.5' : 'text-white/20'
          }`} />
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh]">
            <motion.div
              className="w-full max-w-xl bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
            >
              <div className="p-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <Search className="w-4 h-4 text-white/20" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="bg-transparent text-sm text-white placeholder-white/30 font-mono w-full focus:outline-none"
                    placeholder="Search deals, participants, flows, or navigate..."
                  />
                  {isLoading && (
                    <div className="w-4 h-4 border border-white/20 border-t-blue-400 rounded-full animate-spin" />
                  )}
                </div>
              </div>

              <div className="max-h-[50vh] overflow-y-auto">
                {Object.entries(searchResults).map(([groupName, groupResults]) => (
                  <div key={groupName}>
                    <div className="text-[8px] font-bold text-white/20 tracking-widest uppercase px-4 py-2">
                      {groupName}
                    </div>
                    {groupResults.map((result) => {
                      const globalIndex = allResults.indexOf(result);
                      return renderResult(result, globalIndex);
                    })}
                  </div>
                ))}

                {allResults.length === 0 && !isLoading && query.trim() && (
                  <div className="px-4 py-8 text-center text-white/30 text-sm">
                    No results found for &ldquo;{query}&rdquo;
                  </div>
                )}

                {allResults.length === 0 && !query.trim() && (
                  <div className="px-4 py-6 text-center text-white/30 text-xs">
                    Start typing to search deals, participants, flows, and more...
                  </div>
                )}
              </div>

              <div className="px-4 py-3 border-t border-white/[0.06] flex items-center gap-4 text-[9px] text-white/20 font-mono">
                <span>↑↓ Navigate</span>
                <span>·</span>
                <span>↵ Select</span>
                <span>·</span>
                <span>esc Close</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};