import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config';
import { Card, NPC } from '@repo/shared';
import { DataCache } from './cache';

/**
 * Fallback queries that work without composite indexes
 * Used temporarily while indexes are building
 */
export class FallbackQueries {
  /**
   * Get all cards without complex queries (works without indexes)
   */
  static async getAllCardsSimple(): Promise<Card[]> {
    const cache = DataCache.getInstance();
    
    // Check cache first
    const cachedCards = cache.getCards();
    if (cachedCards) {
      console.log('Cards loaded from cache (fallback)');
      return cachedCards;
    }
    
    try {
      // Simple query without ordering
      console.log('Loading all cards with fallback query...');
      const snapshot = await getDocs(collection(db, 'cards'));
      
      const cards: Card[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as Card));
      
      // Sort in memory
      cards.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      });
      
      // Cache the results
      await cache.setCards(cards);
      
      return cards;
    } catch (error) {
      console.error('Fallback query failed:', error);
      throw error;
    }
  }

  /**
   * Get all NPCs without complex queries
   */
  static async getAllNPCsSimple(): Promise<NPC[]> {
    const cache = DataCache.getInstance();
    
    // Check cache first
    const cachedNPCs = cache.getNPCs();
    if (cachedNPCs) {
      console.log('NPCs loaded from cache (fallback)');
      return cachedNPCs;
    }
    
    try {
      // Simple query without ordering
      console.log('Loading all NPCs with fallback query...');
      const snapshot = await getDocs(collection(db, 'npcs'));
      
      const npcs: NPC[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as NPC));
      
      // Sort in memory
      npcs.sort((a, b) => a.name.localeCompare(b.name));
      
      // Cache the results
      await cache.setNPCs(npcs);
      
      return npcs;
    } catch (error) {
      console.error('Fallback query failed:', error);
      throw error;
    }
  }
}