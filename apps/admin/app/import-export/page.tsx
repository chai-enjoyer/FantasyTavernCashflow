'use client';

import { useState } from 'react';
import { Download, Upload, FileJson } from 'lucide-react';
import { getAllCards, getAllNPCs, getGameConfig, batchImportGameData, processImportFile, validateImportData, generateImportSummary } from '@repo/firebase';
import { Card, NPC, GameConfig } from '@repo/shared';

interface GameContentExport {
  version: string;
  timestamp: string;
  cards: Card[];
  npcs: NPC[];
  config: GameConfig | null;
}

export default function ImportExportPage() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<string | null>(null);
  const [importData, setImportData] = useState<any>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const [cards, npcs, config] = await Promise.all([
        getAllCards(),
        getAllNPCs(),
        getGameConfig(),
      ]);

      const exportData: GameContentExport = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        cards,
        npcs,
        config,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fantasy-tavern-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rawData = JSON.parse(text);

      // Process and validate the import file
      const processedData = processImportFile(rawData);
      const validation = validateImportData(processedData);

      if (!validation.valid) {
        alert(`Validation failed:\n${validation.errors.join('\n')}`);
        event.target.value = '';
        return;
      }

      // Generate preview
      const summary = generateImportSummary(processedData);
      setImportPreview(summary);
      setImportData(processedData);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Failed to process file. Please check the file format.');
    } finally {
      event.target.value = '';
    }
  };

  const handleImport = async () => {
    if (!importData) return;

    setImporting(true);
    try {
      const result = await batchImportGameData(importData);
      
      if (result.success) {
        alert(`Import successful!\n\nImported:\n- ${result.details.cardsImported} cards\n- ${result.details.npcsImported} NPCs\n- Config: ${result.details.configUpdated ? 'Updated' : 'Not changed'}`);
        setImportPreview(null);
        setImportData(null);
      } else {
        alert(`Import failed:\n${result.errors.join('\n')}`);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Failed to import data');
    } finally {
      setImporting(false);
    }
  };

  const handleCancelImport = () => {
    setImportPreview(null);
    setImportData(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Import/Export</h1>

        <div className="space-y-6">
          <div className="admin-card">
            <div className="flex items-start gap-4 mb-4">
              <FileJson className="w-8 h-8 text-admin-primary" />
              <div>
                <h2 className="text-xl font-semibold mb-2">Export Game Content</h2>
                <p className="text-gray-400 mb-4">
                  Export all cards, NPCs, and game configuration to a JSON file.
                  This can be used for backups or transferring content between environments.
                </p>
              </div>
            </div>
            
            <button
              onClick={handleExport}
              disabled={exporting}
              className="admin-button flex items-center gap-2 w-full justify-center"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Export All Content'}
            </button>
          </div>

          <div className="admin-card">
            <div className="flex items-start gap-4 mb-4">
              <Upload className="w-8 h-8 text-admin-primary" />
              <div>
                <h2 className="text-xl font-semibold mb-2">Import Game Content</h2>
                <p className="text-gray-400 mb-4">
                  Import cards, NPCs, and configuration from a JSON file.
                  This will validate the file format before importing.
                </p>
              </div>
            </div>
            
            {!importPreview ? (
              <label className="admin-button flex items-center gap-2 w-full justify-center cursor-pointer">
                <Upload className="w-4 h-4" />
                Select File to Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="space-y-4">
                <div className="bg-admin-bg p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Import Preview</h3>
                  <pre className="text-sm text-gray-400 whitespace-pre-wrap">{importPreview}</pre>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="admin-button flex-1"
                  >
                    {importing ? 'Importing...' : 'Confirm Import'}
                  </button>
                  <button
                    onClick={handleCancelImport}
                    disabled={importing}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="admin-card">
            <h3 className="text-lg font-semibold mb-2">File Format</h3>
            <pre className="bg-admin-bg p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "cards": [...],
  "npcs": [...],
  "config": {...}
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}