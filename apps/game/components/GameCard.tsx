'use client';

import { useEffect } from 'react';
import { Card, NPC, EMOJI } from '@repo/shared';
import { motion } from 'framer-motion';
import ChoiceButton from './ChoiceButton';
import NPCPortrait from './NPCPortrait';
import { AudioService } from '@/services/audio';
import { TelegramService } from '@/services/telegram';
import { cardVariants, staggerContainer, staggerItem } from '@/utils/animations';
import { hasParameterBooster } from '@/utils/cardHelpers';

interface GameCardProps {
  card: Card;
  npc: NPC;
  onChoice: (choiceIndex: 0 | 1 | 2 | 3) => void;
}

export default function GameCard({ card, npc, onChoice }: GameCardProps) {
  const relationshipLevel = 0; // This would come from game state
  const audio = AudioService.getInstance();
  const telegram = TelegramService.getInstance();
  
  // Check if user has booster to see NPC parameters
  const userId = telegram.getUserId();
  const showNPCParameters = hasParameterBooster(userId);

  useEffect(() => {
    // Play card flip sound when new card appears
    audio.playSound('cardFlip');
    
    // Play special sound for certain NPCs
    audio.playSpecialSound(npc.class);
  }, [card.id, npc.class, audio]);
  
  return (
    <motion.div
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="max-w-md mx-auto"
    >
      <div className="bg-game-card rounded-lg border border-game-border p-4 sm:p-6 shadow-2xl">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-[200px] mx-auto"
        >
          <NPCPortrait npc={npc} emotion="neutral" />
        </motion.div>
        
        <motion.div className="mt-4" variants={staggerContainer} initial="initial" animate="animate">
          <motion.h2 variants={staggerItem} className="text-lg sm:text-xl font-bold text-game-text mb-2 text-center">
            {npc.name}
          </motion.h2>
          
          <motion.div variants={staggerItem} className="flex items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm mb-4 flex-wrap">
            {showNPCParameters && (
              <div className="flex items-center gap-1">
                <span className="text-game-gold">{'⭐'.repeat(npc.wealth)}</span>
                <span className="text-gray-400">Wealth</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <span>{relationshipLevel >= 0 ? EMOJI.FRIEND : EMOJI.ENEMY}</span>
              <span className="text-gray-400">{Math.abs(relationshipLevel)}</span>
            </div>
            
            {showNPCParameters && (
              <div className="flex items-center gap-1">
                <span className="text-gray-400">Reliability:</span>
                <span className="text-game-text">{npc.reliability}%</span>
              </div>
            )}
          </motion.div>
          
          <motion.p variants={staggerItem} className="text-game-text text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">
            {card.situation}
          </motion.p>
          
          <motion.div variants={staggerContainer} className="space-y-2 sm:space-y-3">
            {card.options.map((option, index) => (
              <motion.div key={index} variants={staggerItem}>
                <ChoiceButton
                  text={option.text}
                  onClick={() => onChoice(index as 0 | 1 | 2 | 3)}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}