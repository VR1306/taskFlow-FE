'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export interface DropdownCoords {
  top: number;
  left: number;
  isAbove: boolean;
}

export interface UseDropdownMenuOptions {
  menuWidth?: number;
  menuHeight?: number;
  padding?: number;
}

/**
 * Custom hook for managing floating portal dropdown menus:
 * - Computes position relative to trigger button, adapting if menu overflows viewport
 * - Automatically registers outside-click, escape key, scroll, and resize listeners to auto-dismiss
 */
export function useDropdownMenu(options: UseDropdownMenuOptions = {}) {
  const { menuWidth = 180, menuHeight = 138, padding = 6 } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<DropdownCoords | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || typeof window === 'undefined') return;
    const rect = triggerRef.current.getBoundingClientRect();

    const fitsBelow = rect.bottom + menuHeight + padding <= window.innerHeight;
    const isAbove = !fitsBelow && rect.top - menuHeight - padding >= 0;

    const top = isAbove ? rect.top - menuHeight - padding : rect.bottom + padding;

    let left = rect.right - menuWidth;
    if (left < 10) left = 10;
    if (left + menuWidth > window.innerWidth - 10) {
      left = window.innerWidth - menuWidth - 10;
    }

    setCoords({ top, left, isAbove });
  }, [menuWidth, menuHeight, padding]);

  const handleToggle = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setIsOpen((prev) => {
        if (!prev) {
          updatePosition();
        }
        return !prev;
      });
    },
    [updatePosition]
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, updatePosition]);

  return {
    isOpen,
    coords,
    triggerRef,
    menuRef,
    handleToggle,
    handleClose,
  };
}
