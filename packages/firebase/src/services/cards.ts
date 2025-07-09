import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config';
import { DataCache } from './cache';
import { logCardChange } from './activityLog';
import type { Card, CardRequirements, GameState } from '@repo/shared';

export async function getCard(cardId: string): Promise<Card | null> {
  const cache = DataCache.getInstance();
  
  // Check cache first
  const cachedCard = cache.getCard(cardId);
  if (cachedCard) return cachedCard;
  
  // If not in cache, fetch from Firestore
  const cardDoc = await getDoc(doc(db, 'cards', cardId));
  if (!cardDoc.exists()) return null;
  
  const data = cardDoc.data();
  const card = {
    id: cardDoc.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as Card;
  
  // Cache the individual card
  cache.set(`card_${card.id}`, card, 1000 * 60 * 60 * 24); // 24 hours
  
  return card;
}

export async function getAllCards(): Promise<Card[]> {
  const cache = DataCache.getInstance();
  
  // Check cache first
  const cachedCards = cache.getCards();
  if (cachedCards) {
    console.log('Cards loaded from cache');
    return cachedCards;
  }
  
  try {
    // Try paginated query first
    console.log('Loading cards from Firestore...');
    const { PaginatedQueries } = await import('./paginatedQueries');
    
    // For large datasets, use batch loading
    const cards: Card[] = [];
    let batchCount = 0;
    
    for await (const batch of PaginatedQueries.loadAllCardsInBatches(200)) {
      cards.push(...batch);
      batchCount++;
      console.log(`Loaded batch ${batchCount}: ${batch.length} cards (total: ${cards.length})`);
    }
    
    // Cache all cards
    await cache.setCards(cards);
    
    return cards;
  } catch (error: any) {
    // If query requires index, use fallback
    if (error?.message?.includes('requires an index')) {
      console.warn('Index not ready, using fallback query');
      const { FallbackQueries } = await import('./fallbackQueries');
      return FallbackQueries.getAllCardsSimple();
    }
    throw error;
  }
}

export async function getAvailableCards(gameState: GameState): Promise<Card[]> {
  const allCards = await getAllCards();
  
  return allCards.filter(card => {
    if (!card.requirements) return true;
    
    const req = card.requirements;
    
    // Check money requirements
    if (req.minMoney !== undefined && gameState.money < req.minMoney) return false;
    if (req.maxMoney !== undefined && gameState.money > req.maxMoney) return false;
    
    // Check reputation requirements
    if (req.minReputation !== undefined && gameState.reputation < req.minReputation) return false;
    if (req.maxReputation !== undefined && gameState.reputation > req.maxReputation) return false;
    
    // Check turn requirements
    if (req.minTurn !== undefined && gameState.turn < req.minTurn) return false;
    
    // Check required flags
    if (req.requiredFlags && req.requiredFlags.length > 0) {
      if (!req.requiredFlags.every(flag => gameState.flags.includes(flag))) return false;
    }
    
    // Check NPC relationship requirements
    if (req.npcRelationship) {
      const relationship = gameState.npcRelationships[req.npcRelationship.npcId] || 0;
      if (relationship < req.npcRelationship.minValue) return false;
    }
    
    return true;
  });
}

export async function getCardsByPriority(priority: 1 | 2 | 3 | 4): Promise<Card[]> {
  const q = query(
    collection(db, 'cards'),
    where('priority', '==', priority),
    orderBy('updatedAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  })) as Card[];
}

export async function createCard(card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'cards'), {
    ...card,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  // Clear cache
  const cache = DataCache.getInstance();
  cache.delete('all_cards');
  
  // Log the activity
  try {
    await logCardChange('create', docRef.id, card.title);
  } catch (error) {
    console.error('Failed to log card creation:', error);
  }
  
  return docRef.id;
}

export async function updateCard(cardId: string, updates: Partial<Card>): Promise<void> {
  // Get current card for logging
  const currentCard = await getCard(cardId);
  
  const { id, createdAt, ...updateData } = updates;
  await updateDoc(doc(db, 'cards', cardId), {
    ...updateData,
    updatedAt: serverTimestamp(),
  });
  
  // Clear cache
  const cache = DataCache.getInstance();
  cache.delete('all_cards');
  cache.delete(`card_${cardId}`);
  
  // Log the changes
  if (currentCard) {
    const changes = Object.entries(updateData)
      .filter(([key, value]) => currentCard[key as keyof Card] !== value)
      .map(([field, newValue]) => ({
        field,
        oldValue: currentCard[field as keyof Card],
        newValue
      }));
    
    try {
      await logCardChange('update', cardId, currentCard.title, changes);
    } catch (error) {
      console.error('Failed to log card update:', error);
    }
  }
}

export async function deleteCard(cardId: string): Promise<void> {
  // Get card info for logging
  const card = await getCard(cardId);
  
  await deleteDoc(doc(db, 'cards', cardId));
  
  // Clear cache
  const cache = DataCache.getInstance();
  cache.delete('all_cards');
  cache.delete(`card_${cardId}`);
  
  // Log the deletion
  if (card) {
    try {
      await logCardChange('delete', cardId, card.title);
    } catch (error) {
      console.error('Failed to log card deletion:', error);
    }
  }
}

// Batch operations for importing multiple cards
export async function batchCreateCards(cards: Array<Omit<Card, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const batch = writeBatch(db);
  
  cards.forEach(card => {
    const docRef = doc(collection(db, 'cards'));
    batch.set(docRef, {
      ...card,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
  
  await batch.commit();
}

export async function batchUpdateCards(updates: Array<{ id: string; data: Partial<Card> }>): Promise<void> {
  const batch = writeBatch(db);
  
  updates.forEach(({ id, data }) => {
    const { id: _, createdAt, ...updateData } = data;
    const docRef = doc(db, 'cards', id);
    batch.update(docRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
  });
  
  await batch.commit();
}

export async function batchDeleteCards(cardIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  
  cardIds.forEach(cardId => {
    const docRef = doc(db, 'cards', cardId);
    batch.delete(docRef);
  });
  
  await batch.commit();
}