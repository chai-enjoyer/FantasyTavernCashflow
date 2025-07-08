import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config';
import { DataCache } from './cache';
import type { NPC } from '@repo/shared';

export async function getNPC(npcId: string): Promise<NPC | null> {
  const cache = DataCache.getInstance();
  
  // Check cache first
  const cachedNPC = cache.getNPC(npcId);
  if (cachedNPC) return cachedNPC;
  
  // If not in cache, fetch from Firestore
  const npcDoc = await getDoc(doc(db, 'npcs', npcId));
  if (!npcDoc.exists()) return null;
  
  const data = npcDoc.data();
  const npc = {
    id: npcDoc.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as NPC;
  
  // Cache the individual NPC
  cache.set(`npc_${npc.id}`, npc, 1000 * 60 * 60 * 24); // 24 hours
  
  return npc;
}

export async function getAllNPCs(): Promise<NPC[]> {
  const cache = DataCache.getInstance();
  
  // Check cache first
  const cachedNPCs = cache.getNPCs();
  if (cachedNPCs) {
    console.log('NPCs loaded from cache');
    return cachedNPCs;
  }
  
  try {
    // Try paginated query first
    console.log('Loading NPCs from Firestore...');
    const { PaginatedQueries } = await import('./paginatedQueries');
    
    const npcs: NPC[] = [];
    let batchCount = 0;
    
    for await (const batch of PaginatedQueries.loadAllNPCsInBatches(200)) {
      npcs.push(...batch);
      batchCount++;
      console.log(`Loaded batch ${batchCount}: ${batch.length} NPCs (total: ${npcs.length})`);
    }
    
    // Cache all NPCs
    await cache.setNPCs(npcs);
    
    return npcs;
  } catch (error: any) {
    // If query requires index, use fallback
    if (error?.message?.includes('requires an index')) {
      console.warn('Index not ready, using fallback query');
      const { FallbackQueries } = await import('./fallbackQueries');
      return FallbackQueries.getAllNPCsSimple();
    }
    throw error;
  }
}

export async function createNPC(npc: Omit<NPC, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'npcs'), {
    ...npc,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  return docRef.id;
}

export async function updateNPC(npcId: string, updates: Partial<NPC>): Promise<void> {
  const { id, createdAt, ...updateData } = updates;
  await updateDoc(doc(db, 'npcs', npcId), {
    ...updateData,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNPC(npcId: string): Promise<void> {
  await deleteDoc(doc(db, 'npcs', npcId));
}

// Batch operations for importing multiple NPCs
export async function batchCreateNPCs(npcs: Array<Omit<NPC, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const batch = writeBatch(db);
  
  npcs.forEach(npc => {
    const docRef = doc(collection(db, 'npcs'));
    batch.set(docRef, {
      ...npc,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
  
  await batch.commit();
}

export async function batchUpdateNPCs(updates: Array<{ id: string; data: Partial<NPC> }>): Promise<void> {
  const batch = writeBatch(db);
  
  updates.forEach(({ id, data }) => {
    const { id: _, createdAt, ...updateData } = data;
    const docRef = doc(db, 'npcs', id);
    batch.update(docRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
  });
  
  await batch.commit();
}

export async function batchDeleteNPCs(npcIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  
  npcIds.forEach(npcId => {
    const docRef = doc(db, 'npcs', npcId);
    batch.delete(docRef);
  });
  
  await batch.commit();
}