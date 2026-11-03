export type CsvColumn<T> = { header: string; value: (row: T) => string | number | null };

/**
 * RFC 4180 CSV. Cells that a spreadsheet would run as a formula (starting with
 * = + - @, tab or carriage return) are prefixed with an apostrophe, because
 * booking fields such as names and messages are typed by the public.
 */
export function escapeCsvCell(value: string | number | null): string {
  if (value === null) return "";
  let text = String(value);
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv<T>(rows: readonly T[], columns: readonly CsvColumn<T>[]): string {
  const lines = [
    columns.map((c) => escapeCsvCell(c.header)).join(","),
    ...rows.map((row) => columns.map((c) => escapeCsvCell(c.value(row))).join(",")),
  ];
  // BOM so Excel opens UTF-8 (names with accents) correctly.
  return `﻿${lines.join("\r\n")}\r\n`;
}
