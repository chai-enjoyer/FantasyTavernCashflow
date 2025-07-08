import { Card, NPC, GameState } from '@repo/shared';

interface IndexedCard {
  card: Card;
  npc: NPC;
  // Pre-calculated values for faster filtering
  minMoney: number;
  maxMoney: number;
  minReputation: number;
  maxReputation: number;
  minTurn: number;
  requiredFlags: string[];
  npcRelationshipRequired?: {
    npcId: string;
    minValue: number;
  };
}

/**
 * In-memory card index for ultra-fast filtering
 * Supports large datasets with O(1) lookups
 */
export class CardIndex {
  private static instance: CardIndex;
  
  // Multiple indexes for different access patterns
  private cardById = new Map<string, IndexedCard>();
  private cardsByPriority = new Map<number, IndexedCard[]>();
  private cardsByNPC = new Map<string, IndexedCard[]>();
  private cardsByMoneyRange = new Map<string, IndexedCard[]>();
  private allCards: IndexedCard[] = [];
  
  private constructor() {}

  public static getInstance(): CardIndex {
    if (!CardIndex.instance) {
      CardIndex.instance = new CardIndex();
    }
    return CardIndex.instance;
  }

  /**
   * Build indexes from cards and NPCs data
   */
  public buildIndex(cards: Card[], npcs: NPC[]): void {
    console.log('🗂️ Building card indexes...');
    const startTime = performance.now();
    
    // Clear existing indexes
    this.clear();
    
    // Create NPC lookup map
    const npcMap = new Map<string, NPC>();
    npcs.forEach(npc => npcMap.set(npc.id, npc));
    
    // Index each card
    cards.forEach(card => {
      const npc = npcMap.get(card.npcId);
      if (!npc) return;
      
      const indexed: IndexedCard = {
        card,
        npc,
        minMoney: card.requirements?.minMoney ?? 0,
        maxMoney: card.requirements?.maxMoney ?? Number.MAX_SAFE_INTEGER,
        minReputation: card.requirements?.minReputation ?? Number.MIN_SAFE_INTEGER,
        maxReputation: card.requirements?.maxReputation ?? Number.MAX_SAFE_INTEGER,
        minTurn: card.requirements?.minTurn ?? 0,
        requiredFlags: card.requirements?.requiredFlags ?? [],
        npcRelationshipRequired: card.requirements?.npcRelationship,
      };
      
      // Add to indexes
      this.cardById.set(card.id, indexed);
      this.allCards.push(indexed);
      
      // Index by priority
      if (!this.cardsByPriority.has(card.priority)) {
        this.cardsByPriority.set(card.priority, []);
      }
      this.cardsByPriority.get(card.priority)!.push(indexed);
      
      // Index by NPC
      if (!this.cardsByNPC.has(card.npcId)) {
        this.cardsByNPC.set(card.npcId, []);
      }
      this.cardsByNPC.get(card.npcId)!.push(indexed);
      
      // Index by money range (bucketed for performance)
      const moneyBucket = this.getMoneyBucket(indexed.minMoney);
      if (!this.cardsByMoneyRange.has(moneyBucket)) {
        this.cardsByMoneyRange.set(moneyBucket, []);
      }
      this.cardsByMoneyRange.get(moneyBucket)!.push(indexed);
    });
    
    const buildTime = performance.now() - startTime;
    console.log(`✅ Indexed ${cards.length} cards in ${buildTime.toFixed(2)}ms`);
  }

  /**
   * Get available cards for a game state (highly optimized)
   */
  public getAvailableCards(gameState: GameState): IndexedCard[] {
    const startTime = performance.now();
    
    // Start with all cards and filter down
    let candidates = this.allCards;
    
    // Filter by money range first (usually most restrictive)
    candidates = candidates.filter(indexed => 
      gameState.money >= indexed.minMoney && 
      gameState.money <= indexed.maxMoney
    );
    
    // Filter by other requirements
    const availableCards = candidates.filter(indexed => {
      // Check reputation
      if (gameState.reputation < indexed.minReputation || 
          gameState.reputation > indexed.maxReputation) {
        return false;
      }
      
      // Check turn
      if (gameState.turn < indexed.minTurn) {
        return false;
      }
      
      // Check required flags
      if (indexed.requiredFlags.length > 0) {
        if (!indexed.requiredFlags.every(flag => gameState.flags.includes(flag))) {
          return false;
        }
      }
      
      // Check NPC relationship
      if (indexed.npcRelationshipRequired) {
        const relationship = gameState.npcRelationships[indexed.npcRelationshipRequired.npcId] || 0;
        if (relationship < indexed.npcRelationshipRequired.minValue) {
          return false;
        }
      }
      
      return true;
    });
    
    const filterTime = performance.now() - startTime;
    if (filterTime > 10) {
      console.log(`⚡ Filtered ${this.allCards.length} cards to ${availableCards.length} in ${filterTime.toFixed(2)}ms`);
    }
    
    return availableCards;
  }

  /**
   * Get cards by priority (O(1) lookup)
   */
  public getCardsByPriority(priority: number): IndexedCard[] {
    return this.cardsByPriority.get(priority) || [];
  }

  /**
   * Get card by ID (O(1) lookup)
   */
  public getCard(cardId: string): IndexedCard | null {
    return this.cardById.get(cardId) || null;
  }

  /**
   * Get cards by NPC (O(1) lookup)
   */
  public getCardsByNPC(npcId: string): IndexedCard[] {
    return this.cardsByNPC.get(npcId) || [];
  }

  /**
   * Clear all indexes
   */
  public clear(): void {
    this.cardById.clear();
    this.cardsByPriority.clear();
    this.cardsByNPC.clear();
    this.cardsByMoneyRange.clear();
    this.allCards = [];
  }

  /**
   * Get index statistics
   */
  public getStats(): {
    totalCards: number;
    priorityGroups: number;
    npcGroups: number;
    moneyBuckets: number;
  } {
    return {
      totalCards: this.allCards.length,
      priorityGroups: this.cardsByPriority.size,
      npcGroups: this.cardsByNPC.size,
      moneyBuckets: this.cardsByMoneyRange.size,
    };
  }

  /**
   * Get money bucket for indexing
   */
  private getMoneyBucket(money: number): string {
    // Create buckets: 0-1k, 1k-5k, 5k-10k, 10k-50k, 50k-100k, 100k+
    if (money === 0) return '0';
    if (money < 1000) return '0-1k';
    if (money < 5000) return '1k-5k';
    if (money < 10000) return '5k-10k';
    if (money < 50000) return '10k-50k';
    if (money < 100000) return '50k-100k';
    return '100k+';
  }
}