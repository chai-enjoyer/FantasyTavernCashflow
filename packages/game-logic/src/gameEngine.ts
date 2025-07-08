import {
  GameState,
  Card,
  CardOption,
  CardConsequences,
  PassiveIncome,
  Debt,
  TemporaryEffect,
  GAME_CONSTANTS,
  calculateRiskPercentage,
  randomSelect,
  clamp,
} from '@repo/shared';

export class GameEngine {
  calculateScaledAmount(baseMoney: number, currentBalance: number): number {
    return baseMoney * Math.pow(currentBalance / 10000, 0.8) * (0.5 + Math.random() * 1.5);
  }

  calculateRiskChance(reputation: number): number {
    return calculateRiskPercentage(reputation) / 100;
  }

  calculatePriceWithReputation(basePrice: number, reputation: number, isBuying: boolean): number {
    if (isBuying) {
      if (reputation <= -100) return basePrice * 2.5;
      if (reputation <= -50) return basePrice * 2.0;
      if (reputation <= 0) return basePrice * 1.5;
      if (reputation >= 50) return basePrice * 0.75;
      if (reputation >= 100) return basePrice * 0.5;
    } else {
      if (reputation <= -100) return basePrice * 0.5;
      if (reputation <= -50) return basePrice * 0.75;
      if (reputation >= 50) return basePrice * 1.25;
      if (reputation >= 100) return basePrice * 1.5;
    }
    return basePrice;
  }

  calculateDebtInterest(principal: number, npcReliability: number, playerReputation: number): number {
    // Interest = 20% × (1 + (100 - Reputation)/200 + (100 - Reliability)/100)
    const rate = 0.2 * (1 + (100 - playerReputation) / 200 + (100 - npcReliability) / 100);
    return principal * rate;
  }

  processCardChoice(
    card: Card,
    choiceIndex: 0 | 1 | 2 | 3,
    gameState: GameState
  ): GameState {
    const choice = card.options[choiceIndex];
    const consequences = choice.consequences;
    const newState = { ...gameState };

    // Process money changes
    if (consequences.money !== undefined) {
      const adjustedAmount = this.adjustMoneyForReputation(
        consequences.money,
        newState.reputation,
        consequences.money < 0
      );
      newState.money += adjustedAmount;
    }

    // Process reputation changes
    if (consequences.reputation !== undefined) {
      newState.reputation = clamp(
        newState.reputation + consequences.reputation,
        -100,
        100
      );
    }

    // Process NPC relationship changes
    if (consequences.npcRelationship) {
      const { npcId, change } = consequences.npcRelationship;
      newState.npcRelationships[npcId] = 
        (newState.npcRelationships[npcId] || 0) + change;
    }

    // Add passive income
    if (consequences.passiveIncome) {
      newState.passiveIncome.push({
        ...consequences.passiveIncome,
        remainingTurns: consequences.passiveIncome.remainingTurns || undefined,
      });
    }

    // Add debt
    if (consequences.debt) {
      newState.debts.push(consequences.debt);
    }

    // Add temporary effect
    if (consequences.temporaryEffect) {
      newState.temporaryEffects.push(consequences.temporaryEffect);
    }

    // Schedule delayed event
    if (consequences.delayedEvent) {
      // This would be handled by a separate system that tracks delayed events
      // For now, we'll just add a flag
      newState.flags.push(`delayed_${consequences.delayedEvent.cardId}_${consequences.delayedEvent.turnsUntil}`);
    }

    // Add flags
    if (consequences.flags) {
      newState.flags.push(...consequences.flags);
    }

    // Increment turn
    newState.turn += 1;

    return newState;
  }

