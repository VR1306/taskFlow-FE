/**
 * Export Utility Functions for CSV and JSON file generation
 */

export type CsvFieldValue = string | number | boolean | bigint | null | undefined | object;

export interface ExportColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => CsvFieldValue);
}

/**
 * Escapes and sanitizes a single CSV field value
 */
export const escapeCsvValue = (val: CsvFieldValue): string => {
  if (val === null || val === undefined) return '';
  const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
  // If string contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Converts array of objects into standard RFC-4180 CSV string
 */
export const generateCsvContent = <T>(data: T[], columns: ExportColumn<T>[]): string => {
  const headerRow = columns.map((c) => escapeCsvValue(c.header)).join(',');
  const dataRows = data.map((item) =>
    columns
      .map((col) => {
        const rawValue =
          typeof col.accessor === 'function'
            ? col.accessor(item)
            : (item[col.accessor] as CsvFieldValue);
        return escapeCsvValue(rawValue);
      })
      .join(',')
  );

  return [headerRow, ...dataRows].join('\r\n');
};

/**
 * Triggers client-side browser file download from Blob
 */
export const triggerDownload = (blob: Blob, filename: string): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Exports data to CSV file with UTF-8 BOM for Excel compatibility
 */
export const exportToCsv = <T>(data: T[], filename: string, columns: ExportColumn<T>[]): void => {
  const csvContent = generateCsvContent(data, columns);
  // \uFEFF ensures Excel displays UTF-8 encoded text properly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const finalFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  triggerDownload(blob, finalFilename);
};

/**
 * Exports data to formatted JSON file
 */
export const exportToJson = <T>(
  data: T[],
  filename: string,
  transformFn?: (item: T) => Record<string, unknown>
): void => {
  const exportPayload = transformFn ? data.map(transformFn) : data;
  const jsonContent = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const finalFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
  triggerDownload(blob, finalFilename);
};
