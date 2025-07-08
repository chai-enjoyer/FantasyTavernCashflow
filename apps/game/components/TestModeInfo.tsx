'use client';

import { motion } from 'framer-motion';
import { Beaker, AlertCircle, Play } from 'lucide-react';

interface TestModeInfoProps {
  onStartTest: () => void;
}

export default function TestModeInfo({ onStartTest }: TestModeInfoProps) {
  return (
    <div className="min-h-screen bg-game-bg flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-game-card border border-game-border rounded-xl p-6 space-y-6"
      >
        <div className="text-center">
          <Beaker className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-game-text mb-2">Browser Test Mode</h1>
          <p className="text-gray-400">Test the game without Telegram</p>
        </div>

        <div className="space-y-4">
          <div className="bg-game-bg rounded-lg p-4 border border-game-border">
            <h2 className="text-lg font-semibold text-game-text mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Test Mode Features
            </h2>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• No Telegram app required</li>
              <li>• Debug panel with console logs</li>
              <li>• Mock user data for testing</li>
              <li>• Export logs for debugging</li>
              <li>• Full game functionality</li>
            </ul>
          </div>

          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <p className="text-sm text-blue-300">
              <strong>Note:</strong> Progress in test mode is temporary. For the full experience with saved progress, please use the Telegram app.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onStartTest}
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Start Test Mode
          </button>
          
          <a
            href="https://t.me/FantasyTavernCashflowBot"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-game-bg hover:bg-gray-800 text-game-text font-semibold rounded-lg transition-colors border border-game-border block text-center"
          >
            Open in Telegram
          </a>
        </div>
      </motion.div>
    </div>
  );
}