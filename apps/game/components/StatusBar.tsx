'use client';

import { useState, useEffect } from 'react';
import { GameState, formatMoney, formatReputation, calculateRiskPercentage, EMOJI } from '@repo/shared';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StatusBarProps {
  gameState: GameState;
}

export default function StatusBar({ gameState }: StatusBarProps) {
  const router = useRouter();
  const riskPercentage = calculateRiskPercentage(gameState.reputation);
  const enemyCount = Object.values(gameState.npcRelationships).filter(rel => rel < -50).length;
  
  const [prevMoney, setPrevMoney] = useState(gameState.money);
  const [prevReputation, setPrevReputation] = useState(gameState.reputation);
  const [moneyChange, setMoneyChange] = useState(0);
  const [reputationChange, setReputationChange] = useState(0);

  useEffect(() => {
    if (gameState.money !== prevMoney) {
      setMoneyChange(gameState.money - prevMoney);
      setPrevMoney(gameState.money);
      setTimeout(() => setMoneyChange(0), 2000);
    }
  }, [gameState.money, prevMoney]);

  useEffect(() => {
    if (gameState.reputation !== prevReputation) {
      setReputationChange(gameState.reputation - prevReputation);
      setPrevReputation(gameState.reputation);
      setTimeout(() => setReputationChange(0), 2000);
    }
  }, [gameState.reputation, prevReputation]);

  return (
    <div className="bg-game-card border-b border-game-border px-3 sm:px-4 py-2 sm:py-3">
      <div className="flex justify-between items-center gap-2">
        <div className="relative flex-1">
          <motion.div
            key={`money-${gameState.money}`}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-1 sm:gap-2"
          >
            <span className="text-base sm:text-lg">{EMOJI.MONEY}</span>
            <span className="text-game-text font-bold text-sm sm:text-base">{formatMoney(gameState.money)}</span>
          </motion.div>
          
          <AnimatePresence>
            {moneyChange !== 0 && (
              <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: -20 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                className={`absolute -top-6 left-0 right-0 text-center text-sm font-bold ${
                  moneyChange > 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {moneyChange > 0 ? '+' : ''}{formatMoney(moneyChange)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative flex-1">
          <motion.div
            key={`reputation-${gameState.reputation}`}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-1 sm:gap-2 justify-center"
          >
            <span className="text-base sm:text-lg">{EMOJI.REPUTATION}</span>
            <span className={`font-bold text-sm sm:text-base ${
              gameState.reputation > 0 ? 'text-game-success' : 
              gameState.reputation < 0 ? 'text-game-danger' : 
              'text-game-text'
            }`}>
              {formatReputation(gameState.reputation)}
            </span>
          </motion.div>
          
          <AnimatePresence>
            {reputationChange !== 0 && (
              <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: -20 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                className={`absolute -top-6 left-0 right-0 text-center text-sm font-bold ${
                  reputationChange > 0 ? 'text-blue-400' : 'text-orange-400'
                }`}
              >
                {reputationChange > 0 ? '+' : ''}{reputationChange}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-end">
          <span className="text-base sm:text-lg">{EMOJI.RISK}</span>
          <span className={`font-bold text-sm sm:text-base ${
            riskPercentage > 50 ? 'text-game-danger' :
            riskPercentage > 30 ? 'text-yellow-500' :
            'text-game-text'
          }`}>
            {riskPercentage}%
          </span>
        </div>

        {enemyCount > 0 && (
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-base sm:text-lg">{EMOJI.ENEMY}</span>
            <span className="text-game-danger font-bold text-sm sm:text-base">{enemyCount}</span>
          </div>
        )}
      </div>

      <div className="mt-1 flex items-center justify-between">
        <div className="text-xs text-gray-400">
          Turn {gameState.turn}
        </div>
        
        <button
          onClick={() => router.push('/account')}
          className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          aria-label="View Account"
        >
          <User className="w-4 h-4 text-gray-300" />
        </button>
      </div>
    </div>
  );
}