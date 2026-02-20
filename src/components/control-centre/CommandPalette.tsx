"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, Layers, MessageSquare, Users, Workflow, Shield, Plus, Terminal, Bell, HelpCircle } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  activeTier: string;
  onTierChange: (tier: string) => void;
  userRole?: string;
}

interface Command {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: 'Navigation' | 'Actions';
  action: () => void;
  shortcut?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, activeTier, onTierChange, userRole }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const allCommands: Command[] = useMemo(() => {
    const commands: Command[] = [
      {
        id: 'nav-discover',
        label: 'Go to Discover Network',
        icon: Globe,
        group: 'Navigation',
        action: () => {
          onTierChange('DISCOVER');
          onClose();
        }
      },
      {
        id: 'nav-workbench',
        label: 'Go to Workbench',
        icon: Layers,
        group: 'Navigation',
        action: () => {
          onTierChange('NAVIGATE');
          onClose();
        }
      },
      {
        id: 'nav-deals',
        label: 'Go to Deals',
        icon: MessageSquare,
        group: 'Navigation',
        action: () => {
          onTierChange('ACTIVATE');
          onClose();
        }
      },
      {
        id: 'nav-marketplace',
        label: 'Go to Marketplace',
        icon: Users,
        group: 'Navigation',
        action: () => {
          onTierChange('JOIN');
          onClose();
        }
      },
      {
        id: 'nav-jump-cuts',
        label: 'Go to Jump Cuts',
        icon: Workflow,
        group: 'Navigation',
        action: () => {
          onTierChange('JUMPCUTS');
          onClose();
        }
      },
      {
        id: 'action-new-flow',
        label: 'Create New Flow',
        icon: Plus,
        group: 'Actions',
        action: () => {
          onClose();
        }
      },
      {
        id: 'action-new-deal',
        label: 'Create New Deal',
        icon: Plus,
        group: 'Actions',
        action: () => {
          window.location.href = '/deals/new';
        }
      },
      {
        id: 'action-toggle-ai',
        label: 'Toggle Ryd AI',
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
        icon: Bell,
        group: 'Actions',
        action: () => {
          onClose();
        }
      },
      {
        id: 'action-help',
        label: 'Open Help',
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
        label: 'Go to Admin',
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

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return allCommands;
    return allCommands.filter(command =>
      command.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [allCommands, query]);

  const groupedCommands = useMemo(() => {
    const groups: { [key: string]: Command[] } = {};
    filteredCommands.forEach(command => {
      if (!groups[command.group]) {
        groups[command.group] = [];
      }
      groups[command.group].push(command);
    });
    return groups;
  }, [filteredCommands]);

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
    if (selectedIndex >= filteredCommands.length) {
      setSelectedIndex(Math.max(0, filteredCommands.length - 1));
    }
  }, [filteredCommands, selectedIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev >= filteredCommands.length - 1 ? 0 : prev + 1
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev <= 0 ? filteredCommands.length - 1 : prev - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
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
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  const renderCommandItem = (command: Command, index: number) => {
    const isSelected = index === selectedIndex;
    const Icon = command.icon;

    return (
      <div
        key={command.id}
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
          isSelected 
            ? 'bg-white/[0.08] text-white' 
            : 'text-white/60 hover:bg-white/[0.04]'
        }`}
        onClick={() => command.action()}
      >
        <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-white/30'}`} />
        <span className="text-sm font-medium">{command.label}</span>
        {command.shortcut && (
          <span className="text-[9px] font-mono text-white/20 bg-white/[0.06] rounded px-1.5 py-0.5 ml-auto">
            {command.shortcut}
          </span>
        )}
      </div>
    );
  };

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

          <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh]">
            <motion.div
              className="w-full max-w-lg bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-[20px] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden"
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
                    placeholder="Type a command or search..."
                  />
                </div>
              </div>

              <div className="max-h-[50vh] overflow-y-auto">
                {Object.entries(groupedCommands).map(([groupName, commands]) => (
                  <div key={groupName}>
                    <div className="text-[8px] font-bold text-white/20 tracking-widest uppercase px-4 py-2">
                      {groupName}
                    </div>
                    {commands.map((command) => {
                      const globalIndex = filteredCommands.indexOf(command);
                      return renderCommandItem(command, globalIndex);
                    })}
                  </div>
                ))}

                {filteredCommands.length === 0 && (
                  <div className="px-4 py-8 text-center text-white/30 text-sm">
                    No commands found
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