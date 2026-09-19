'use client';

import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { Image, Button } from '@/components/ui';

export interface ExportButtonProps {
  onExportCsv: () => void | Promise<void>;
  onExportJson: () => void | Promise<void>;
  disabled?: boolean;
  isLoading?: boolean;
  label?: string;
  className?: string;
}

export const ExportButton = memo(function ExportButton({
  onExportCsv,
  onExportJson,
  disabled = false,
  isLoading = false,
  label = 'Export',
  className = '',
}: Readonly<ExportButtonProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    if (disabled || isLoading) return;
    setIsOpen((prev) => !prev);
  }, [disabled, isLoading]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleCsvClick = useCallback(async () => {
    handleClose();
    await onExportCsv();
  }, [handleClose, onExportCsv]);

  const handleJsonClick = useCallback(async () => {
    handleClose();
    await onExportJson();
  }, [handleClose, onExportJson]);

  // Outside click and Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        onClick={handleToggle}
        disabled={disabled || isLoading}
        isLoading={isLoading}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`${label} options`}
        className="text-xs sm:text-sm font-semibold h-10 px-3.5 gap-2 border-slate-200/90 text-slate-700 hover:bg-slate-50"
      >
        <Image src="/icons/download.svg" alt="" width={15} height={15} />
        <span>{label}</span>
        <Image
          src="/icons/chevron-right.svg"
          alt=""
          width={12}
          height={12}
          className={`rotate-90 transition-transform duration-200 ${isOpen ? 'rotate-270' : ''}`}
        />
      </Button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-xl backdrop-blur-md z-40 transition-all duration-150 animate-in fade-in zoom-in-95"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleCsvClick}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer text-left"
          >
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
              CSV
            </span>
            <span>Export as CSV (.csv)</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={handleJsonClick}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors cursor-pointer text-left mt-0.5"
          >
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
              JSON
            </span>
            <span>Export as JSON (.json)</span>
          </button>
        </div>
      )}
    </div>
  );
});

ExportButton.displayName = 'ExportButton';
export default ExportButton;
