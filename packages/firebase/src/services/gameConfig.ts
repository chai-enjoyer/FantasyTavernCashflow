import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config';
import { DataCache } from './cache';
import type { GameConfig } from '@repo/shared';

const GAME_CONFIG_ID = 'main';

export async function getGameConfig(): Promise<GameConfig | null> {
  const cache = DataCache.getInstance();
  
  // Check cache first
  const cachedConfig = cache.getGameConfig();
  if (cachedConfig) {
    console.log('Game config loaded from cache');
    return cachedConfig;
  }
  
  // If not in cache, fetch from Firestore
  console.log('Loading game config from Firestore...');
  const configDoc = await getDoc(doc(db, 'gameConfig', GAME_CONFIG_ID));
  if (!configDoc.exists()) return null;
  
  const data = configDoc.data();
  const config = {
    ...data,
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as GameConfig;
  
  // Cache the config
  await cache.setGameConfig(config);
  
  return config;
}

export async function updateGameConfig(config: Partial<GameConfig>): Promise<void> {
  const { updatedAt, ...updateData } = config;
  await setDoc(doc(db, 'gameConfig', GAME_CONFIG_ID), {
    ...updateData,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function initializeGameConfig(): Promise<void> {
  const defaultConfig: Omit<GameConfig, 'updatedAt'> = {
    startingMoney: 10000,
    startingReputation: 0,
    baseIncome: 1000,
    baseCosts: 800,
    scalingFormulas: {
      moneyScaling: 'baseMoney * Math.pow(currentBalance / 10000, 0.8) * (0.5 + Math.random() * 1.5)',
      reputationImpact: 'See game design document for full formula',
      riskCalculation: 'See game design document for full formula',
    },
    version: '1.0.0',
  };
  
  await setDoc(doc(db, 'gameConfig', GAME_CONFIG_ID), {
    ...defaultConfig,
    updatedAt: serverTimestamp(),
  });
}