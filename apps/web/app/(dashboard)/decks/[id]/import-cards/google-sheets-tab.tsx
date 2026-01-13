'use client';

import { useState, useCallback } from 'react';
import { Link2, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { parseSpreadsheet } from './parse-spreadsheet';
import type { ParseResult } from './types';

interface GoogleSheetsTabProps {
  onParseComplete: (result: ParseResult) => void;
}

export function GoogleSheetsTab({ onParseComplete }: GoogleSheetsTabProps): React.JSX.Element {
  const [url, setUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractSheetId = (inputUrl: string): string | null => {
    // Match various Google Sheets URL formats
    const patterns = [
      /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
      /^([a-zA-Z0-9-_]+)$/, // Just the ID
    ];

    for (const pattern of patterns) {
      const match = inputUrl.match(pattern);
      if (match) return match[1];
    }

    return null;
  };

  const handleImport = useCallback(async () => {
    setError(null);

    if (!url.trim()) {
      setError('Please enter a Google Sheets URL');
      return;
    }

    const sheetId = extractSheetId(url.trim());
    if (!sheetId) {
      setError('Invalid Google Sheets URL. Please paste the full URL from your browser.');
      return;
    }

    setIsFetching(true);
    try {
      // Use the CSV export URL
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      const response = await fetch(csvUrl);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Sheet not found. Make sure the URL is correct.');
        }
        throw new Error('Failed to fetch sheet. Make sure it is publicly accessible.');
      }

      const csvText = await response.text();

      // Check if we got an HTML response (usually means auth required)
      if (csvText.trim().startsWith('<!DOCTYPE') || csvText.trim().startsWith('<html')) {
        throw new Error(
          'Cannot access this sheet. Please make sure it is set to "Anyone with the link can view".'
        );
      }

      const result = parseSpreadsheet(csvText, 'csv');

      if (result.cards.length === 0 && result.errors.length === 0) {
        setError(
          'No valid cards found. Ensure your spreadsheet has Front and Back columns.'
        );
        return;
      }

      onParseComplete(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch Google Sheet';
      setError(message);
      console.error('Fetch error:', err);
    } finally {
      setIsFetching(false);
    }
  }, [url, onParseComplete]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isFetching) {
      handleImport();
    }
  };

  return (
    <div>
      {/* URL input */}
      <div>
        <label htmlFor="sheets-url" className="block text-sm font-medium text-gray-700">
          Google Sheets URL
        </label>
        <div className="mt-2 flex gap-2">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Link2 className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="sheets-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              disabled={isFetching}
            />
          </div>
          <button
            onClick={handleImport}
            disabled={isFetching || !url.trim()}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFetching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Fetching...
              </>
            ) : (
              'Import'
            )}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 rounded-lg bg-blue-50 p-4">
        <h4 className="text-sm font-medium text-blue-900">How to share your Google Sheet</h4>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-blue-800">
          <li>Open your Google Sheet</li>
          <li>
            Click <strong>Share</strong> (top right)
          </li>
          <li>
            Under &quot;General access&quot;, select{' '}
            <strong>&quot;Anyone with the link&quot;</strong>
          </li>
          <li>Copy the URL and paste it above</li>
        </ol>
        <a
          href="https://support.google.com/docs/answer/2494822"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800"
        >
          Learn more about sharing
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Format reminder */}
      <p className="mt-4 text-xs text-gray-500">
        Your sheet should have <strong>Front</strong> and <strong>Back</strong> columns,
        with an optional <strong>Notes</strong> column.
      </p>
    </div>
  );
}
