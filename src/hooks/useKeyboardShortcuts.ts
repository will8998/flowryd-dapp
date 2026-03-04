"use client";

import { useEffect, useCallback, useRef, useState } from 'react';
import { Shortcut, parseKeyEvent, isInputElement } from '@/lib/keyboard-shortcuts';

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  comboTimeout?: number; // Time in ms to wait for combo completion
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { enabled = true, comboTimeout = 500 } = options;
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const shortcutsRef = useRef<Map<string, Shortcut>>(new Map());
  const comboStateRef = useRef<{
    keys: string[];
    timeout: NodeJS.Timeout | null;
  }>({ keys: [], timeout: null });

  const registerShortcut = useCallback((shortcut: Shortcut) => {
    shortcutsRef.current.set(shortcut.key, shortcut);
    setShortcuts(Array.from(shortcutsRef.current.values()));
  }, []);

  const unregisterShortcut = useCallback((key: string) => {
    shortcutsRef.current.delete(key);
    setShortcuts(Array.from(shortcutsRef.current.values()));
  }, []);

  const clearShortcuts = useCallback(() => {
    shortcutsRef.current.clear();
    setShortcuts([]);
  }, []);

  const resetComboState = useCallback(() => {
    if (comboStateRef.current.timeout) {
      clearTimeout(comboStateRef.current.timeout);
    }
    comboStateRef.current = { keys: [], timeout: null };
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Ignore shortcuts when typing in input fields
    if (event.target && isInputElement(event.target as Element)) {
      return;
    }

    const keyString = parseKeyEvent(event);
    
    // Handle single key shortcuts (like '?' or 'Escape')
    const singleKeyShortcut = shortcutsRef.current.get(keyString);
    if (singleKeyShortcut) {
      event.preventDefault();
      singleKeyShortcut.action();
      resetComboState();
      return;
    }

    // Handle combo shortcuts (like 'g+i')
    // For combos, we only track single character keys without modifiers
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey) {
      const currentKeys = [...comboStateRef.current.keys, event.key.toLowerCase()];
      
      // Clear existing timeout
      if (comboStateRef.current.timeout) {
        clearTimeout(comboStateRef.current.timeout);
      }

      // Check if current combo matches any shortcut
      const comboKey = currentKeys.join('+');
      const comboShortcut = shortcutsRef.current.get(comboKey);
      
      if (comboShortcut) {
        event.preventDefault();
        comboShortcut.action();
        resetComboState();
        return;
      }

      // Check if current combo is a prefix of any shortcut
      const hasMatchingPrefix = Array.from(shortcutsRef.current.keys()).some(key => 
        key.startsWith(comboKey + '+')
      );

      if (hasMatchingPrefix) {
        event.preventDefault();
        comboStateRef.current.keys = currentKeys;
        
        // Set timeout to reset combo state
        comboStateRef.current.timeout = setTimeout(() => {
          resetComboState();
        }, comboTimeout);
      } else {
        // No matching prefix, reset combo state
        resetComboState();
      }
    } else {
      // Non-combo key pressed, reset combo state
      resetComboState();
    }
  }, [enabled, comboTimeout, resetComboState]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      resetComboState();
    };
  }, [enabled, handleKeyDown, resetComboState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetComboState();
    };
  }, [resetComboState]);

  return {
    registerShortcut,
    unregisterShortcut,
    clearShortcuts,
    shortcuts,
  };
}