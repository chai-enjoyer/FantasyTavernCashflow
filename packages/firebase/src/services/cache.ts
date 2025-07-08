import { Card, NPC, GameConfig } from '@repo/shared';
import { IndexedDBService } from './indexeddb';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
}

export class DataCache {
  private static instance: DataCache;
  private cache = new Map<string, CacheEntry<any>>();
  private stats: CacheStats = { hits: 0, misses: 0, size: 0 };
  
  // Cache TTLs (in milliseconds)
  private static readonly TTL = {
    CARDS: 1000 * 60 * 60 * 24, // 24 hours - cards rarely change
    NPCS: 1000 * 60 * 60 * 24,  // 24 hours - NPCs rarely change
    CONFIG: 1000 * 60 * 60,      // 1 hour - config might change more often
    USER: 1000 * 60 * 5,         // 5 minutes - user data changes frequently
  };

  private constructor() {
    // Check for Telegram Mini App storage limitations
    if (typeof window !== 'undefined') {
      // Initialize IndexedDB first if supported
      if (IndexedDBService.isSupported()) {
        IndexedDBService.getInstance().init()
          .then(() => this.loadFromOfflineStorage())
          .catch(error => {
            console.error('Failed to initialize IndexedDB:', error);
            this.loadFromLocalStorage().catch(err => 
              console.error('Failed to load from localStorage:', err)
            );
          });
      } else {
        this.loadFromLocalStorage();
      }
      
      window.addEventListener('beforeunload', () => this.saveToLocalStorage());
    }
  }

  public static getInstance(): DataCache {
    if (!DataCache.instance) {
      DataCache.instance = new DataCache();
    }
    return DataCache.instance;
  }

