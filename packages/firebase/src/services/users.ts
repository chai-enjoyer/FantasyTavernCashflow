import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../config';
import type { User, GameState, Achievement } from '@repo/shared';

export async function getUser(telegramId: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, 'users', telegramId));
  if (!userDoc.exists()) return null;
  
  const data = userDoc.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    gameState: {
      ...data.gameState,
      lastPlayedAt: data.gameState.lastPlayedAt?.toDate() || new Date(),
    },
  } as User;
}

export async function createUser(telegramId: string, username?: string): Promise<User> {
  const newUser: Omit<User, 'createdAt' | 'updatedAt'> = {
    telegramId,
    username,
    gameState: {
      money: 10000,
      reputation: 0,
      turn: 1,
      passiveIncome: [],
      debts: [],
      temporaryEffects: [],
      npcRelationships: {},
      lastPlayedAt: new Date(),
      totalPlayTime: 0,
      flags: [],
    },
    statistics: {
      gamesPlayed: 1,
      maxMoney: 10000,
      maxTurns: 1,
      totalDecisions: 0,
      bankruptcies: 0,
    },
    achievements: [],
    level: 1,
    experience: 0,
  };

  await setDoc(doc(db, 'users', telegramId), {
    ...newUser,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    'gameState.lastPlayedAt': serverTimestamp(),
  });

  return {
    ...newUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function updateGameState(
  telegramId: string,
  gameState: Partial<GameState>
): Promise<void> {
  const updates: any = {
    updatedAt: serverTimestamp(),
  };

  Object.entries(gameState).forEach(([key, value]) => {
    updates[`gameState.${key}`] = value;
  });

  if (gameState.lastPlayedAt) {
    updates['gameState.lastPlayedAt'] = Timestamp.fromDate(gameState.lastPlayedAt);
  }

  await updateDoc(doc(db, 'users', telegramId), updates);
}

export async function updateUserStatistics(
  telegramId: string,
  statistics: Partial<User['statistics']>
): Promise<void> {
  const updates: any = {
    updatedAt: serverTimestamp(),
  };

  Object.entries(statistics).forEach(([key, value]) => {
    updates[`statistics.${key}`] = value;
  });

  await updateDoc(doc(db, 'users', telegramId), updates);
}

export async function updateUserAchievements(
  telegramId: string,
  newAchievements: Achievement[],
  experience: number
): Promise<void> {
  const updates: any = {
    updatedAt: serverTimestamp(),
    experience: experience,
  };

  if (newAchievements.length > 0) {
    updates.achievements = arrayUnion(...newAchievements);
  }

  await updateDoc(doc(db, 'users', telegramId), updates);
}

export async function updateUserLevel(
  telegramId: string,
  level: number,
  experience: number
): Promise<void> {
  await updateDoc(doc(db, 'users', telegramId), {
    level,
    experience,
    updatedAt: serverTimestamp(),
  });
}