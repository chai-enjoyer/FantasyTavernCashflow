import { Achievement, AchievementType, GameState, UserStatistics } from '@repo/shared';

interface AchievementDefinition {
  id: string;
  type: AchievementType;
  name: string;
  description: string;
  tiers: {
    bronze: { target: number; experience: number };
    silver: { target: number; experience: number };
    gold: { target: number; experience: number };
    platinum: { target: number; experience: number };
  };
}

const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'money_master',
    type: 'money_earned',
    name: 'Мастер Денег',
    description: 'Накопить всего {target} золота',
    tiers: {
      bronze: { target: 50000, experience: 100 },
      silver: { target: 200000, experience: 250 },
      gold: { target: 1000000, experience: 500 },
      platinum: { target: 5000000, experience: 1000 },
    },
  },
  {
    id: 'survivor',
    type: 'turns_survived',
    name: 'Выживший',
    description: 'Продержаться {target} ходов в одной игре',
    tiers: {
      bronze: { target: 20, experience: 100 },
      silver: { target: 50, experience: 250 },
      gold: { target: 100, experience: 500 },
      platinum: { target: 200, experience: 1000 },
    },
  },
  {
    id: 'reputation_legend',
    type: 'reputation_max',
    name: 'Легенда Репутации',
    description: 'Достичь {target} репутации',
    tiers: {
      bronze: { target: 50, experience: 100 },
      silver: { target: 100, experience: 250 },
      gold: { target: 200, experience: 500 },
      platinum: { target: 500, experience: 1000 },
    },
  },
  {
    id: 'decision_maker',
    type: 'decisions_made',
    name: 'Принимающий Решения',
    description: 'Принять {target} решений',
    tiers: {
      bronze: { target: 50, experience: 50 },
      silver: { target: 200, experience: 150 },
      gold: { target: 1000, experience: 300 },
      platinum: { target: 5000, experience: 600 },
    },
  },
  {
    id: 'veteran_tavernkeeper',
    type: 'games_played',
    name: 'Ветеран Таверны',
    description: 'Сыграть {target} игр',
    tiers: {
      bronze: { target: 5, experience: 50 },
      silver: { target: 25, experience: 150 },
      gold: { target: 100, experience: 300 },
      platinum: { target: 500, experience: 600 },
    },
  },
  {
    id: 'dragon_whisperer',
    type: 'dragon_friend',
    name: 'Укротитель Драконов',
    description: 'Максимальные отношения с драконом',
    tiers: {
      bronze: { target: 1, experience: 500 },
      silver: { target: 1, experience: 500 },
      gold: { target: 1, experience: 500 },
      platinum: { target: 1, experience: 500 },
    },
  },
];

export class AchievementService {
  private static instance: AchievementService;

  private constructor() {}

  public static getInstance(): AchievementService {
    if (!AchievementService.instance) {
      AchievementService.instance = new AchievementService();
    }
    return AchievementService.instance;
  }

  private getTierName(tier: 'bronze' | 'silver' | 'gold' | 'platinum'): string {
    const tierNames = {
      bronze: 'Бронза',
      silver: 'Серебро',
      gold: 'Золото',
      platinum: 'Платина'
    };
    return tierNames[tier];
  }

  public checkAchievements(
    currentAchievements: Achievement[],
    gameState: GameState,
    statistics: UserStatistics
  ): { newAchievements: Achievement[]; updatedAchievements: Achievement[] } {
    const newAchievements: Achievement[] = [];
    const updatedAchievements: Achievement[] = [];

    for (const definition of ACHIEVEMENTS) {
      const progress = this.calculateProgress(definition.type, gameState, statistics);
      
      // Check each tier
      for (const tier of ['bronze', 'silver', 'gold', 'platinum'] as const) {
        const achievementId = `${definition.id}_${tier}`;
        const existing = currentAchievements.find(a => a.id === achievementId);
        const tierData = definition.tiers[tier];

        if (!existing && progress >= tierData.target) {
          // New achievement unlocked!
          newAchievements.push({
            id: achievementId,
            type: definition.type,
            tier,
            name: `${definition.name} ${this.getTierName(tier)}`,
            description: definition.description.replace('{target}', tierData.target.toString()),
            unlockedAt: new Date(),
            progress: progress,
            target: tierData.target,
            reward: {
              experience: tierData.experience,
              badge: `${definition.id}_${tier}_badge`,
            },
          });
        } else if (existing && !existing.unlockedAt && existing.progress !== progress) {
          // Update progress for existing achievement
          updatedAchievements.push({
            ...existing,
            progress,
          });
        }
      }
    }

    return { newAchievements, updatedAchievements };
  }

  private calculateProgress(
    type: AchievementType,
    gameState: GameState,
    statistics: UserStatistics
  ): number {
    switch (type) {
      case 'money_earned':
        return statistics.maxMoney;
      case 'turns_survived':
        return statistics.maxTurns;
      case 'reputation_max':
        return gameState.reputation;
      case 'decisions_made':
        return statistics.totalDecisions;
      case 'games_played':
        return statistics.gamesPlayed;
      case 'bankruptcies':
        return statistics.bankruptcies;
      case 'dragon_friend':
        return gameState.npcRelationships['dragon'] || 0;
      case 'noble_patron':
        return gameState.npcRelationships['noble'] || 0;
      case 'crime_syndicate':
        return gameState.npcRelationships['crime_boss'] || 0;
      case 'tavern_chain':
        return gameState.passiveIncome.length;
      default:
        return 0;
    }
  }

  public calculateLevel(experience: number): { level: number; currentExp: number; nextLevelExp: number } {
    // Simple exponential leveling system
    let level = 1;
    let totalExpNeeded = 0;
    let expPerLevel = 100;

    while (totalExpNeeded <= experience) {
      level++;
      expPerLevel = Math.floor(expPerLevel * 1.2);
      totalExpNeeded += expPerLevel;
    }

    level--;
    const currentLevelExp = totalExpNeeded - expPerLevel;
    const currentExp = experience - currentLevelExp;
    const nextLevelExp = expPerLevel;

    return { level, currentExp, nextLevelExp };
  }

  public getAchievementProgress(achievements: Achievement[]): {
    total: number;
    unlocked: number;
    percentage: number;
    byTier: Record<string, { total: number; unlocked: number }>;
  } {
    const totalPossible = ACHIEVEMENTS.length * 4; // 4 tiers each
    const unlocked = achievements.filter(a => a.unlockedAt).length;

    const byTier = {
      bronze: { total: ACHIEVEMENTS.length, unlocked: 0 },
      silver: { total: ACHIEVEMENTS.length, unlocked: 0 },
      gold: { total: ACHIEVEMENTS.length, unlocked: 0 },
      platinum: { total: ACHIEVEMENTS.length, unlocked: 0 },
    };

    achievements.forEach(achievement => {
      if (achievement.unlockedAt) {
        byTier[achievement.tier].unlocked++;
      }
    });

    return {
      total: totalPossible,
      unlocked,
      percentage: Math.round((unlocked / totalPossible) * 100),
      byTier,
    };
  }
}