/**
 * Utility functions for exporting data to CSV format with UTF-8 BOM
 * for Excel compatibility with Vietnamese characters.
 */

export interface ExportColumn<T> {
  header: string;
  key: keyof T | ((item: T) => string | number | boolean | null | undefined);
}

export function convertToCsv<T>(data: T[], columns: ExportColumn<T>[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  const headers = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(',');

  const rows = data.map((item) => {
    return columns
      .map((col) => {
        let val: unknown;

        if (typeof col.key === 'function') {
          val = col.key(item);
        } else {
          val = item[col.key];
        }

        if (val === null || val === undefined) {
          return '""';
        }

        const stringVal = String(val);

        return `"${stringVal.replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  return [headers, ...rows].join('\r\n');
}

export function downloadCsv(csvContent: string, filename: string): boolean {
  if (typeof window === 'undefined') return false;

  // Add UTF-8 BOM so Excel opens Vietnamese characters correctly
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}
