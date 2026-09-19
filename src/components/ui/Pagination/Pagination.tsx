'use client';

import React, { memo, useMemo, useCallback } from 'react';
import { Image } from '@/components/ui/Image';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
  disabled?: boolean;
  itemLabel?: string;
  className?: string;
}

export const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = [10, 20, 50],
  disabled = false,
  itemLabel = 'members',
  className = '',
}: PaginationProps) {
  // 1. Calculate record range summary with useMemo
  const { startItem, endItem } = useMemo(() => {
    if (totalItems <= 0) return { startItem: 0, endItem: 0 };
    const start = (currentPage - 1) * limit + 1;
    const end = Math.min(currentPage * limit, totalItems);
    return { startItem: start, endItem: Math.max(start, end) };
  }, [currentPage, limit, totalItems]);

  // 2. Generate smart page numbers array with ellipses with useMemo
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const total = Math.max(1, totalPages);

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis-start');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(total - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < total - 2) {
        pages.push('ellipsis-end');
      }

      pages.push(total);
    }

    return pages;
  }, [currentPage, totalPages]);

  // Handlers wrapped with useCallback
  const handlePrev = useCallback(() => {
    if (currentPage > 1 && !disabled) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, disabled, onPageChange]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages && !disabled) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, disabled, onPageChange]);

  const handlePageClick = useCallback(
    (page: number) => {
      if (page !== currentPage && !disabled) {
        onPageChange(page);
      }
    },
    [currentPage, disabled, onPageChange]
  );

  const handleSelectLimit = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newLimit = Number(e.target.value);
      if (onLimitChange && !disabled) {
        onLimitChange(newLimit);
      }
    },
    [disabled, onLimitChange]
  );

  if (totalItems <= 0) return null;

  const singularItemLabel = itemLabel.endsWith('s') ? itemLabel.slice(0, -1) : itemLabel;
  const displayItemLabel = totalItems === 1 ? singularItemLabel : itemLabel;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 py-4 select-none transition-opacity duration-200 ${
        disabled ? 'opacity-60' : 'opacity-100'
      } ${className}`}
      aria-label="Pagination Navigation"
    >
      {/* Left: Summary and Limit Selector */}
      <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600 w-full sm:w-auto">
        <span>
          Showing <span className="font-bold text-slate-900">{startItem}</span> to{' '}
          <span className="font-bold text-slate-900">{endItem}</span> of{' '}
          <span className="font-bold text-slate-900">{totalItems}</span> {displayItemLabel}
        </span>

        {onLimitChange && (
          <div className="flex items-center gap-1.5 sm:gap-2 sm:border-l sm:border-slate-200 sm:pl-3">
            <label htmlFor="pagination-limit" className="text-slate-500 text-xs font-medium">
              Rows per page:
            </label>
            <select
              id="pagination-limit"
              aria-label="Rows per page"
              value={limit}
              onChange={handleSelectLimit}
              disabled={disabled}
              className="rounded-lg border border-slate-200 bg-slate-50/80 px-2 py-1 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-colors cursor-pointer"
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Modern Production Controls */}
      <div className="flex items-center justify-center sm:justify-end gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
        {/* Previous Page Button */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentPage <= 1 || disabled}
          aria-label="Go to previous page"
          className="inline-flex h-8.5 items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/70 hover:text-blue-600 disabled:opacity-40 disabled:pointer-events-none cursor-pointer active:scale-95 gap-1.5 shrink-0"
        >
          <Image src="/icons/chevron-left.svg" alt="" width={13} height={13} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Numbered Page Buttons */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page) => {
            if (typeof page === 'string') {
              return (
                <span
                  key={page}
                  className="h-8.5 w-6 sm:w-7 flex items-center justify-center text-slate-400 text-xs font-bold select-none tracking-widest"
                >
                  ...
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={`page-btn-${page}`}
                type="button"
                onClick={() => handlePageClick(page)}
                disabled={disabled}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Page ${page}`}
                className={`inline-flex h-8.5 w-8 sm:w-8.5 items-center justify-center rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs border border-blue-600 font-extrabold'
                    : 'border border-slate-200 bg-white text-slate-700 shadow-2xs hover:border-blue-300 hover:bg-blue-50/70 hover:text-blue-600'
                } disabled:pointer-events-none`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Page Button */}
        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage >= totalPages || disabled}
          aria-label="Go to next page"
          className="inline-flex h-8.5 items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/70 hover:text-blue-600 disabled:opacity-40 disabled:pointer-events-none cursor-pointer active:scale-95 gap-1.5 shrink-0"
        >
          <span className="hidden sm:inline">Next</span>
          <Image src="/icons/chevron-right.svg" alt="" width={13} height={13} />
        </button>
      </div>
    </div>
  );
});

Pagination.displayName = 'Pagination';

export default Pagination;
