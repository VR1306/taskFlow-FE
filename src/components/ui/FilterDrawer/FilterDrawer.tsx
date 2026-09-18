'use client';

import React, { memo } from 'react';
import { Drawer, Button, Badge, Image } from '@/components/ui';

export interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
  title?: string;
  description?: string;
  activeFilterCount?: number;
  children: React.ReactNode;
  applyButtonText?: string;
  resetButtonText?: string;
  isLoading?: boolean;
  width?: 'sm' | 'md' | 'lg' | 'xl';
}

export const FilterDrawer = memo(function FilterDrawer({
  isOpen,
  onClose,
  onApply,
  onReset,
  title = 'Filters',
  description = 'Narrow down results with specific filter criteria.',
  activeFilterCount = 0,
  children,
  applyButtonText = 'Apply Filters',
  resetButtonText = 'Reset Filters',
  isLoading = false,
  width = 'md',
}: FilterDrawerProps) {
  const footerContent = (
    <div className="flex w-full items-center justify-between gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        disabled={isLoading}
        className="text-xs font-semibold py-2.5 px-4 text-slate-700 border-slate-300 hover:bg-slate-100/80 transition-colors"
      >
        {resetButtonText}
      </Button>

      <Button
        type="button"
        variant="primary"
        onClick={onApply}
        isLoading={isLoading}
        disabled={isLoading}
        className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 py-2.5 px-5 transition-all"
      >
        {applyButtonText}
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      width={width}
      footer={footerContent}
      showCloseButton={!isLoading}
    >
      <div className="space-y-6">
        {/* Filter Header Card */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 shadow-2xs">
            <Image src="/icons/filter.svg" alt="Filter" width={20} height={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">{title}</h2>
              {activeFilterCount > 0 && (
                <Badge size="sm" variant="primary">
                  {activeFilterCount} active
                </Badge>
              )}
            </div>
            {description && (
              <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{description}</p>
            )}
          </div>
        </div>

        {/* Filter Controls Body */}
        <div className="space-y-5">{children}</div>
      </div>
    </Drawer>
  );
});

FilterDrawer.displayName = 'FilterDrawer';

export default FilterDrawer;
