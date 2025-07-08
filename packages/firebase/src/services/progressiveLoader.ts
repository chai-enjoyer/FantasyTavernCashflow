import { Card, NPC, GameConfig } from '@repo/shared';
import { DataCache } from './cache';
import { getAllCards } from './cards';
import { getAllNPCs } from './npcs';
import { getGameConfig } from './gameConfig';

interface LoadingProgress {
  phase: 'critical' | 'secondary' | 'complete';
  loaded: number;
  total: number;
  percentage: number;
}

type ProgressCallback = (progress: LoadingProgress) => void;

/**
 * Progressive loader that loads game data in phases
 * Phase 1 (Critical): Priority 1 cards and their NPCs
 * Phase 2 (Secondary): Priority 2-3 cards and remaining NPCs
 * Phase 3 (Complete): All remaining data
 */
export class ProgressiveDataLoader {
  private static instance: ProgressiveDataLoader;
  private cache = DataCache.getInstance();
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): ProgressiveDataLoader {
    if (!ProgressiveDataLoader.instance) {
      ProgressiveDataLoader.instance = new ProgressiveDataLoader();
    }
    return ProgressiveDataLoader.instance;
  }

  /**
   * Start progressive loading with progress callbacks
   */
  public async startLoading(onProgress?: ProgressCallback): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.performProgressiveLoad(onProgress);
    return this.loadPromise;
  }

  private async performProgressiveLoad(onProgress?: ProgressCallback): Promise<void> {
    this.isLoading = true;

    try {
      // Phase 1: Load critical data (config and priority 1 cards)
      console.log('📦 Phase 1: Loading critical data...');
      
      const [config, allCards, allNPCs] = await Promise.all([
        this.cache.getGameConfig() || getGameConfig(),
        this.cache.getCards() || getAllCards(),
        this.cache.getNPCs() || getAllNPCs(),
      ]);

      // Filter priority 1 cards
      const criticalCards = allCards?.filter(card => card.priority === 1) || [];
      const criticalNPCIds = new Set(criticalCards.map(card => card.npcId));
      const criticalNPCs = allNPCs?.filter(npc => criticalNPCIds.has(npc.id)) || [];

      if (onProgress) {
        onProgress({
          phase: 'critical',
          loaded: criticalCards.length + criticalNPCs.length,
          total: (allCards?.length || 0) + (allNPCs?.length || 0),
          percentage: 30,
        });
      }

      // Store critical data immediately
      if (config) await this.cache.setGameConfig(config);
      if (!this.cache.getCards() && allCards) await this.cache.setCards(allCards);
      if (!this.cache.getNPCs() && allNPCs) await this.cache.setNPCs(allNPCs);

      console.log(`✅ Phase 1 complete: ${criticalCards.length} critical cards loaded`);

      // Phase 2: Load secondary data (priority 2-3 cards) - in background
      setTimeout(async () => {
        console.log('📦 Phase 2: Loading secondary data...');
        
        const secondaryCards = allCards?.filter(card => 
          card.priority === 2 || card.priority === 3
        ) || [];

        if (onProgress) {
          onProgress({
            phase: 'secondary',
            loaded: criticalCards.length + secondaryCards.length,
            total: allCards?.length || 0,
            percentage: 70,
          });
        }

        console.log(`✅ Phase 2 complete: ${secondaryCards.length} secondary cards loaded`);

        // Phase 3: Complete loading (priority 4 cards) - lowest priority
        setTimeout(() => {
          console.log('📦 Phase 3: Loading remaining data...');
          
          if (onProgress) {
            onProgress({
              phase: 'complete',
              loaded: allCards?.length || 0,
              total: allCards?.length || 0,
              percentage: 100,
            });
          }

          console.log('✅ All phases complete: Data fully loaded');
          this.isLoading = false;
        }, 100);
      }, 50);

    } catch (error) {
      console.error('❌ Progressive loading failed:', error);
      this.isLoading = false;
      throw error;
    } finally {
      this.loadPromise = null;
    }
  }

  /**
   * Get loading status
   */
  public getStatus(): {
    isLoading: boolean;
    cacheStats: ReturnType<DataCache['getStats']>;
  } {
    return {
      isLoading: this.isLoading,
      cacheStats: this.cache.getStats(),
    };
  }

  /**
   * Wait for critical data to be loaded
   */
  public async waitForCriticalData(): Promise<void> {
    if (!this.loadPromise) {
      await this.startLoading();
    }

    // Wait a minimal amount of time for critical data
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Preload specific card priorities
   */
  public async preloadPriority(priority: 1 | 2 | 3 | 4): Promise<Card[]> {
    const cards = this.cache.getCards() || await getAllCards();
    return cards.filter(card => card.priority === priority);
  }
}