export interface ParsedCard {
  front: string;
  back: string;
  notes?: string;
  rowNumber: number;
}

export interface ParseError {
  rowNumber: number;
  message: string;
}

export interface ParseResult {
  cards: ParsedCard[];
  errors: ParseError[];
  totalRows: number;
}

export type ImportSource = 'file' | 'google-sheets';

export type ImportStep = 'select' | 'preview' | 'importing' | 'complete';

export interface ImportState {
  step: ImportStep;
  source: ImportSource | null;
  parseResult: ParseResult | null;
  importError: string | null;
}
