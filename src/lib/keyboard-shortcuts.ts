export interface Shortcut {
  key: string; // e.g., 'g+i', '?', 'Escape'
  label: string;
  description: string;
  category: string; // 'Navigation', 'Actions', 'General'
  action: () => void;
}

export const SHORTCUT_CATEGORIES = ['Navigation', 'Actions', 'General'] as const;

export type ShortcutCategory = typeof SHORTCUT_CATEGORIES[number];

export interface ShortcutsByCategory {
  [key: string]: Shortcut[];
}

export function groupShortcutsByCategory(shortcuts: Shortcut[]): ShortcutsByCategory {
  return shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as ShortcutsByCategory);
}

export function formatKeyCombo(key: string): string {
  // Convert key combinations to display format
  return key
    .split('+')
    .map(k => {
      switch (k.toLowerCase()) {
        case 'meta':
        case 'cmd':
          return '⌘';
        case 'ctrl':
          return '⌃';
        case 'alt':
          return '⌥';
        case 'shift':
          return '⇧';
        case 'escape':
          return 'Esc';
        case 'enter':
          return '↵';
        case 'space':
          return 'Space';
        default:
          return k.toUpperCase();
      }
    })
    .join(' + ');
}

export function parseKeyEvent(event: KeyboardEvent): string {
  const parts: string[] = [];
  
  if (event.metaKey) parts.push('meta');
  if (event.ctrlKey) parts.push('ctrl');
  if (event.altKey) parts.push('alt');
  if (event.shiftKey) parts.push('shift');
  
  // Add the main key
  if (event.key.length === 1) {
    parts.push(event.key.toLowerCase());
  } else {
    parts.push(event.key);
  }
  
  return parts.join('+');
}

export function isInputElement(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();
  const isContentEditable = element.getAttribute('contenteditable') === 'true';
  
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    isContentEditable ||
    element.closest('[contenteditable="true"]') !== null
  );
}