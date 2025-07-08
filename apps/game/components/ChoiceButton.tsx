'use client';

import { motion } from 'framer-motion';
import { AudioService } from '@/services/audio';

interface ChoiceButtonProps {
  text: string;
  onClick: () => void;
}

export default function ChoiceButton({ text, onClick }: ChoiceButtonProps) {
  const audio = AudioService.getInstance();

  const handleClick = () => {
    audio.playSound('buttonClick');
    onClick();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="w-full min-h-[48px] px-3 sm:px-4 py-3 bg-game-bg hover:bg-gray-900 active:bg-gray-800 border border-game-border rounded-md text-game-text text-left transition-colors text-sm sm:text-base"
    >
      {text}
    </motion.button>
  );
}