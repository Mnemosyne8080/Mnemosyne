import { useEffect } from 'react';

interface Shortcuts {
  onNewChat?: () => void;
  onFocusInput?: () => void;
  onToggleSettings?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts({ onNewChat, onFocusInput, onToggleSettings, onEscape }: Shortcuts) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === 'k') {
        e.preventDefault();
        onFocusInput?.();
      }
      if (isMod && e.key === '/') {
        e.preventDefault();
        onToggleSettings?.();
      }
      if (isMod && e.key === 'n') {
        e.preventDefault();
        onNewChat?.();
      }
      if (e.key === 'Escape') {
        onEscape?.();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onNewChat, onFocusInput, onToggleSettings, onEscape]);
}
