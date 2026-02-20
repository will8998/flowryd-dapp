"use client";

import { useEffect } from 'react';

interface DocContentProps {
  children: React.ReactNode;
  sectionId: string;
}

export default function DocContent({ children, sectionId }: DocContentProps) {
  useEffect(() => {
    const generateAnchorIds = () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      headings.forEach((heading) => {
        if (!heading.id) {
          const text = heading.textContent || '';
          const id = text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/^-+|-+$/g, '');
          
          if (id) {
            heading.id = id;
          }
        }
      });
    };

    const timeoutId = setTimeout(() => {
      generateAnchorIds();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [children]);

  useEffect(() => {
    const scrollToSection = () => {
      if (sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }
    };

    const timeoutId = setTimeout(scrollToSection, 150);
    return () => clearTimeout(timeoutId);
  }, [sectionId]);

  return (
    <div className="prose prose-invert max-w-none">
      <style jsx global>{`
        .prose h1 {
          @apply text-white text-3xl font-bold mb-6 mt-0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 0.5rem;
        }
        
        .prose h2 {
          @apply text-white text-2xl font-semibold mb-4 mt-8;
        }
        
        .prose h3 {
          @apply text-white text-xl font-medium mb-3 mt-6;
        }
        
        .prose h4 {
          @apply text-white text-lg font-medium mb-2 mt-4;
        }
        
        .prose p {
          @apply text-white/60 leading-relaxed mb-4;
        }
        
        .prose ul, .prose ol {
          @apply text-white/60 mb-4;
        }
        
        .prose li {
          @apply mb-2;
        }
        
        .prose a {
          @apply text-white/50 hover:text-white/70 underline underline-offset-4;
        }
        
        .prose code {
          @apply bg-black/40 px-2 py-1 rounded text-white/80 text-sm font-mono;
        }
        
        .prose pre {
          @apply bg-[#0a0a0a] border border-white/10 rounded p-4 overflow-x-auto mb-6;
        }
        
        .prose pre code {
          @apply bg-transparent p-0;
        }
        
        .prose table {
          @apply w-full border-collapse mb-6;
        }
        
        .prose th {
          @apply bg-black/40 border border-white/10 px-4 py-2 text-left text-white font-medium;
        }
        
        .prose td {
          @apply border border-white/10 px-4 py-2 text-white/60;
        }
        
        .prose blockquote {
          @apply border-l-4 border-white/20 pl-4 my-6 text-white/50 italic;
        }
        
        .prose .note {
          @apply bg-black/40 border border-white/10 rounded p-4 mb-4;
        }
        
        .prose .note-title {
          @apply text-white font-medium mb-2;
        }
        
        .prose .note-content {
          @apply text-white/60;
        }
      `}</style>
      
      {children}
    </div>
  );
}