'use client';

import React, { useEffect, useCallback, memo } from 'react';
import { Image } from '@/components/ui';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export const Modal = memo(function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  showCloseButton = true,
}: ModalProps) {
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

  if (!isOpen) return null;

  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-transparent border-none w-full h-full max-w-none max-h-none m-0"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {/* Backdrop overlay */}
      <button
        type="button"
        aria-label="Close modal backdrop"
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 w-full h-full border-none cursor-default"
        onClick={onClose}
        data-testid="modal-backdrop"
      />

      {/* Modal Card */}
      <div
        className={`relative w-full ${maxWidthMap[maxWidth]} bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-7 overflow-hidden z-10 transition-all duration-300 animate-in zoom-in-95`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              {title && (
                <h3
                  id="modal-title"
                  className="text-lg sm:text-xl font-bold tracking-tight text-slate-900"
                >
                  {title}
                </h3>
              )}
              {description && (
                <p id="modal-description" className="mt-1 text-sm text-slate-500">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <Image src="/icons/close.svg" alt="Close" width={18} height={18} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="mt-2">{children}</div>
      </div>
    </dialog>
  );
});

Modal.displayName = 'Modal';

export default Modal;
