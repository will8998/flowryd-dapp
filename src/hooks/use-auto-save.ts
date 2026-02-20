'use client';

import { useState, useEffect, useRef } from 'react';
import type { Node, Edge } from '@xyflow/react';

interface FlowVersion {
  id: string;
  flowId: string;
  version: number;
  nodes: unknown[];
  edges: unknown[];
  viewport: { x: number; y: number; zoom: number } | null;
  snapshotName: string | null;
  createdAt: string;
}

interface AutoSaveOptions {
  flowId: string | null;
  nodes: Node[];
  edges: Edge[];
  saveVersion: (nodes: unknown[], edges: unknown[], viewport?: { x: number; y: number; zoom: number }) => Promise<FlowVersion | null>;
  debounceMs?: number;
}

interface AutoSaveState {
  isSaving: boolean;
  lastSavedAt: Date | null;
  isDirty: boolean;
}

export function useAutoSave({
  flowId,
  nodes,
  edges,
  saveVersion,
  debounceMs = 3000
}: AutoSaveOptions): AutoSaveState {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousStateRef = useRef<string>('');

  const currentState = JSON.stringify({ nodes, edges });

  useEffect(() => {
    if (!flowId) return;

    const hasChanged = currentState !== previousStateRef.current;
    
    if (hasChanged && previousStateRef.current !== '') {
      setIsDirty(true);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(async () => {
        setIsSaving(true);
        try {
          await saveVersion(nodes, edges);
          setLastSavedAt(new Date());
          setIsDirty(false);
          previousStateRef.current = currentState;
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsSaving(false);
        }
      }, debounceMs);
    } else if (previousStateRef.current === '') {
      previousStateRef.current = currentState;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentState, flowId, nodes, edges, saveVersion, debounceMs]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isSaving,
    lastSavedAt,
    isDirty,
  };
}