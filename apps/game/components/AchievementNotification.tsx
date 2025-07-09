'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { Achievement } from '@repo/shared';
import { TelegramService } from '@/services/telegram';

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

const tierColors = {
  bronze: 'from-orange-600 to-orange-700',
  silver: 'from-gray-400 to-gray-500',
  gold: 'from-yellow-500 to-yellow-600',
  platinum: 'from-purple-600 to-purple-700',
};

const tierTextColors = {
  bronze: 'text-orange-400',
  silver: 'text-gray-300',
  gold: 'text-yellow-400',
  platinum: 'text-purple-400',
};

export default function AchievementNotification({ achievement, onDismiss }: AchievementNotificationProps) {
  const telegram = TelegramService.getInstance();

  useEffect(() => {
    if (achievement) {
      // Haptic feedback when achievement unlocks
      telegram.hapticFeedback('notification');

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [achievement, onDismiss, telegram]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-sm"
        >
          <div className={`bg-gradient-to-r ${tierColors[achievement.tier]} rounded-lg shadow-2xl p-4`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Trophy className={`w-8 h-8 ${tierTextColors[achievement.tier]}`} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Достижение разблокировано!</h3>
                  <p className={`${tierTextColors[achievement.tier]} font-semibold`}>
                    {achievement.name}
                  </p>
                  <p className="text-white/90 text-sm mt-1">{achievement.description}</p>
                  {achievement.reward?.experience && (
                    <p className="text-white/80 text-xs mt-1">
                      +{achievement.reward.experience} XP
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onDismiss}
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Закрыть уведомление"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}