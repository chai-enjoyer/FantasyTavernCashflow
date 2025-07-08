'use client';

import { useEffect, useState } from 'react';
import { User } from '@repo/shared';
import { getUser } from '@repo/firebase';
import { TelegramService } from '@/services/telegram';
import { useTelegram } from '@/hooks/useTelegram';
import { AchievementService } from '@/services/achievements';
import { Trophy, Star, ArrowLeft, User as UserIcon, Award, BarChart3, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';

const tierColors = {
  bronze: 'bg-orange-600',
  silver: 'bg-gray-400',
  gold: 'bg-yellow-500',
  platinum: 'bg-purple-600',
};

export default function AccountPage() {
  const router = useRouter();
  const { isReady, telegram } = useTelegram();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const telegramService = TelegramService.getInstance();
  const achievementService = AchievementService.getInstance();

  useEffect(() => {
    const loadUserData = async () => {
      if (!isReady) return;
      
      try {
        const userId = telegramService.getUserId();
        if (!userId) {
          setError('User not found');
          setLoading(false);
          return;
        }

        const userData = await getUser(userId);
        if (!userData) {
          setError('User data not found');
          setLoading(false);
          return;
        }

        setUser(userData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load user data:', err);
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    loadUserData();
  }, [isReady]);

  if (!isReady || loading) {
    return <LoadingScreen />;
  }

  if (error || !user) {
    return <ErrorScreen error={error || 'User not found'} onRetry={() => router.push('/')} />;
  }

  const telegramUser = telegramService.getUser();
  const levelInfo = achievementService.calculateLevel(user.experience);
  const achievementProgress = achievementService.getAchievementProgress(user.achievements);
  
  return (
    <div className="min-h-screen bg-game-bg">
      <div className="bg-game-card border-b border-game-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white">My Account</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-game-card rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              {telegramUser?.photo_url ? (
                <img 
                  src={telegramUser.photo_url} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-10 h-10 text-white" />
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">
                {telegramService.getFullName()}
              </h2>
              {telegramUser?.username && (
                <p className="text-gray-400">@{telegramUser.username}</p>
              )}
              
              <div className="flex items-center gap-2 mt-3">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-semibold">Level {levelInfo.level}</span>
                <span className="text-gray-400 text-sm">
                  ({levelInfo.currentExp}/{levelInfo.nextLevelExp} XP)
                </span>
              </div>
              
              <div className="mt-3 bg-gray-800 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500"
                  style={{ width: `${(levelInfo.currentExp / levelInfo.nextLevelExp) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-game-card rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Game Statistics</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Games Played</p>
              <p className="text-2xl font-bold text-white">{user.statistics.gamesPlayed}</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">High Score</p>
              <p className="text-2xl font-bold text-yellow-400">
                {user.statistics.maxMoney.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Longest Game</p>
              <p className="text-2xl font-bold text-white">{user.statistics.maxTurns} turns</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Total Decisions</p>
              <p className="text-2xl font-bold text-white">{user.statistics.totalDecisions}</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Bankruptcies</p>
              <p className="text-2xl font-bold text-red-400">{user.statistics.bankruptcies}</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Total Play Time</p>
              <p className="text-2xl font-bold text-white">
                {Math.floor(user.gameState.totalPlayTime / 60)}h {user.gameState.totalPlayTime % 60}m
              </p>
            </div>
          </div>
        </div>

        <div className="bg-game-card rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Achievements</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 font-bold">
                {achievementProgress.unlocked}/{achievementProgress.total}
              </span>
              <span className="text-gray-400 text-sm">({achievementProgress.percentage}%)</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-4">
            {Object.entries(achievementProgress.byTier).map(([tier, data]) => (
              <div key={tier} className="text-center">
                <div className={`w-12 h-12 ${tierColors[tier as keyof typeof tierColors]} rounded-full mx-auto mb-2 flex items-center justify-center`}>
                  <Award className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-gray-400 capitalize">{tier}</p>
                <p className="text-sm font-bold text-white">{data.unlocked}/{data.total}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-800 rounded-full h-3 overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500"
              style={{ width: `${achievementProgress.percentage}%` }}
            />
          </div>

          <div className="grid gap-2">
            {user.achievements
              .filter(a => a.unlockedAt)
              .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
              .slice(0, 5)
              .map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-gray-800 rounded-lg p-3 flex items-center gap-3"
                >
                  <div className={`w-10 h-10 ${tierColors[achievement.tier]} rounded-full flex items-center justify-center`}>
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{achievement.name}</p>
                    <p className="text-gray-400 text-sm">{achievement.description}</p>
                  </div>
                </div>
              ))}
          </div>

          {user.achievements.filter(a => a.unlockedAt).length > 5 && (
            <p className="text-center text-gray-400 text-sm mt-4">
              And {user.achievements.filter(a => a.unlockedAt).length - 5} more achievements...
            </p>
          )}
        </div>

        <div className="bg-game-card rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Account Info</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Account Created</span>
              <span className="text-white">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Telegram ID</span>
              <span className="text-white font-mono text-sm">{user.telegramId}</span>
            </div>
            
            {telegramUser?.is_premium && (
              <div className="flex justify-between">
                <span className="text-gray-400">Account Type</span>
                <span className="text-purple-400 font-semibold">Premium</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}