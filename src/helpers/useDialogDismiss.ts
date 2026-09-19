'use client';

import { useEffect, useCallback } from 'react';

/**
 * Custom hook for managing modal and drawer dialog dismissal:
 * - Locks body scroll when dialog is active
 * - Handles 'Escape' key press to trigger onClose callback
 */
export function useDialogDismiss(isOpen: boolean, onClose: () => void): void {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);
}
