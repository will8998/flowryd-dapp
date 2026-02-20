"use client";

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { DocSection } from './DocLayout';

interface DocSidebarProps {
  sections: DocSection[];
  activeSection: string;
  onSectionClick: (id: string) => void;
}

export default function DocSidebar({
  sections,
  activeSection,
  onSectionClick,
}: DocSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['authentication', 'flows', 'deals', 'admin', 'api-reference'])
  );

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleSectionClick = (id: string, hasChildren?: boolean) => {
    if (hasChildren) {
      toggleSection(id);
    }
    onSectionClick(id);
  };

  const renderSection = (section: DocSection, level = 0) => {
    const hasChildren = section.children && section.children.length > 0;
    const isExpanded = expandedSections.has(section.id);
    const isActive = activeSection === section.id;
    const indentClass = level > 0 ? 'ml-4' : '';

    return (
      <div key={section.id} className={indentClass}>
        <button
          onClick={() => handleSectionClick(section.id, hasChildren)}
          className={`
            w-full flex items-center justify-between px-3 py-2 text-sm rounded text-left
            transition-colors hover:bg-black/20
            ${isActive 
              ? 'border border-white/30 bg-black/40 text-white' 
              : 'text-white/60 hover:text-white/80'
            }
          `}
        >
          <span className="flex items-center gap-2">
            {hasChildren && (
              isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )
            )}
            {section.title}
          </span>
        </button>
        
        {hasChildren && isExpanded && section.children && (
          <div className="mt-1">
            {section.children.map((child) => renderSection(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-white mb-6">Documentation</h2>
        <nav className="space-y-1">
          {sections.map((section) => renderSection(section))}
        </nav>
      </div>
    </div>
  );
}