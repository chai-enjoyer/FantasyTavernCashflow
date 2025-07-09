'use client';

import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { hasParameterBooster } from '@/utils/cardHelpers';

interface ParameterHintProps {
  userId: string;
}

export default function ParameterHint({ userId }: ParameterHintProps) {
  const showParameters = hasParameterBooster(userId);
  
  if (showParameters) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-xs text-green-400 bg-green-900/20 px-3 py-1.5 rounded-full"
      >
        <Eye className="w-3 h-3" />
        <span>Параметры видны</span>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-full"
      title="Купите бустер, чтобы увидеть точные значения"
    >
      <EyeOff className="w-3 h-3" />
      <span>Параметры скрыты</span>
    </motion.div>
  );
}

export function ParameterLockIcon() {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      className="inline-flex items-center justify-center w-4 h-4 text-gray-500"
      title="Значение скрыто - требуется бустер"
    >
      <Lock className="w-3 h-3" />
    </motion.span>
  );
}