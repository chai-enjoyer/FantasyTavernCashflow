export interface User {
  telegramId: string;
  username?: string;
  gameState: GameState;
  statistics: UserStatistics;
  achievements: Achievement[];
  level: number;
  experience: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameState {
  money: number;
  reputation: number;
  turn: number;
  passiveIncome: PassiveIncome[];
  debts: Debt[];
  temporaryEffects: TemporaryEffect[];
  npcRelationships: Record<string, number>;
  lastPlayedAt: Date;
  totalPlayTime: number;
  flags: string[];
}

export interface UserStatistics {
  gamesPlayed: number;
  maxMoney: number;
  maxTurns: number;
  totalDecisions: number;
  bankruptcies: number;
}

export interface PassiveIncome {
  id: string;
  amount: number;
  description: string;
  remainingTurns?: number;
  startsAfter?: number;
}

export interface Debt {
  id: string;
  principal: number;
  totalAmount: number;
  turnsRemaining: number;
  paymentPerTurn: number;
  creditorId?: string;
  collateral?: string;
}

export interface TemporaryEffect {
  id: string;
  type: 'money_multiplier' | 'reputation_boost' | 'cost_reduction' | 'risk_modifier';
  value: number;
  turnsRemaining: number;
  description: string;
}

export type CardType = 'immediate' | 'passive_income' | 'debt' | 'modifier' | 'delayed' | 'social' | 'chain';

export interface Card {
  id: string;
  type: CardType;
  category: string;
  npcId: string;
  title: string;
  description: string;
  situation: string;
  options: [CardOption, CardOption, CardOption, CardOption];
  requirements?: CardRequirements;
  priority: 1 | 2 | 3 | 4;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CardOption {
  text: string;
  consequences: CardConsequences;
  resultText: string;
  npcEmotion: 'positive' | 'negative' | 'neutral';
}

export interface CardConsequences {
  money?: number;
  reputation?: number;
  npcRelationship?: { npcId: string; change: number };
  passiveIncome?: PassiveIncome;
  debt?: Debt;
  temporaryEffect?: TemporaryEffect;
  delayedEvent?: { cardId: string; turnsUntil: number };
  flags?: string[];
}

export interface CardRequirements {
  minMoney?: number;
  maxMoney?: number;
  minReputation?: number;
  maxReputation?: number;
  minTurn?: number;
  requiredFlags?: string[];
  npcRelationship?: { npcId: string; minValue: number };
}

export type NPCClass = 'commoner' | 'adventurer' | 'criminal' | 'noble' | 'royal' | 'cleric' | 'mage' | 'crime_boss' | 'dragon';

export interface NPC {
  id: string;
  name: string;
  class: NPCClass;
  wealth: 1 | 2 | 3 | 4 | 5;
  reliability: number;
  portraits: {
    neutral: string;
    positive: string;
    negative: string;
  };
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameConfig {
  startingMoney: number;
  startingReputation: number;
  baseIncome: number;
  baseCosts: number;
  scalingFormulas: {
    moneyScaling: string;
    reputationImpact: string;
    riskCalculation: string;
  };
  version: string;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  type: AchievementType;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  name: string;
  description: string;
  iconUrl?: string;
  unlockedAt?: Date;
  progress?: number;
  target?: number;
  reward?: {
    experience?: number;
    title?: string;
    badge?: string;
  };
}

export type AchievementType = 
  | 'money_earned'      // Earn X total money
  | 'turns_survived'    // Survive X turns
  | 'reputation_max'    // Reach X reputation
  | 'debt_paid'        // Pay off X debts
  | 'decisions_made'   // Make X decisions
  | 'games_played'     // Play X games
  | 'bankruptcies'     // Go bankrupt X times
  | 'perfect_game'     // Complete game with specific conditions
  | 'dragon_friend'    // Max relationship with dragon
  | 'noble_patron'     // Max relationship with noble
  | 'crime_syndicate'  // Max relationship with crime boss
  | 'tavern_chain'     // Have X passive income sources
  | 'risk_taker'       // Take X risky choices
  | 'conservative'     // Take X safe choices
  | 'speed_run'        // Complete game in X turns
  | 'marathon'         // Play for X total minutes;