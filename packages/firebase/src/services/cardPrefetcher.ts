import { Card, NPC, GameState } from '@repo/shared';
import { DataCache } from './cache';
import { CardIndex } from './cardIndex';
import { GameEngine } from '@repo/game-logic';

interface PrefetchedCard {
  card: Card;
  npc: NPC;
}

/**
 * Card prefetching service that predicts and preloads next cards
 * to eliminate loading delays between turns
 */
export class CardPrefetcher {
  private static instance: CardPrefetcher;
  private prefetchQueue: Map<string, PrefetchedCard> = new Map();
  private gameEngine = new GameEngine();
  private cardIndex = CardIndex.getInstance();
  private isPrefetching = false;
  private prefetchPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): CardPrefetcher {
    if (!CardPrefetcher.instance) {
      CardPrefetcher.instance = new CardPrefetcher();
    }
    return CardPrefetcher.instance;
  }

  /**
   * Prefetch next likely cards based on current game state
   * This is now synchronous and uses the card index for instant access
   */
  public prefetchNextCards(
    currentGameState: GameState,
    currentCardId: string
  ): void {
    // Don't prefetch if already in progress
    if (this.isPrefetching) {
      return;
    }

    this.isPrefetching = true;
    
    try {
      this.performPrefetch(currentGameState, currentCardId);
    } finally {
      this.isPrefetching = false;
    }
  }

  private performPrefetch(
    currentGameState: GameState,
    currentCardId: string
  ): void {
    console.log('🔮 Prefetching next possible cards...');
    
    // Simulate the next turn state
    const nextTurnState = this.gameEngine.processTurnEnd(currentGameState);
    
    // Get available cards from the index (instant, no async)
    const availableCards = this.cardIndex.getAvailableCards(nextTurnState);
    
    // Filter out recently played cards to avoid repetition
    const recentCardFlags = currentGameState.flags.filter(f => f.startsWith('recent_card_'));
    const filteredCards = availableCards.filter(({ card }) => 
      !recentCardFlags.includes(`recent_card_${card.id}`)
    );

    // Prefetch top priority cards (most likely to be selected)
    const cardsByPriority = this.groupByPriority(filteredCards);
    
    // Clear old prefetch queue
    this.prefetchQueue.clear();
    
    // Prefetch cards in priority order
    let prefetchCount = 0;
    const maxPrefetch = 10; // Limit to prevent memory issues
    
    for (const priority of [1, 2, 3, 4]) {
      const cards = cardsByPriority.get(priority) || [];
      
      for (const cardWithNPC of cards) {
        if (prefetchCount >= maxPrefetch) break;
        
        this.prefetchQueue.set(cardWithNPC.card.id, cardWithNPC);
        prefetchCount++;
      }
      
      if (prefetchCount >= maxPrefetch) break;
    }
    
    console.log(`✅ Prefetched ${prefetchCount} cards for next turn`);
  }

  /**
   * Get a prefetched card if available
   */
  public getPrefetchedCard(cardId: string): PrefetchedCard | null {
    return this.prefetchQueue.get(cardId) || null;
  }

  /**
   * Get all prefetched cards
   */
  public getAllPrefetchedCards(): PrefetchedCard[] {
    return Array.from(this.prefetchQueue.values());
  }

  /**
   * Clear prefetch queue
   */
  public clearQueue(): void {
    this.prefetchQueue.clear();
  }

  /**
   * Group cards by priority
   */
  private groupByPriority(cards: ReturnType<CardIndex['getAvailableCards']>): Map<number, ReturnType<CardIndex['getAvailableCards']>> {
    const grouped = new Map<number, ReturnType<CardIndex['getAvailableCards']>>();
    
    for (const cardWithNPC of cards) {
      const priority = cardWithNPC.card.priority;
      if (!grouped.has(priority)) {
        grouped.set(priority, []);
      }
      grouped.get(priority)!.push(cardWithNPC);
    }
    
    return grouped;
  }

  /**
   * Get prefetch status
   */
  public getStatus(): {
    isPrefetching: boolean;
    queueSize: number;
    cards: string[];
  } {
    return {
      isPrefetching: this.isPrefetching,
      queueSize: this.prefetchQueue.size,
      cards: Array.from(this.prefetchQueue.keys()),
    };
  }
}