"use client";

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  copyable?: boolean;
}

export default function CodeBlock({ 
  code, 
  language = 'text', 
  title, 
  copyable = true 
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!copyable) return;
    
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const highlightCode = (code: string) => {
    return code
      .replace(
        /\b(import|export|const|let|var|function|return|if|else|async|await|from|type|interface|class|extends|implements|public|private|protected|static)\b/g,
        '<span class="text-white/80 font-medium">$1</span>'
      )
      .replace(
        /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
        '<span class="text-white/60">$1$2$1</span>'
      )
      .replace(
        /(`)((?:\\.|[^`\\])*?)(`)/g,
        '<span class="text-white/60">$1$2$3</span>'
      )
      .replace(
        /\/\*[\s\S]*?\*\//g,
        '<span class="text-white/30">$&</span>'
      )
      .replace(
        /\/\/.*$/gm,
        '<span class="text-white/30">$&</span>'
      )
      .replace(
        /\b(\d+(?:\.\d+)?)\b/g,
        '<span class="text-white/50">$1</span>'
      )
      .replace(
        /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
        '<span class="text-white/70">$1</span>('
      );
  };

  const displayTitle = title || language;

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded overflow-hidden mb-6">
      {displayTitle && (
        <div className="flex items-center justify-between px-4 py-2 bg-black/20 border-b border-white/5">
          <span className="text-white/40 text-sm font-mono">{displayTitle}</span>
          {copyable && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 text-xs text-white/40 hover:text-white/60 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy
                </>
              )}
            </button>
          )}
        </div>
      )}
      
      <div className="relative">
        <pre className="p-4 text-sm font-mono overflow-x-auto text-white/70">
          <code 
            dangerouslySetInnerHTML={{ 
              __html: highlightCode(code) 
            }} 
          />
        </pre>
        
        {copyable && !displayTitle && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 text-white/30 hover:text-white/60 transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}