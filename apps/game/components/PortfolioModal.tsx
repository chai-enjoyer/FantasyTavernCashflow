'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Award, AlertTriangle, Users, Coins, Star } from 'lucide-react';
import { GameState, formatMoney, formatReputation, calculateRiskPercentage, EMOJI } from '@repo/shared';

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
}

export default function PortfolioModal({ isOpen, onClose, gameState }: PortfolioModalProps) {
  const totalIncome = gameState.passiveIncome.reduce((sum, income) => sum + income.amount, 0);
  const totalDebt = gameState.debts.reduce((sum, debt) => sum + debt.paymentPerTurn, 0);
  const netIncome = totalIncome - totalDebt;
  const enemyCount = Object.values(gameState.npcRelationships).filter(rel => rel < -50).length;
  const friendCount = Object.values(gameState.npcRelationships).filter(rel => rel > 50).length;
  const riskPercentage = calculateRiskPercentage(gameState.reputation);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed inset-4 bg-game-card border border-game-border rounded-xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-4 border-b border-game-border flex justify-between items-center">
              <h2 className="text-xl font-bold text-game-text">Обзор портфолио</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-game-bg rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Financial Overview */}
              <div className="bg-game-bg rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-500" />
                  Финансовое состояние
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Текущее золото</span>
                    <span className="font-bold text-game-text">{formatMoney(gameState.money)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Пассивный доход</span>
                    <span className="font-bold text-green-400">+{formatMoney(totalIncome)}/ход</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Выплаты по долгам</span>
                    <span className="font-bold text-red-400">-{formatMoney(totalDebt)}/ход</span>
                  </div>
                  <div className="flex justify-between border-t border-game-border pt-2 mt-2">
                    <span className="text-gray-400">Чистый доход</span>
                    <span className={`font-bold ${netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {netIncome >= 0 ? '+' : ''}{formatMoney(netIncome)}/ход
                    </span>
                  </div>
                </div>
              </div>

              {/* Reputation & Risk */}
              <div className="bg-game-bg rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-blue-500" />
                  Репутация и риск
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Репутация</span>
                    <span className={`font-bold ${
                      gameState.reputation > 0 ? 'text-blue-400' : 
                      gameState.reputation < 0 ? 'text-orange-400' : 
                      'text-game-text'
                    }`}>
                      {formatReputation(gameState.reputation)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Уровень риска</span>
                    <span className={`font-bold ${
                      riskPercentage > 50 ? 'text-red-400' :
                      riskPercentage > 30 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {riskPercentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Relationships */}
              <div className="bg-game-bg rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  Отношения
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Друзья</span>
                    <span className="font-bold text-green-400">{friendCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Враги</span>
                    <span className="font-bold text-red-400">{enemyCount}</span>
                  </div>
                </div>
              </div>

              {/* Active Effects */}
              {gameState.temporaryEffects.length > 0 && (
                <div className="bg-game-bg rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Активные эффекты
                  </h3>
                  <div className="space-y-2">
                    {gameState.temporaryEffects.map((effect, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-400">{effect.description}</span>
                        <span className="font-bold text-game-text">{effect.turnsRemaining} ходов</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Passive Income Detail */}
              {gameState.passiveIncome.length > 0 && (
                <div className="bg-game-bg rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Источники дохода
                  </h3>
                  <div className="space-y-2">
                    {gameState.passiveIncome.map((income) => (
                      <div key={income.id} className="flex justify-between text-sm">
                        <span className="text-gray-400">{income.description}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-green-400">+{formatMoney(income.amount)}</span>
                          <span className="text-xs text-gray-500">(осталось {income.remainingTurns || 'Постоянно'})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Debts Detail */}
              {gameState.debts.length > 0 && (
                <div className="bg-game-bg rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-red-500" />
                    Долги
                  </h3>
                  <div className="space-y-2">
                    {gameState.debts.map((debt) => (
                      <div key={debt.id} className="flex justify-between text-sm">
                        <span className="text-gray-400">{debt.creditorId}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-red-400">-{formatMoney(debt.paymentPerTurn)}</span>
                          <span className="text-xs text-gray-500">(осталось {debt.turnsRemaining})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Game Stats */}
              <div className="bg-game-bg rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Прогресс игры
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Текущий ход</span>
                    <span className="font-bold text-game-text">{gameState.turn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Карт сыграно</span>
                    <span className="font-bold text-game-text">{gameState.turn - 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Активные флаги</span>
                    <span className="font-bold text-game-text">{gameState.flags.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}