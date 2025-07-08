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
import type { Card, CardRequirements, GameState } from '@repo/shared';

export async function getCard(cardId: string): Promise<Card | null> {
  const cardDoc = await getDoc(doc(db, 'cards', cardId));
  if (!cardDoc.exists()) return null;
  
  const data = cardDoc.data();
  return {
    id: cardDoc.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as Card;
}

export async function getAllCards(): Promise<Card[]> {
  const cardsSnapshot = await getDocs(collection(db, 'cards'));
  return cardsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  })) as Card[];
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
  
  return docRef.id;
}

export async function updateCard(cardId: string, updates: Partial<Card>): Promise<void> {
  const { id, createdAt, ...updateData } = updates;
  await updateDoc(doc(db, 'cards', cardId), {
    ...updateData,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCard(cardId: string): Promise<void> {
  await deleteDoc(doc(db, 'cards', cardId));
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