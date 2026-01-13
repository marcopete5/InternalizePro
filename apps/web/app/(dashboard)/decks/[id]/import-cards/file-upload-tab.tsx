'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { parseSpreadsheet } from './parse-spreadsheet';
import type { ParseResult } from './types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface FileUploadTabProps {
  onParseComplete: (result: ParseResult) => void;
}

export function FileUploadTab({ onParseComplete }: FileUploadTabProps): React.JSX.Element {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      // Validate file type
      const validExtensions = ['.xlsx', '.csv', '.xls'];
      const hasValidExtension = validExtensions.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );

      if (!hasValidExtension) {
        setError('Please upload an Excel (.xlsx, .xls) or CSV file');
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setError('File size must be less than 5MB');
        return;
      }

      setIsParsing(true);
      try {
        const buffer = await file.arrayBuffer();
        const result = parseSpreadsheet(buffer, 'buffer');

        if (result.cards.length === 0 && result.errors.length === 0) {
          setError(
            'No valid cards found. Ensure your spreadsheet has Front and Back columns.'
          );
          return;
        }

        onParseComplete(result);
      } catch (err) {
        setError('Failed to parse file. Please check the format and try again.');
        console.error('Parse error:', err);
      } finally {
        setIsParsing(false);
      }
    },
    [onParseComplete]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        } ${isParsing ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.csv,.xls"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {isParsing ? (
          <>
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
            <p className="mt-4 text-sm text-gray-600">Parsing file...</p>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Upload className="h-6 w-6 text-gray-500" />
            </div>
            <p className="mt-4 text-sm font-medium text-gray-900">
              Drop your file here, or click to browse
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Supports .xlsx, .xls, and .csv files (max 5MB)
            </p>
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Format instructions */}
      <div className="mt-6 rounded-lg bg-gray-50 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <FileSpreadsheet className="h-4 w-4" />
          Expected format
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Your spreadsheet should have columns named <strong>Front</strong> and{' '}
          <strong>Back</strong>. Optionally include a <strong>Notes</strong> column.
        </p>
        <div className="mt-3 overflow-hidden rounded border border-gray-200 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 font-medium text-gray-600">Front</th>
                <th className="px-3 py-2 font-medium text-gray-600">Back</th>
                <th className="px-3 py-2 font-medium text-gray-600">Notes</th>
              </tr>
            </thead>
            <tbody className="text-gray-500">
              <tr className="border-t border-gray-100">
                <td className="px-3 py-2">What is 2+2?</td>
                <td className="px-3 py-2">4</td>
                <td className="px-3 py-2">Basic math</td>
              </tr>
              <tr className="border-t border-gray-100">
                <td className="px-3 py-2">Capital of France</td>
                <td className="px-3 py-2">Paris</td>
                <td className="px-3 py-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
