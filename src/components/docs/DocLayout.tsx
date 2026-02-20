"use client";

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export interface DocSection {
  id: string;
  title: string;
  children?: DocSection[];
}

interface DocLayoutProps {
  children: React.ReactNode;
  sections: DocSection[];
  activeSection: string;
  onSectionClick: (id: string) => void;
  renderSidebar: (props: {
    sections: DocSection[];
    activeSection: string;
    onSectionClick: (id: string) => void;
  }) => React.ReactNode;
  renderTableOfContents?: () => React.ReactNode;
}

export default function DocLayout({
  children,
  sections,
  activeSection,
  onSectionClick,
  renderSidebar,
  renderTableOfContents,
}: DocLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close mobile menu when clicking outside (complex event handling)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const sidebar = document.getElementById('mobile-sidebar');
      const menuButton = document.getElementById('mobile-menu-button');
      
      if (isMobileMenuOpen && sidebar && !sidebar.contains(target) && !menuButton?.contains(target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-background">
      <button
        id="mobile-menu-button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded border border-white/10 bg-black/40 backdrop-blur-sm"
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <Menu className="w-5 h-5 text-white" />
        )}
      </button>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" />
      )}

      <div className="flex">
        <aside
          id="mobile-sidebar"
          className={`
            fixed lg:fixed top-0 left-0 h-screen w-80 z-40 transition-transform duration-300
            bg-black/40 border-r border-white/5 backdrop-blur-sm
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {renderSidebar({ sections, activeSection, onSectionClick })}
        </aside>

        <main className="flex-1 lg:ml-80">
          <div className="flex">
            <div className="flex-1 max-w-4xl mx-auto px-6 py-8 lg:py-12">
              {children}
            </div>

            {renderTableOfContents && (
              <aside className="hidden xl:block w-48 py-8 pr-6">
                <div className="sticky top-8">
                  {renderTableOfContents()}
                </div>
              </aside>
            )}
          </div>
        </main>
      </div>
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors z-30"
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </div>
  );
}