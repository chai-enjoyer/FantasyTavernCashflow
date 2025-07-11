import { getAllCards, getAllNPCs, getGameConfig, DataCache, ProgressiveDataLoader, CardIndex } from '@repo/firebase';
import { Card, NPC, GameConfig } from '@repo/shared';

interface PreloadResult {
  cards: Card[];
  npcs: NPC[];
  config: GameConfig | null;
  cacheSize: number;
  loadTime: number;
}

export class GameDataPreloader {
  private static instance: GameDataPreloader;
  private isPreloaded = false;
  private preloadPromise: Promise<PreloadResult> | null = null;
  private progressiveLoader = ProgressiveDataLoader.getInstance();
  private cardIndex = CardIndex.getInstance();

  private constructor() {}

  public static getInstance(): GameDataPreloader {
    if (!GameDataPreloader.instance) {
      GameDataPreloader.instance = new GameDataPreloader();
    }
    return GameDataPreloader.instance;
  }

  /**
   * Preload all game data on app initialization
   * This should be called as early as possible in the app lifecycle
   */
  public async preloadGameData(): Promise<PreloadResult> {
    // If already preloading, return the existing promise
    if (this.preloadPromise) {
      return this.preloadPromise;
    }

    // If already preloaded, return cached data
    if (this.isPreloaded) {
      const cache = DataCache.getInstance();
      return {
        cards: cache.getCards() || [],
        npcs: cache.getNPCs() || [],
        config: cache.getGameConfig(),
        cacheSize: cache.getCacheSize(),
        loadTime: 0,
      };
    }

    // Start preloading
    this.preloadPromise = this.performPreload();
    return this.preloadPromise;
  }

  private async performPreload(): Promise<PreloadResult> {
    const startTime = performance.now();
    const cache = DataCache.getInstance();

    console.log('🚀 Starting progressive game data preload...');

    try {
      // Start progressive loading with progress tracking
      await this.progressiveLoader.startLoading((progress) => {
        console.log(`📊 Loading ${progress.phase}: ${progress.percentage}%`);
      });
      
      // Wait for critical data to be available
      await this.progressiveLoader.waitForCriticalData();
      
      // Get all loaded data from cache
      const cards = cache.getCards() || [];
      const npcs = cache.getNPCs() || [];
      const config = cache.getGameConfig();

      // Build card index immediately for instant lookups
      if (cards.length > 0 && npcs.length > 0) {
        this.cardIndex.buildIndex(cards, npcs);
        console.log('🏗️ Card index built for instant lookups');
      }

      const loadTime = performance.now() - startTime;
      const cacheSize = cache.getCacheSize();

      console.log(`✅ Critical data preloaded in ${loadTime.toFixed(2)}ms`);
      console.log(`📊 Cache size: ${(cacheSize / 1024).toFixed(2)}KB`);
      console.log(`📦 Loaded: ${cards.length} cards, ${npcs.length} NPCs`);
      console.log(`🗂️ Card index stats:`, this.cardIndex.getStats());

      this.isPreloaded = true;

      // Log cache statistics
      const stats = cache.getStats();
      console.log('📈 Cache stats:', stats);

      return {
        cards,
        npcs,
        config,
        cacheSize,
        loadTime,
      };
    } catch (error) {
      console.error('❌ Failed to preload game data:', error);
      // Even if preload fails, mark as attempted to avoid repeated failures
      this.isPreloaded = true;
      throw error;
    } finally {
      this.preloadPromise = null;
    }
  }

  /**
   * Get preload status
   */
  public getStatus(): {
    isPreloaded: boolean;
    isPreloading: boolean;
    cacheStats: ReturnType<DataCache['getStats']>;
    progressiveStatus: ReturnType<ProgressiveDataLoader['getStatus']>;
  } {
    const cache = DataCache.getInstance();
    return {
      isPreloaded: this.isPreloaded,
      isPreloading: this.preloadPromise !== null,
      cacheStats: cache.getStats(),
      progressiveStatus: this.progressiveLoader.getStatus(),
    };
  }

  /**
   * Clear all cached data and reset preload status
   */
  public clearCache(): void {
    const cache = DataCache.getInstance();
    cache.clear();
    this.isPreloaded = false;
    this.preloadPromise = null;
    console.log('🗑️ Cache cleared');
  }

  /**
   * Refresh specific data types
   */
  public async refreshData(dataType: 'cards' | 'npcs' | 'config' | 'all'): Promise<void> {
    const cache = DataCache.getInstance();
    
    switch (dataType) {
      case 'cards':
        cache.delete('all_cards');
        await getAllCards();
        break;
      case 'npcs':
        cache.delete('all_npcs');
        await getAllNPCs();
        break;
      case 'config':
        cache.delete('game_config');
        await getGameConfig();
        break;
      case 'all':
        this.clearCache();
        await this.preloadGameData();
        break;
    }
  }
}