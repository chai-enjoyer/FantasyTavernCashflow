import { Card, NPC, GameState } from '@repo/shared';
import { DataCache } from './cache';
import { getAllCards } from './cards';
import { getAllNPCs } from './npcs';
import { CardIndex } from './cardIndex';
import { CardPrefetcher } from './cardPrefetcher';

interface CardWithNPC {
  card: Card;
  npc: NPC;
}

/**
 * Get available cards with their associated NPCs using optimized indexing
 */
export async function getAvailableCardsWithNPCs(gameState: GameState): Promise<CardWithNPC[]> {
  const cardIndex = CardIndex.getInstance();
  const prefetcher = CardPrefetcher.getInstance();
  
  // Check if we have prefetched cards available
  const prefetchedCards = prefetcher.getAllPrefetchedCards();
  if (prefetchedCards.length > 0) {
    console.log(`Using ${prefetchedCards.length} prefetched cards`);
    return prefetchedCards;
  }
  
  // Ensure index is built
  if (cardIndex.getStats().totalCards === 0) {
    console.log('Building card index...');
    const [cards, npcs] = await Promise.all([
      getAllCards(),
      getAllNPCs()
    ]);
    cardIndex.buildIndex(cards, npcs);
  }
  
  // Use indexed lookup for fast filtering
  const availableCards = cardIndex.getAvailableCards(gameState);
  
  console.log(`Found ${availableCards.length} available cards`);
  
  return availableCards.map(indexed => ({
    card: indexed.card,
    npc: indexed.npc
  }));
}

/**
 * Prefetch all NPCs that might be needed for a game session
 * This is more efficient than loading them one by one
 */
export async function prefetchGameNPCs(): Promise<Map<string, NPC>> {
  const allNPCs = await getAllNPCs();
  const npcMap = new Map<string, NPC>();
  
  allNPCs.forEach(npc => {
    npcMap.set(npc.id, npc);
  });
  
  return npcMap;
}

/**
 * Get cards by priority with their NPCs
 */
export async function getCardsByPriorityWithNPCs(
  priority: 1 | 2 | 3 | 4,
  gameState: GameState
): Promise<CardWithNPC[]> {
  const cardsWithNPCs = await getAvailableCardsWithNPCs(gameState);
  return cardsWithNPCs.filter(item => item.card.priority === priority);
}

/**
 * Warm up the cache and build indexes
 */
export async function warmUpCache(): Promise<{
  cards: number;
  npcs: number;
  cacheSize: number;
  loadTime: number;
  indexed: boolean;
}> {
  const startTime = performance.now();
  const cache = DataCache.getInstance();
  const cardIndex = CardIndex.getInstance();
  
  // Load all data in parallel
  const [cards, npcs] = await Promise.all([
    getAllCards(),
    getAllNPCs(),
  ]);
  
  // Build card index for fast lookups
  cardIndex.buildIndex(cards, npcs);
  
  const loadTime = performance.now() - startTime;
  const cacheSize = cache.getCacheSize();
  
  return {
    cards: cards.length,
    npcs: npcs.length,
    cacheSize,
    loadTime,
    indexed: true,
  };
}