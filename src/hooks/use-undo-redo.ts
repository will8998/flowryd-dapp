'use client';

import { useState, useCallback, useRef } from 'react';
import type { Node, Edge } from '@xyflow/react';

interface FlowState {
  nodes: Node[];
  edges: Edge[];
}

interface UndoRedoState {
  undo: () => FlowState | null;
  redo: () => FlowState | null;
  canUndo: boolean;
  canRedo: boolean;
  pushState: (nodes: Node[], edges: Edge[]) => void;
}

const MAX_HISTORY_SIZE = 50;

export function useUndoRedo(): UndoRedoState {
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyRef = useRef<FlowState[]>([]);

  const pushState = useCallback((nodes: Node[], edges: Edge[]) => {
    const newState: FlowState = { nodes: [...nodes], edges: [...edges] };
    
    if (historyIndex < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIndex + 1);
    }
    
    historyRef.current.push(newState);
    
    if (historyRef.current.length > MAX_HISTORY_SIZE) {
      historyRef.current = historyRef.current.slice(-MAX_HISTORY_SIZE);
    }
    
    setHistoryIndex(historyRef.current.length - 1);
  }, [historyIndex]);

  const undo = useCallback((): FlowState | null => {
    if (historyIndex <= 0) return null;
    
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    return historyRef.current[newIndex];
  }, [historyIndex]);

  const redo = useCallback((): FlowState | null => {
    if (historyIndex >= historyRef.current.length - 1) return null;
    
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    return historyRef.current[newIndex];
  }, [historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyRef.current.length - 1;

  return {
    undo,
    redo,
    canUndo,
    canRedo,
    pushState,
  };
}