'use client';

import { GameState, formatMoney } from '@repo/shared';
import { motion } from 'framer-motion';

interface GameOverScreenProps {
  gameState: GameState;
  onRestart: () => void;
}

export default function GameOverScreen({ gameState, onRestart }: GameOverScreenProps) {
  return (
    <div className="game-container flex items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-game-card rounded-lg border border-game-border p-8 text-center">
          <h1 className="text-3xl font-bold text-game-danger mb-4">Bankruptcy!</h1>
          
          <p className="text-game-text text-lg mb-8">
            Your tavern has run out of money. The adventure ends here...
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="bg-game-bg rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Final Turn</p>
              <p className="text-2xl font-bold text-game-text">{gameState.turn}</p>
            </div>
            
            <div className="bg-game-bg rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Final Reputation</p>
              <p className="text-2xl font-bold text-game-text">{gameState.reputation}</p>
            </div>
            
            <div className="bg-game-bg rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Active Businesses</p>
              <p className="text-2xl font-bold text-game-text">{gameState.passiveIncome.length}</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRestart}
            className="w-full py-3 bg-game-gold hover:bg-yellow-600 text-black font-bold rounded-md transition-colors"
          >
            Start New Game
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}