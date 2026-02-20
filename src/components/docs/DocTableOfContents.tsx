"use client";

import { useState, useEffect } from 'react';

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

interface DocTableOfContentsProps {
  headings: Heading[];
}

export default function DocTableOfContents({ headings }: DocTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        
        if (visibleEntries.length > 0) {
          const closestEntry = visibleEntries.reduce((closest, entry) => {
            return entry.boundingClientRect.top < closest.boundingClientRect.top 
              ? entry 
              : closest;
          });
          
          setActiveId(closestEntry.target.id);
        }
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1]
      }
    );

    const headingElements = headings
      .map(heading => document.getElementById(heading.id))
      .filter(Boolean);

    headingElements.forEach(element => {
      if (element) observer.observe(element);
    });

    return () => {
      headingElements.forEach(element => {
        if (element) observer.unobserve(element);
      });
    };
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="space-y-1">
      <h4 className="text-xs font-semibold text-white/40 mb-3 uppercase tracking-wide">
        On this page
      </h4>
      
      {headings.map((heading) => (
        <button
          key={heading.id}
          onClick={() => scrollToHeading(heading.id)}
          className={`
            block w-full text-left text-[10px] leading-relaxed py-1 transition-colors
            ${heading.level === 3 ? 'pl-3' : ''}
            ${activeId === heading.id 
              ? 'text-white/60 font-medium' 
              : 'text-white/30 hover:text-white/50'
            }
          `}
        >
          {heading.text}
        </button>
      ))}
    </nav>
  );
}