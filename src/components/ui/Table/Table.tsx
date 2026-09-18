import React, { ReactNode } from 'react';
import { Loader } from '@/components/ui/Loader';
import { EmptyState, EmptyStateVariant } from '@/components/ui/EmptyState';

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  render?: (item: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor?: (item: T, index: number) => string | number;
  isLoading?: boolean;
  loadingText?: string;
  skeletonRowCount?: number;
  showLoadingOverlay?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyVariant?: EmptyStateVariant;
  emptyIcon?: ReactNode;
  emptyAction?: ReactNode;
  emptyState?: ReactNode;
  onRowClick?: (item: T) => void;
  rowClassName?: string | ((item: T, index: number) => string);
  className?: string;
  wrapperClassName?: string;
  ariaLabel?: string;
}

const getAlignmentClass = (align?: 'left' | 'center' | 'right'): string => {
  switch (align) {
    case 'right':
      return 'text-right';
    case 'center':
      return 'text-center';
    case 'left':
    default:
      return 'text-left';
  }
};

const getSkeletonCellPlaceholder = (colIndex: number, totalCols: number) => {
  if (colIndex === 0) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-slate-200 animate-shimmer shrink-0" />
        <div className="h-3.5 w-28 rounded-md bg-slate-200 animate-shimmer" />
      </div>
    );
  }
  if (colIndex === totalCols - 1) {
    return (
      <div className="flex justify-end">
        <div className="h-7 w-7 rounded-lg bg-slate-200 animate-shimmer shrink-0" />
      </div>
    );
  }
  if (colIndex % 2 === 1) {
    return <div className="h-3.5 w-32 rounded-md bg-slate-200 animate-shimmer" />;
  }
  return <div className="h-4 w-20 rounded-full bg-slate-200 animate-shimmer" />;
};

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  loadingText = 'Loading data...',
  skeletonRowCount = 5,
  showLoadingOverlay = true,
  emptyTitle,
  emptyMessage = 'No records found.',
  emptyVariant = 'no-data',
  emptyIcon,
  emptyAction,
  emptyState,
  onRowClick,
  rowClassName,
  className = '',
  wrapperClassName = '',
  ariaLabel = 'Data table',
}: Readonly<TableProps<T>>) {
  const getKey = (item: T, index: number): string | number => {
    if (keyExtractor) return keyExtractor(item, index);
    if (item && typeof item === 'object') {
      const candidate = (item as { _id?: string; id?: string })._id || (item as { id?: string }).id;
      if (candidate !== undefined) return candidate;
    }
    return index;
  };

  const getRowClass = (item: T, index: number): string => {
    const base = 'hover:bg-slate-50/70 transition-colors duration-150';
    const cursor = onRowClick ? 'cursor-pointer' : '';
    const custom =
      typeof rowClassName === 'function' ? rowClassName(item, index) : rowClassName || '';
    return `${base} ${cursor} ${custom}`.trim();
  };

  const renderSkeletonRows = () => {
    const rows = Array.from({ length: skeletonRowCount }, (_, i) => i);
    return rows.map((rowIndex) => (
      <tr
        key={`skeleton-row-${rowIndex}`}
        data-testid="table-skeleton-row"
        className="border-b border-slate-100/80"
      >
        {columns.map((col, colIndex) => (
          <td
            key={`skeleton-${rowIndex}-${col.key}`}
            className={`px-5 py-4 whitespace-nowrap ${getAlignmentClass(col.align)} ${col.className || ''}`}
          >
            {getSkeletonCellPlaceholder(colIndex, columns.length)}
          </td>
        ))}
      </tr>
    ));
  };

  const renderTableBody = () => {
    // Initial loading with no existing records -> Render skeleton shimmer rows
    if (isLoading && data.length === 0) {
      return renderSkeletonRows();
    }

    // Empty state when not loading
    if (data.length === 0) {
      return (
        <tr className="animate-in fade-in duration-300">
          <td colSpan={columns.length} className="px-6 py-8 text-center">
            {emptyState || (
              <EmptyState
                variant={emptyVariant}
                title={emptyTitle}
                description={emptyMessage}
                icon={emptyIcon}
                action={emptyAction}
                size="sm"
              />
            )}
          </td>
        </tr>
      );
    }

    // Normal rows rendering (supports smooth opacity during background refetches)
    return data.map((item, index) => (
      <tr
        key={getKey(item, index)}
        className={getRowClass(item, index)}
        onClick={onRowClick ? () => onRowClick(item) : undefined}
      >
        {columns.map((col) => (
          <td
            key={`${getKey(item, index)}-${col.key}`}
            className={`px-5 py-4 whitespace-nowrap ${getAlignmentClass(col.align)} ${col.className || ''}`}
          >
            {col.render
              ? col.render(item, index)
              : String((item as Record<string, unknown>)[col.key] ?? '')}
          </td>
        ))}
      </tr>
    ));
  };

  return (
    <div className={`relative overflow-x-auto min-h-[160px] ${wrapperClassName}`}>
      {/* Top Indeterminate Progress Line when updating/loading */}
      {isLoading && (
        <div
          role="progressbar"
          aria-label={loadingText}
          className="absolute top-0 left-0 right-0 h-0.5 bg-blue-100 overflow-hidden z-20"
        >
          <div className="h-full bg-blue-600 animate-indeterminate-bar w-full" />
        </div>
      )}

      {/* Floating Center Overlay Badge when loading existing data */}
      {isLoading && data.length > 0 && showLoadingOverlay && (
        <div
          data-testid="table-loading-overlay"
          className="absolute inset-0 top-[42px] flex items-center justify-center bg-white/40 backdrop-blur-[1px] z-10 transition-all duration-200 animate-in fade-in"
        >
          <div className="bg-white/95 px-4 py-2 rounded-full shadow-lg border border-slate-200/80 flex items-center gap-2.5 text-xs font-semibold text-slate-700 animate-in zoom-in-95">
            <Loader size="xs" />
            <span>{loadingText}</span>
          </div>
        </div>
      )}

      <table
        className={`min-w-full divide-y divide-slate-100 text-sm transition-all duration-200 ${
          isLoading && data.length > 0
            ? 'opacity-40 pointer-events-none select-none'
            : 'opacity-100'
        } ${className}`}
        aria-label={ariaLabel}
        aria-busy={isLoading}
      >
        <thead className="bg-slate-50/80 text-slate-500 font-semibold text-xs uppercase tracking-wider">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-5 py-3.5 ${getAlignmentClass(col.align)} ${col.headerClassName || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">{renderTableBody()}</tbody>
      </table>
    </div>
  );
}

export default Table;
