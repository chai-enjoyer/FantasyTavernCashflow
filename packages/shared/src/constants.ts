export const GAME_CONSTANTS = {
  STARTING_MONEY: 10000,
  STARTING_REPUTATION: 0,
  BASE_INCOME: 1000,
  BASE_COSTS: 800,
  
  REPUTATION_THRESHOLDS: {
    CRIMINAL: -100,
    VILLAIN: -75,
    HATED: -50,
    DISLIKED: -25,
    NEUTRAL: 0,
    LIKED: 25,
    RESPECTED: 50,
    ADMIRED: 75,
    HERO: 100,
  },
  
  RISK_THRESHOLDS: {
    LOW: 0.1,
    MEDIUM: 0.3,
    HIGH: 0.5,
    EXTREME: 0.7,
  },
  
  CARD_PRIORITIES: {
    CRITICAL: 1,
    RISK: 2,
    STORY: 3,
    NORMAL: 4,
  },
} as const;

export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  CARD_WIDTH: 400,
  CARD_HEIGHT: 600,
  PORTRAIT_SIZE: 240,
  BUTTON_MIN_HEIGHT: 44,
} as const;

export const EMOJI = {
  MONEY: '💰',
  REPUTATION: '⭐',
  RISK: '🔥',
  ENEMY: '⚔️',
  FRIEND: '🤝',
  DEBT: '📜',
  INCOME: '💎',
  EFFECT: '✨',
} as const;