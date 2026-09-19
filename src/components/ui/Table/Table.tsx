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

const getSkeletonCellPlaceholder = (isFirstCol: boolean, isLastCol: boolean) => {
  if (isFirstCol) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-slate-200 animate-shimmer shrink-0" />
        <div className="h-3.5 w-28 rounded-md bg-slate-200 animate-shimmer" />
      </div>
    );
  }
  if (isLastCol) {
    return (
      <div className="flex justify-end">
        <div className="h-7 w-7 rounded-lg bg-slate-200 animate-shimmer shrink-0" />
      </div>
    );
  }
  return <div className="h-3.5 w-32 rounded-md bg-slate-200 animate-shimmer" />;
};

const formatCellValue = (val: unknown): React.ReactNode => {
  if (val === null || val === undefined) {
    return '';
  }
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
    return String(val);
  }
  if (typeof val === 'object') {
    return JSON.stringify(val);
  }
  return '';
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
  ariaLabel = 'Data Table',
}: Readonly<TableProps<T>>) {
  const getKey = (item: T, index: number): string | number => {
    if (keyExtractor) return keyExtractor(item, index);
    const candidate = (item as Record<string, unknown>)._id || (item as Record<string, unknown>).id;
    if (typeof candidate === 'string' || typeof candidate === 'number') {
      return candidate;
    }
    return index;
  };

  const getRowClass = (item: T, index: number) => {
    let custom = '';
    if (typeof rowClassName === 'function') {
      custom = rowClassName(item, index);
    } else if (rowClassName) {
      custom = rowClassName;
    }
    const interactive = onRowClick
      ? 'cursor-pointer hover:bg-blue-50/50 focus-within:bg-blue-50/50'
      : 'hover:bg-slate-50/80';
    return `border-b border-slate-100 last:border-b-0 transition-colors ${interactive} ${custom}`;
  };

  const renderTableBody = () => {
    // Skeleton loading state when there is no data yet
    if (isLoading && data.length === 0) {
      const skeletonRows = Array.from({ length: skeletonRowCount }, (_, i) => ({
        id: `skeleton-row-${i + 1}`,
      }));
      return skeletonRows.map((skeletonRow) => (
        <tr
          key={skeletonRow.id}
          data-testid="table-skeleton-row"
          className="border-b border-slate-100 last:border-b-0"
        >
          {columns.map((col) => {
            const isFirstCol = col.key === columns[0]?.key;
            const isLastCol = col.key === columns.at(-1)?.key;
            return (
              <td
                key={`skeleton-td-${col.key}`}
                className={`px-3 sm:px-5 py-3 sm:py-4 whitespace-nowrap ${getAlignmentClass(col.align)} ${col.className || ''}`}
              >
                {getSkeletonCellPlaceholder(isFirstCol, isLastCol)}
              </td>
            );
          })}
        </tr>
      ));
    }

    // Empty state
    if (data.length === 0) {
      return (
        <tr>
          <td colSpan={columns.length} className="p-0 border-none">
            {emptyState || (
              <EmptyState
                title={emptyTitle}
                description={emptyMessage}
                variant={emptyVariant}
                icon={emptyIcon}
                action={emptyAction}
                className="py-12 px-4"
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
            className={`px-3 sm:px-5 py-3 sm:py-4 whitespace-nowrap ${getAlignmentClass(col.align)} ${col.className || ''}`}
          >
            {col.render
              ? col.render(item, index)
              : formatCellValue((item as Record<string, unknown>)[col.key])}
          </td>
        ))}
      </tr>
    ));
  };

  return (
    <div
      className={`relative overflow-x-auto min-h-[160px] -webkit-overflow-scrolling-touch ${wrapperClassName}`}
    >
      {/* Top Indeterminate Progress Line when updating/loading */}
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-100 overflow-hidden z-20">
          <progress aria-label={loadingText} className="sr-only" />
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
        className={`min-w-full divide-y divide-slate-100 text-xs sm:text-sm transition-all duration-200 ${
          isLoading && data.length > 0
            ? 'opacity-40 pointer-events-none select-none'
            : 'opacity-100'
        } ${className}`}
        aria-label={ariaLabel}
        aria-busy={isLoading}
      >
        <thead className="bg-slate-50/80 text-slate-500 font-semibold text-[11px] sm:text-xs uppercase tracking-wider">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-3 sm:px-5 py-3 sm:py-3.5 ${getAlignmentClass(col.align)} ${col.headerClassName || col.className || ''}`}
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
