import * as XLSX from 'xlsx';
import type { ParseResult, ParsedCard, ParseError } from './types';

export function parseSpreadsheet(
  data: ArrayBuffer | string,
  type: 'buffer' | 'csv'
): ParseResult {
  let workbook: XLSX.WorkBook;

  if (type === 'buffer') {
    workbook = XLSX.read(data, { type: 'array' });
  } else {
    workbook = XLSX.read(data, { type: 'string' });
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { cards: [], errors: [{ rowNumber: 0, message: 'No sheets found in file' }], totalRows: 0 };
  }

  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    defval: '',
  });

  if (jsonData.length === 0) {
    return { cards: [], errors: [{ rowNumber: 0, message: 'Sheet is empty' }], totalRows: 0 };
  }

  // Check header row to determine column mapping
  const headerRow = jsonData[0] as string[];
  const columnMap = findColumnMapping(headerRow);

  const cards: ParsedCard[] = [];
  const errors: ParseError[] = [];

  // Start from row 1 (skip header)
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i] as string[];
    const front = String(row[columnMap.front] || '').trim();
    const back = String(row[columnMap.back] || '').trim();
    const notes = columnMap.notes !== -1 ? String(row[columnMap.notes] || '').trim() || undefined : undefined;

    // Skip completely empty rows
    if (!front && !back) {
      continue;
    }

    // Validate required fields
    if (!front) {
      errors.push({ rowNumber: i + 1, message: 'Missing front/question content' });
      continue;
    }

    if (!back) {
      errors.push({ rowNumber: i + 1, message: 'Missing back/answer content' });
      continue;
    }

    cards.push({ front, back, notes, rowNumber: i + 1 });
  }

  return {
    cards,
    errors,
    totalRows: jsonData.length - 1, // Exclude header
  };
}

interface ColumnMapping {
  front: number;
  back: number;
  notes: number;
}

function findColumnMapping(headerRow: string[]): ColumnMapping {
  const normalizedHeaders = headerRow.map((h) => String(h).toLowerCase().trim());

  // Try to find columns by common names
  const frontAliases = ['front', 'question', 'term', 'word', 'q', 'prompt'];
  const backAliases = ['back', 'answer', 'definition', 'meaning', 'a', 'response'];
  const notesAliases = ['notes', 'note', 'hint', 'hints', 'extra', 'context'];

  let frontIndex = normalizedHeaders.findIndex((h) => frontAliases.includes(h));
  let backIndex = normalizedHeaders.findIndex((h) => backAliases.includes(h));
  const notesIndex = normalizedHeaders.findIndex((h) => notesAliases.includes(h));

  // Default to columns A, B, C if headers not found
  if (frontIndex === -1) frontIndex = 0;
  if (backIndex === -1) backIndex = 1;

  return {
    front: frontIndex,
    back: backIndex,
    notes: notesIndex,
  };
}
