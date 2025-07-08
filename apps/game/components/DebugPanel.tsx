'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, X, Trash2, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { GameState, Card } from '@repo/shared';

interface LogEntry {
  timestamp: string;
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  data?: any;
}

interface DebugPanelProps {
  gameState: GameState | null;
  currentCard: Card | null;
  isTestMode: boolean;
}

export default function DebugPanel({ gameState, currentCard, isTestMode }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isTestMode) return;

    // Intercept console methods
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;

    const addLog = (level: LogEntry['level'], ...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        level,
        message,
        data: args.length > 1 ? args.slice(1) : undefined
      }]);
    };

    console.log = (...args) => {
      originalLog.apply(console, args);
      addLog('log', ...args);
    };

    console.warn = (...args) => {
      originalWarn.apply(console, args);
      addLog('warn', ...args);
    };

    console.error = (...args) => {
      originalError.apply(console, args);
      addLog('error', ...args);
    };

    console.info = (...args) => {
      originalInfo.apply(console, args);
      addLog('info', ...args);
    };

    // Initial log
    console.log('🧪 Debug Panel Initialized');

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      console.info = originalInfo;
    };
  }, [isTestMode]);

  useEffect(() => {
    // Auto-scroll to bottom when new logs are added
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const clearLogs = () => setLogs([]);

  const exportLogs = () => {
    const data = {
      timestamp: new Date().toISOString(),
      logs,
      gameState,
      currentCard
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-300';
    }
  };

  if (!isTestMode) return null;

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg transition-colors"
      >
        <Bug className="w-6 h-6 text-white" />
      </motion.button>

      {/* Debug Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className={`fixed bottom-20 right-4 z-50 w-96 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl ${
              isMinimized ? 'h-auto' : 'h-96'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-700">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Bug className="w-4 h-4" />
                Debug Panel
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-gray-800 rounded transition-colors"
                >
                  {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button
                  onClick={exportLogs}
                  className="p-1 hover:bg-gray-800 rounded transition-colors"
                  title="Export logs"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={clearLogs}
                  className="p-1 hover:bg-gray-800 rounded transition-colors"
                  title="Clear logs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-800 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Game State Info */}
                <div className="p-3 border-b border-gray-700 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-400">Turn:</span>{' '}
                      <span className="text-white">{gameState?.turn || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Money:</span>{' '}
                      <span className="text-white">{gameState?.money || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Reputation:</span>{' '}
                      <span className="text-white">{gameState?.reputation || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Card:</span>{' '}
                      <span className="text-white">{currentCard?.id || 'None'}</span>
                    </div>
                  </div>
                </div>

                {/* Logs */}
                <div className="flex-1 overflow-y-auto p-3 max-h-60">
                  {logs.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center">No logs yet...</p>
                  ) : (
                    <div className="space-y-1">
                      {logs.map((log, index) => (
                        <div key={index} className="text-xs font-mono">
                          <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                          <span className={getLogColor(log.level)}>[{log.level.toUpperCase()}]</span>{' '}
                          <span className="text-gray-300 break-words">{log.message}</span>
                        </div>
                      ))}
                      <div ref={logEndRef} />
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}