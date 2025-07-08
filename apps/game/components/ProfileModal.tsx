'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Star, Award, BarChart3, Target, User as UserIcon } from 'lucide-react';
import { User } from '@repo/shared';
import { AchievementService } from '@/services/achievements';
import { TelegramService } from '@/services/telegram';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const tierColors = {
  bronze: 'bg-orange-600',
  silver: 'bg-gray-400',
  gold: 'bg-yellow-500',
  platinum: 'bg-purple-600',
};

export default function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  const achievementService = AchievementService.getInstance();
  const telegramService = TelegramService.getInstance();
  const telegramUser = telegramService.getUser();
  const levelInfo = achievementService.calculateLevel(user.experience);
  const achievementProgress = achievementService.getAchievementProgress(user.achievements);

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
              <h2 className="text-xl font-bold text-game-text">My Profile</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-game-bg rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Profile Header */}
              <div className="bg-game-bg rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    {telegramUser?.photo_url ? (
                      <img 
                        src={telegramUser.photo_url} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-8 h-8 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">
                      {telegramService.getFullName()}
                    </h3>
                    {telegramUser?.username && (
                      <p className="text-gray-400 text-sm truncate">@{telegramUser.username}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-white font-semibold">Level {levelInfo.level}</span>
                    </div>
                    <span className="text-gray-400 text-sm">
                      {levelInfo.currentExp}/{levelInfo.nextLevelExp} XP
                    </span>
                  </div>
                  
                  <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500"
                      style={{ width: `${(levelInfo.currentExp / levelInfo.nextLevelExp) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-game-bg rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  <h4 className="font-semibold text-white">Statistics</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-gray-400 text-xs">Games Played</p>
                    <p className="text-white font-bold">{user.statistics.gamesPlayed}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-xs">High Score</p>
                    <p className="text-yellow-400 font-bold">
                      {user.statistics.maxMoney.toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-xs">Longest Game</p>
                    <p className="text-white font-bold">{user.statistics.maxTurns} turns</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-xs">Total Decisions</p>
                    <p className="text-white font-bold">{user.statistics.totalDecisions}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-xs">Bankruptcies</p>
                    <p className="text-red-400 font-bold">{user.statistics.bankruptcies}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-xs">Play Time</p>
                    <p className="text-white font-bold">
                      {Math.floor(user.gameState.totalPlayTime / 60)}h {user.gameState.totalPlayTime % 60}m
                    </p>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-game-bg rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <h4 className="font-semibold text-white">Achievements</h4>
                  </div>
                  <div className="text-sm">
                    <span className="text-yellow-400 font-bold">
                      {achievementProgress.unlocked}
                    </span>
                    <span className="text-gray-400">/{achievementProgress.total}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-3">
                  {Object.entries(achievementProgress.byTier).map(([tier, data]) => (
                    <div key={tier} className="text-center">
                      <div className={`w-8 h-8 ${tierColors[tier as keyof typeof tierColors]} rounded-full mx-auto mb-1 flex items-center justify-center`}>
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xs text-gray-400 capitalize">{tier}</p>
                      <p className="text-xs font-bold text-white">{data.unlocked}/{data.total}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-800 rounded-full h-2 overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500"
                    style={{ width: `${achievementProgress.percentage}%` }}
                  />
                </div>

                {/* Recent Achievements */}
                {user.achievements.filter(a => a.unlockedAt).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 mb-1">Recent</p>
                    {user.achievements
                      .filter(a => a.unlockedAt)
                      .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
                      .slice(0, 3)
                      .map((achievement) => (
                        <div
                          key={achievement.id}
                          className="bg-gray-800 rounded-lg p-2 flex items-center gap-2"
                        >
                          <div className={`w-8 h-8 ${tierColors[achievement.tier]} rounded-full flex items-center justify-center flex-shrink-0`}>
                            <Trophy className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{achievement.name}</p>
                            <p className="text-gray-400 text-xs truncate">{achievement.description}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Account Info */}
              <div className="bg-game-bg rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-purple-400" />
                  <h4 className="font-semibold text-white">Account Info</h4>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created</span>
                    <span className="text-white">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {telegramUser?.is_premium && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status</span>
                      <span className="text-purple-400 font-semibold">Premium</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}