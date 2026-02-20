"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchableSection {
  id: string;
  title: string;
  keywords: string[];
}

interface DocSearchProps {
  sections: SearchableSection[];
  onSelect: (id: string) => void;
}

export default function DocSearch({ sections, onSelect }: DocSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchableSection[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const fuzzySearch = (searchQuery: string, text: string): number => {
    if (!searchQuery) return 0;
    
    const query = searchQuery.toLowerCase();
    const target = text.toLowerCase();
    
    if (target.includes(query)) return 10;
    
    let queryIndex = 0;
    let score = 0;
    
    for (let i = 0; i < target.length && queryIndex < query.length; i++) {
      if (target[i] === query[queryIndex]) {
        score++;
        queryIndex++;
      }
    }
    
    return queryIndex === query.length ? score : 0;
  };

  const searchSections = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const scored = sections
      .map(section => {
        const titleScore = fuzzySearch(searchQuery, section.title);
        const keywordScore = Math.max(
          ...section.keywords.map(keyword => fuzzySearch(searchQuery, keyword))
        );
        const maxScore = Math.max(titleScore, keywordScore);
        
        return { ...section, score: maxScore };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    setResults(scored);
    setIsOpen(scored.length > 0);
    setSelectedIndex(-1);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchSections(query);
    }, 150);
    
    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sections]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex].id);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (id: string) => {
    onSelect(id);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative mb-4" ref={resultsRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(results.length > 0)}
          placeholder="Search documentation..."
          className="w-full pl-10 pr-10 py-2 text-sm bg-black/40 border border-white/10 rounded text-white placeholder-white/30 focus:border-white/20 focus:outline-none"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/30 hover:text-white/60"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 border border-white/10 rounded shadow-lg backdrop-blur-sm z-50">
          {results.map((result, index) => (
            <button
              key={result.id}
              onClick={() => handleSelect(result.id)}
              className={`
                w-full px-4 py-3 text-left text-sm border-b border-white/5 last:border-b-0
                transition-colors hover:bg-black/40
                ${index === selectedIndex ? 'bg-black/40' : ''}
              `}
            >
              <div className="text-white/80 font-medium">{result.title}</div>
              {result.keywords.length > 0 && (
                <div className="text-white/40 text-xs mt-1">
                  {result.keywords.slice(0, 3).join(' · ')}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}