  processTurnEnd(gameState: GameState): GameState {
    const newState = { ...gameState };

    // Process passive income
    let totalIncome = GAME_CONSTANTS.BASE_INCOME;
    newState.passiveIncome = newState.passiveIncome.filter(income => {
      if (income.startsAfter && income.startsAfter > 0) {
        income.startsAfter--;
        return true;
      }
      
      totalIncome += income.amount;
      
      if (income.remainingTurns !== undefined) {
        income.remainingTurns--;
        return income.remainingTurns > 0;
      }
      
      return true;
    });

    // Process debts
    let totalDebtPayment = 0;
    newState.debts = newState.debts.filter(debt => {
      totalDebtPayment += debt.paymentPerTurn;
      debt.turnsRemaining--;
      return debt.turnsRemaining > 0;
    });

    // Process temporary effects
    newState.temporaryEffects = newState.temporaryEffects.filter(effect => {
      effect.turnsRemaining--;
      return effect.turnsRemaining > 0;
    });

    // Apply income and costs
    const effectMultiplier = this.calculateEffectMultiplier(newState.temporaryEffects);
    const netIncome = (totalIncome - GAME_CONSTANTS.BASE_COSTS - totalDebtPayment) * effectMultiplier;
    newState.money += netIncome;
    
    // Clean up old recent card flags (keep only last 5)
    const recentCardFlags = newState.flags.filter(f => f.startsWith('recent_card_'));
    if (recentCardFlags.length > 5) {
      const flagsToKeep = new Set(recentCardFlags.slice(-5));
      newState.flags = newState.flags.filter(f => !f.startsWith('recent_card_') || flagsToKeep.has(f));
    }

    return newState;
  }

  selectNextCard(gameState: GameState, availableCards: Card[]): Card | null {
    if (availableCards.length === 0) return null;

    // Keep track of recently shown cards to avoid repetition
    const recentCardFlags = gameState.flags.filter(f => f.startsWith('recent_card_'));
    const recentCardIds = new Set(recentCardFlags.map(f => f.replace('recent_card_', '')));

    // Filter out recently shown cards (last 5 cards)
    let filteredCards = availableCards.filter(c => !recentCardIds.has(c.id));
    
    // If too few cards available after filtering, only filter the most recent 2
    if (filteredCards.length < 3 && recentCardFlags.length > 2) {
      const veryRecentIds = new Set(recentCardFlags.slice(-2).map(f => f.replace('recent_card_', '')));
      filteredCards = availableCards.filter(c => !veryRecentIds.has(c.id));
    }

    // Use filtered cards if available, otherwise use all available cards
    const cardPool = filteredCards.length > 0 ? filteredCards : availableCards;

    // 1. Check for critical events (debt due, effect ending) - priority 1
    const criticalCards = cardPool.filter(c => c.priority === 1);
    if (criticalCards.length > 0) {
      return randomSelect(criticalCards);
    }

    // 2. Roll for risk events based on reputation - priority 2
    const riskChance = this.calculateRiskChance(gameState.reputation);
    if (Math.random() < riskChance) {
      const riskCards = cardPool.filter(c => c.priority === 2);
      if (riskCards.length > 0) {
        return randomSelect(riskCards);
      }
    }

    // 3. Check for story continuations - priority 3
    const storyCards = cardPool.filter(c => 
      c.priority === 3 &&
      (!c.requirements?.requiredFlags || 
       c.requirements.requiredFlags.every(flag => gameState.flags.includes(flag)))
    );
    if (storyCards.length > 0 && Math.random() < 0.7) { // 70% chance for story cards
      return randomSelect(storyCards);
    }

    // 4. Normal cards - priority 4
    const normalCards = cardPool.filter(c => c.priority === 4);
    if (normalCards.length > 0) {
      return randomSelect(normalCards);
    }

    // 5. Fallback: any priority 3 or 4 card from the pool
    const fallbackCards = cardPool.filter(c => c.priority >= 3);
    if (fallbackCards.length > 0) {
      return randomSelect(fallbackCards);
    }

    // 6. Final fallback: any card from the original pool
    return randomSelect(availableCards);
  }

  isGameOver(gameState: GameState): boolean {
    return gameState.money <= 0;
  }

  private adjustMoneyForReputation(amount: number, reputation: number, isCost: boolean): number {
    return Math.round(this.calculatePriceWithReputation(Math.abs(amount), reputation, isCost) * (amount < 0 ? -1 : 1));
  }

  private calculateEffectMultiplier(effects: TemporaryEffect[]): number {
    let multiplier = 1;
    
    effects.forEach(effect => {
      if (effect.type === 'money_multiplier') {
        multiplier *= effect.value;
      }
    });
    
    return multiplier;
  }
}