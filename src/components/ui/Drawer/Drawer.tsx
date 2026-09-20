'use client';

import React, { useEffect, useState, memo } from 'react';
import { Image } from '@/components/ui/Image';
import { useDialogDismiss } from '@/helpers';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
}

const maxWidthMap: Record<'sm' | 'md' | 'lg' | 'xl' | '2xl', string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
};

export const Drawer = memo(function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  width = 'md',
  showCloseButton = true,
}: Readonly<DrawerProps>) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isAnimated, setIsAnimated] = useState(false);

  // Handle smooth open and close transitions
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const timer = requestAnimationFrame(() => {
        setIsAnimated(true);
      });
      return () => cancelAnimationFrame(timer);
    } else {
      setIsAnimated(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 300); // Wait for 300ms transition to finish
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useDialogDismiss(isOpen, onClose);

  if (!isRendered && !isOpen) return null;

  return (
    <dialog
      open
      aria-modal="true"
      aria-labelledby={title ? 'drawer-title' : undefined}
      aria-describedby={description ? 'drawer-description' : undefined}
      className={`m-0 p-0 border-none bg-transparent max-w-none max-h-none w-full h-full fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${
        isAnimated ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Backdrop overlay */}
      <button
        type="button"
        aria-label="Close drawer backdrop"
        onClick={onClose}
        data-testid="drawer-backdrop"
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 ease-in-out w-full h-full border-none cursor-default ${
          isAnimated ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Slide-over panel container */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
        <aside
          data-testid="drawer-panel"
          className={`w-screen max-w-full ${maxWidthMap[width]} bg-white shadow-2xl flex flex-col h-full overflow-hidden border-l border-slate-200/80 transform transition-transform duration-300 ease-in-out ${
            isAnimated ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between border-b border-slate-100 bg-white px-4 sm:px-6 py-4">
              <div className="min-w-0 pr-3 sm:pr-4">
                {title && (
                  <h2
                    id="drawer-title"
                    className="text-base sm:text-lg font-bold text-slate-900 truncate"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id="drawer-description"
                    className="mt-1 text-xs sm:text-sm text-slate-500 line-clamp-2"
                  >
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close drawer"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
                >
                  <Image src="/icons/close.svg" alt="Close" width={18} height={18} />
                </button>
              )}
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
            {children}
          </div>

          {/* Sticky Action Footer */}
          {footer && (
            <div className="border-t border-slate-100 bg-slate-50/70 px-4 sm:px-6 py-3.5 sm:py-4 flex flex-wrap items-center justify-end gap-2.5 sm:gap-3">
              {footer}
            </div>
          )}
        </aside>
      </div>
    </dialog>
  );
});

Drawer.displayName = 'Drawer';
