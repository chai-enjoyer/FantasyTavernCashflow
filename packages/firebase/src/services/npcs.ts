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
import type { NPC } from '@repo/shared';

export async function getNPC(npcId: string): Promise<NPC | null> {
  const npcDoc = await getDoc(doc(db, 'npcs', npcId));
  if (!npcDoc.exists()) return null;
  
  const data = npcDoc.data();
  return {
    id: npcDoc.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as NPC;
}

export async function getAllNPCs(): Promise<NPC[]> {
  const npcsSnapshot = await getDocs(collection(db, 'npcs'));
  return npcsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  })) as NPC[];
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