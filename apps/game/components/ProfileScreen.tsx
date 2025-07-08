'use client';

import { User, Achievement } from '@repo/shared';
import { Trophy, Star, Target, Zap } from 'lucide-react';
import { AchievementService } from '@/services/achievements';

interface ProfileScreenProps {
  user: User;
  onClose: () => void;
}

const tierColors = {
  bronze: 'bg-orange-600',
  silver: 'bg-gray-400',
  gold: 'bg-yellow-500',
  platinum: 'bg-purple-600',
};

const tierBorderColors = {
  bronze: 'border-orange-600',
  silver: 'border-gray-400',
  gold: 'border-yellow-500',
  platinum: 'border-purple-600',
};

export default function ProfileScreen({ user, onClose }: ProfileScreenProps) {
  const achievementService = AchievementService.getInstance();
  const levelInfo = achievementService.calculateLevel(user.experience);
  const achievementProgress = achievementService.getAchievementProgress(user.achievements);

  const unlockedAchievements = user.achievements.filter(a => a.unlockedAt);
  const inProgressAchievements = user.achievements.filter(a => !a.unlockedAt);

  return (
    <div className="fixed inset-0 bg-black/80 z-40 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Player Profile</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{user.username?.[0]?.toUpperCase() || '?'}</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">{user.username || 'Anonymous Tavernkeeper'}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-white/90">Level {levelInfo.level}</span>
                <span className="text-white/70 text-sm">
                  ({levelInfo.currentExp}/{levelInfo.nextLevelExp} XP)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-white/10 rounded-lg h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
              style={{ width: `${(levelInfo.currentExp / levelInfo.nextLevelExp) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3">Statistics</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Games Played</p>
                <p className="text-white text-xl font-bold">{user.statistics.gamesPlayed}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Max Money</p>
                <p className="text-white text-xl font-bold">{user.statistics.maxMoney.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Longest Game</p>
                <p className="text-white text-xl font-bold">{user.statistics.maxTurns} turns</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Total Decisions</p>
                <p className="text-white text-xl font-bold">{user.statistics.totalDecisions}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-white">Achievements</h4>
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-white">
                  {achievementProgress.unlocked}/{achievementProgress.total}
                </span>
                <span className="text-gray-400 text-sm">({achievementProgress.percentage}%)</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {Object.entries(achievementProgress.byTier).map(([tier, data]) => (
                <div key={tier} className="text-center">
                  <div className={`w-8 h-8 ${tierColors[tier as keyof typeof tierColors]} rounded-full mx-auto mb-1`} />
                  <p className="text-xs text-gray-400 capitalize">{tier}</p>
                  <p className="text-sm text-white">{data.unlocked}/{data.total}</p>
                </div>
              ))}
            </div>

            {unlockedAchievements.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-400 mb-2">Unlocked</h5>
                <div className="grid grid-cols-1 gap-2">
                  {unlockedAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`bg-gray-800 border-2 ${tierBorderColors[achievement.tier]} rounded-lg p-3`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Trophy className={`w-5 h-5 ${tierColors[achievement.tier]} text-white rounded p-1`} />
                          <div>
                            <p className="text-white font-medium">{achievement.name}</p>
                            <p className="text-gray-400 text-sm">{achievement.description}</p>
                          </div>
                        </div>
                        <Zap className="w-5 h-5 text-yellow-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {inProgressAchievements.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-gray-400 mb-2">In Progress</h5>
                <div className="grid grid-cols-1 gap-2">
                  {inProgressAchievements.map((achievement) => (
                    <div key={achievement.id} className="bg-gray-800/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="w-5 h-5 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-gray-300 font-medium">{achievement.name}</p>
                          <p className="text-gray-500 text-sm">{achievement.description}</p>
                        </div>
                      </div>
                      {achievement.progress !== undefined && achievement.target && (
                        <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-blue-600"
                            style={{ width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}