import React, { ReactNode } from 'react';
import { Loader } from '@/components/ui/Loader';

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
  emptyMessage?: string;
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

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  loadingText = 'Loading data...',
  emptyMessage = 'No records found.',
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

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={columns.length} className="px-6 py-12 text-center">
            <div className="flex justify-center items-center">
              <Loader text={loadingText} />
            </div>
          </td>
        </tr>
      );
    }

    if (data.length === 0) {
      return (
        <tr>
          <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400 text-sm">
            {emptyState || emptyMessage}
          </td>
        </tr>
      );
    }

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
    <div className={`overflow-x-auto min-h-[160px] ${wrapperClassName}`}>
      <table
        className={`min-w-full divide-y divide-slate-100 text-sm ${className}`}
        aria-label={ariaLabel}
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
