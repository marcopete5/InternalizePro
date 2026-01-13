'use client';

import { useState, useCallback, useEffect } from 'react';
import { X, FileSpreadsheet, Link2 } from 'lucide-react';
import { FileUploadTab } from './file-upload-tab';
import { GoogleSheetsTab } from './google-sheets-tab';
import { ImportPreview } from './import-preview';
import type { ImportState, ParseResult } from './types';

interface ImportCardsModalProps {
  deckId: string;
  onClose: () => void;
}

export function ImportCardsModal({ deckId, onClose }: ImportCardsModalProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [state, setState] = useState<ImportState>({
    step: 'select',
    source: null,
    parseResult: null,
    importError: null,
  });

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleParseComplete = useCallback((result: ParseResult) => {
    setState((prev) => ({
      ...prev,
      step: 'preview',
      parseResult: result,
    }));
  }, []);

  const handleBack = useCallback(() => {
    setState({
      step: 'select',
      source: null,
      parseResult: null,
      importError: null,
    });
  }, []);

  // Render preview step
  if (state.step === 'preview' && state.parseResult) {
    return (
      <ImportPreview
        deckId={deckId}
        parseResult={state.parseResult}
        onBack={handleBack}
        onClose={onClose}
      />
    );
  }

  // Render selection step
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Import cards</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('file')}
            className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === 'file'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Upload File
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === 'url'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Link2 className="h-4 w-4" />
            Google Sheets
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'file' ? (
          <FileUploadTab onParseComplete={handleParseComplete} />
        ) : (
          <GoogleSheetsTab onParseComplete={handleParseComplete} />
        )}
      </div>
    </div>
  );
}
