'use client';

import { useEffect } from 'react';
import { Card, NPC, GameState, formatMoney, formatReputation, EMOJI } from '@repo/shared';
import { motion, AnimatePresence } from 'framer-motion';
import NPCPortrait from './NPCPortrait';
import { AudioService } from '@/services/audio';

interface ResultScreenProps {
  card: Card;
  npc: NPC;
  choiceIndex: 0 | 1 | 2 | 3;
  previousState: GameState;
  newState: GameState;
  onContinue: () => void;
}

export default function ResultScreen({
  card,
  npc,
  choiceIndex,
  previousState,
  newState,
  onContinue,
}: ResultScreenProps) {
  const choice = card.options[choiceIndex];
  const consequences = choice.consequences;
  const audio = AudioService.getInstance();
  
  const moneyChange = newState.money - previousState.money;
  const reputationChange = newState.reputation - previousState.reputation;

  useEffect(() => {
    // Play appropriate sounds based on consequences
    if (moneyChange !== 0) {
      audio.playMoneyChange(moneyChange);
    }
    
    // Play NPC emotion sound
    audio.playNPCSound(choice.npcEmotion);
  }, [moneyChange, choice.npcEmotion, audio]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15 }}
      className="max-w-md mx-auto"
    >
      <div className="bg-game-card rounded-lg border border-game-border p-6">
        <NPCPortrait npc={npc} emotion={choice.npcEmotion} />
        
        <div className="mt-4">
          <h2 className="text-xl font-bold text-game-text mb-4">{npc.name}</h2>
          
          <p className="text-game-text text-base mb-6 leading-relaxed italic">
            "{choice.resultText}"
          </p>
          
          <div className="space-y-3 mb-6">
            <AnimatePresence>
              {moneyChange !== 0 && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{EMOJI.MONEY}</span>
                    <span className="text-game-text">Деньги</span>
                  </span>
                  <span className={`font-bold ${
                    moneyChange > 0 ? 'text-game-success' : 'text-game-danger'
                  }`}>
                    {moneyChange > 0 ? '+' : ''}{formatMoney(moneyChange)}
                  </span>
                </motion.div>
              )}
              
              {reputationChange !== 0 && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{EMOJI.REPUTATION}</span>
                    <span className="text-game-text">Репутация</span>
                  </span>
                  <span className={`font-bold ${
                    reputationChange > 0 ? 'text-game-success' : 'text-game-danger'
                  }`}>
                    {reputationChange > 0 ? '+' : ''}{reputationChange}
                  </span>
                </motion.div>
              )}
              
              {consequences.npcRelationship && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{EMOJI.FRIEND}</span>
                    <span className="text-game-text">Отношения</span>
                  </span>
                  <span className={`font-bold ${
                    consequences.npcRelationship.change > 0 ? 'text-game-success' : 'text-game-danger'
                  }`}>
                    {consequences.npcRelationship.change > 0 ? '+' : ''}{consequences.npcRelationship.change}
                  </span>
                </motion.div>
              )}
              
              {consequences.passiveIncome && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{EMOJI.INCOME}</span>
                    <span className="text-game-text">Новый доход</span>
                  </span>
                  <span className="text-game-success font-bold">
                    +{formatMoney(consequences.passiveIncome.amount)}/ход
                  </span>
                </motion.div>
              )}
              
              {consequences.debt && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{EMOJI.DEBT}</span>
                    <span className="text-game-text">Новый долг</span>
                  </span>
                  <span className="text-game-danger font-bold">
                    -{formatMoney(consequences.debt.paymentPerTurn)}/ход
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onContinue}
            className="w-full py-3 bg-game-gold hover:bg-yellow-600 text-black font-bold rounded-md transition-colors"
          >
            Продолжить
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}