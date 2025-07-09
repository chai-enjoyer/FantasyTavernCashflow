import { writeBatch, doc, collection } from 'firebase/firestore';
import { db } from '../config';
import { Card, NPC, GameConfig } from '@repo/shared';
import { updateGameConfig } from './gameConfig';
import { logBulkOperation } from './activityLog';

interface BatchImportData {
  cards?: Card[];
  npcs?: NPC[];
  config?: GameConfig;
}

interface BatchImportResult {
  success: boolean;
  errors: string[];
  details: {
    cardsImported: number;
    npcsImported: number;
    configUpdated: boolean;
  };
}

const MAX_BATCH_SIZE = 500; // Firestore limit

export async function batchImportGameData(data: BatchImportData): Promise<BatchImportResult> {
  const errors: string[] = [];
  const details = {
    cardsImported: 0,
    npcsImported: 0,
    configUpdated: false,
  };

  try {
    // Import NPCs first (cards reference NPCs)
    let npcIdMap = new Map<string, string>();
    if (data.npcs && data.npcs.length > 0) {
      npcIdMap = await batchImportNPCs(data.npcs);
      details.npcsImported = data.npcs.length;
    }

    // Import cards with updated NPC references
    if (data.cards && data.cards.length > 0) {
      await batchImportCards(data.cards, npcIdMap);
      details.cardsImported = data.cards.length;
    }

    // Update game config
    if (data.config) {
      await updateGameConfig(data.config);
      details.configUpdated = true;
    }
    
    // Log the bulk import operation
    await logBulkOperation('Batch Import', {
      cardsImported: details.cardsImported,
      npcsImported: details.npcsImported,
      configUpdated: details.configUpdated,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      errors,
      details,
    };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error during import');
    return {
      success: false,
      errors,
      details,
    };
  }
}

async function batchImportCards(cards: Card[], npcIdMap: Map<string, string>): Promise<void> {
  const batches = Math.ceil(cards.length / MAX_BATCH_SIZE);
  
  for (let i = 0; i < batches; i++) {
    const batch = writeBatch(db);
    const start = i * MAX_BATCH_SIZE;
    const end = Math.min(start + MAX_BATCH_SIZE, cards.length);
    const batchCards = cards.slice(start, end);

    for (const card of batchCards) {
      const cardId = card.id;
      // Use the provided ID if it's a readable format, otherwise generate a new one
      const isReadableId = /^[a-z]+_[a-z0-9_]+$/.test(cardId);
      const cardRef = isReadableId && cardId
        ? doc(db, 'cards', cardId) // Use custom ID
        : doc(collection(db, 'cards')); // Generate new ID
        
      const cardData = {
        ...card,
        id: cardRef.id,
        npcId: npcIdMap.get(card.npcId) || card.npcId, // Map to new NPC ID
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      batch.set(cardRef, cardData);
    }

    await batch.commit();
  }
}

async function batchImportNPCs(npcs: NPC[]): Promise<Map<string, string>> {
  const idMap = new Map<string, string>(); // old ID -> new ID
  const batches = Math.ceil(npcs.length / MAX_BATCH_SIZE);
  
  for (let i = 0; i < batches; i++) {
    const batch = writeBatch(db);
    const start = i * MAX_BATCH_SIZE;
    const end = Math.min(start + MAX_BATCH_SIZE, npcs.length);
    const batchNPCs = npcs.slice(start, end);

    for (const npc of batchNPCs) {
      const oldId = npc.id;
      // Use the provided ID if it's a readable format, otherwise generate a new one
      const isReadableId = /^[a-z]+_[a-z0-9_]+$/.test(oldId);
      const npcRef = isReadableId 
        ? doc(db, 'npcs', oldId) // Use custom ID
        : doc(collection(db, 'npcs')); // Generate new ID
      
      const npcData = {
        ...npc,
        id: npcRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      batch.set(npcRef, npcData);
      idMap.set(oldId, npcRef.id);
    }

    await batch.commit();
  }
  
  return idMap;
}

export async function clearAllGameData(): Promise<void> {
  // Get all documents
  const [cards, npcs] = await Promise.all([
    collection(db, 'cards'),
    collection(db, 'npcs'),
  ]);

  // Delete in batches
  // Note: This is a simplified version. In production, you'd want to query and delete in batches
  console.warn('clearAllGameData is not fully implemented. Use with caution.');
}

export function validateImportData(data: BatchImportData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate NPCs
  if (data.npcs) {
    for (let i = 0; i < data.npcs.length; i++) {
      const npc = data.npcs[i];
      if (!npc.name) errors.push(`NPC at index ${i} missing name`);
      if (!npc.class) errors.push(`NPC at index ${i} missing class`);
      if (!npc.wealth || npc.wealth < 1 || npc.wealth > 5) {
        errors.push(`NPC at index ${i} has invalid wealth value`);
      }
      if (npc.reliability < 0 || npc.reliability > 100) {
        errors.push(`NPC at index ${i} has invalid reliability value`);
      }
    }
  }

  // Validate cards
  if (data.cards) {
    const npcIds = new Set(data.npcs?.map(n => n.id) || []);
    
    for (let i = 0; i < data.cards.length; i++) {
      const card = data.cards[i];
      if (!card.title) errors.push(`Card at index ${i} missing title`);
      if (!card.type) errors.push(`Card at index ${i} missing type`);
      if (!card.npcId) errors.push(`Card at index ${i} missing npcId`);
      if (card.npcId && !npcIds.has(card.npcId)) {
        errors.push(`Card at index ${i} references non-existent NPC: ${card.npcId}`);
      }
      if (!card.options || card.options.length !== 4) {
        errors.push(`Card at index ${i} must have exactly 4 options`);
      }
    }
  }

  // Validate config
  if (data.config) {
    if (typeof data.config.startingMoney !== 'number') {
      errors.push('Game config missing valid startingMoney');
    }
    if (typeof data.config.startingReputation !== 'number') {
      errors.push('Game config missing valid startingReputation');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}