  // Generic cache methods
  set<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
    this.stats.size = this.cache.size;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if cache entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check expiration
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.stats.size = this.cache.size;
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, size: 0 };
    
    // Clear IndexedDB as well
    if (IndexedDBService.isSupported()) {
      try {
        await IndexedDBService.getInstance().clear();
      } catch (error) {
        console.error('Failed to clear IndexedDB:', error);
      }
    }
    
    // Clear localStorage
    try {
      localStorage.removeItem('fantasy_tavern_cache');
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  // Specialized cache methods for game data
  async setCards(cards: Card[]): Promise<void> {
    this.set('all_cards', cards, DataCache.TTL.CARDS);
    
    // Also cache individual cards by ID for quick access
    cards.forEach(card => {
      this.set(`card_${card.id}`, card, DataCache.TTL.CARDS);
    });
    
    // Save to IndexedDB for offline support
    if (IndexedDBService.isSupported()) {
      try {
        await IndexedDBService.getInstance().saveGameData({ cards });
      } catch (error) {
        console.error('Failed to save cards to IndexedDB:', error);
      }
    }
  }

  getCards(): Card[] | null {
    return this.get<Card[]>('all_cards');
  }

  getCard(id: string): Card | null {
    return this.get<Card>(`card_${id}`);
  }

  async setNPCs(npcs: NPC[]): Promise<void> {
    this.set('all_npcs', npcs, DataCache.TTL.NPCS);
    
    // Cache individual NPCs by ID
    npcs.forEach(npc => {
      this.set(`npc_${npc.id}`, npc, DataCache.TTL.NPCS);
    });
    
    // Save to IndexedDB for offline support
    if (IndexedDBService.isSupported()) {
      try {
        await IndexedDBService.getInstance().saveGameData({ npcs });
      } catch (error) {
        console.error('Failed to save NPCs to IndexedDB:', error);
      }
    }
  }

  getNPCs(): NPC[] | null {
    return this.get<NPC[]>('all_npcs');
  }

  getNPC(id: string): NPC | null {
    return this.get<NPC>(`npc_${id}`);
  }

  async setGameConfig(config: GameConfig): Promise<void> {
    this.set('game_config', config, DataCache.TTL.CONFIG);
    
    // Save to IndexedDB for offline support
    if (IndexedDBService.isSupported()) {
      try {
        await IndexedDBService.getInstance().saveGameData({ config });
      } catch (error) {
        console.error('Failed to save config to IndexedDB:', error);
      }
    }
  }

  getGameConfig(): GameConfig | null {
    return this.get<GameConfig>('game_config');
  }

  // Cache statistics
  getStats(): CacheStats {
    return { ...this.stats };
  }

  getCacheSize(): number {
    let totalSize = 0;
    this.cache.forEach((entry) => {
      totalSize += JSON.stringify(entry).length;
    });
    return totalSize;
  }

  // Telegram Mini App storage (5MB limit)
  private saveToLocalStorage(): void {
    try {
      // Only save critical data that fits in localStorage
      const criticalData = {
        cards: this.get<Card[]>('all_cards'),
        npcs: this.get<NPC[]>('all_npcs'),
        config: this.get<GameConfig>('game_config'),
        timestamp: Date.now(),
      };

      const dataStr = JSON.stringify(criticalData);
      
      // Check Telegram Mini App 5MB limit
      if (dataStr.length < 5 * 1024 * 1024) {
        localStorage.setItem('fantasy_tavern_cache', dataStr);
        console.log(`Cache saved: ${(dataStr.length / 1024).toFixed(2)}KB`);
      } else {
        console.warn('Cache too large for Telegram Mini App storage');
      }
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }

  private async loadFromOfflineStorage(): Promise<void> {
    // Try IndexedDB first (larger storage, better performance)
    if (IndexedDBService.isSupported()) {
      try {
        const gameData = await IndexedDBService.getInstance().getGameData();
        if (gameData) {
          if (gameData.cards) await this.setCards(gameData.cards);
          if (gameData.npcs) await this.setNPCs(gameData.npcs);
          if (gameData.config) await this.setGameConfig(gameData.config);
          console.log('Cache loaded from IndexedDB');
          return;
        }
      } catch (error) {
        console.error('Failed to load from IndexedDB:', error);
      }
    }
    
    // Fallback to localStorage
    this.loadFromLocalStorage();
  }
  
  private async loadFromLocalStorage(): Promise<void> {
    try {
      const dataStr = localStorage.getItem('fantasy_tavern_cache');
      if (!dataStr) return;

      const data = JSON.parse(dataStr);
      
      // Check if cache is not too old (24 hours)
      if (Date.now() - data.timestamp < 1000 * 60 * 60 * 24) {
        const promises = [];
        if (data.cards) promises.push(this.setCards(data.cards));
        if (data.npcs) promises.push(this.setNPCs(data.npcs));
        if (data.config) promises.push(this.setGameConfig(data.config));
        
        await Promise.all(promises);
        console.log('Cache loaded from localStorage');
      } else {
        localStorage.removeItem('fantasy_tavern_cache');
        console.log('Cache expired, removed from localStorage');
      }
    } catch (error) {
      console.error('Failed to load cache:', error);
      localStorage.removeItem('fantasy_tavern_cache');
    }
  }

  // Preload all game data
  async preloadGameData(
    loadCards: () => Promise<Card[]>,
    loadNPCs: () => Promise<NPC[]>,
    loadConfig: () => Promise<GameConfig | null>
  ): Promise<void> {
    console.log('Preloading game data...');
    
    // Load in parallel for faster startup
    const [cards, npcs, config] = await Promise.all([
      this.getCards() || loadCards(),
      this.getNPCs() || loadNPCs(),
      this.getGameConfig() || loadConfig(),
    ]);

    // Update cache with fresh data
    if (!this.has('all_cards') && cards) this.setCards(cards);
    if (!this.has('all_npcs') && npcs) this.setNPCs(npcs);
    if (!this.has('game_config') && config) this.setGameConfig(config);

    console.log('Game data preloaded:', {
      cards: cards?.length || 0,
      npcs: npcs?.length || 0,
      config: !!config,
      cacheSize: `${(this.getCacheSize() / 1024).toFixed(2)}KB`,
    });
  }
}