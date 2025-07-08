import { Card, NPC, GameConfig } from '@repo/shared';

interface GameDataStore {
  cards: Card[];
  npcs: NPC[];
  config: GameConfig | null;
  timestamp: number;
}

/**
 * IndexedDB service for offline storage
 * Provides persistent storage that survives app restarts
 */
export class IndexedDBService {
  private static instance: IndexedDBService;
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'FantasyTavernGameData';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'gameData';
  private readonly TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

  private constructor() {}

  public static getInstance(): IndexedDBService {
    if (!IndexedDBService.instance) {
      IndexedDBService.instance = new IndexedDBService();
    }
    return IndexedDBService.instance;
  }

  /**
   * Initialize IndexedDB connection
   */
  public async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      };
    });
  }

  /**
   * Save game data to IndexedDB
   */
  public async saveGameData(data: Partial<GameDataStore>): Promise<void> {
    await this.ensureInitialized();

    const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
    const store = transaction.objectStore(this.STORE_NAME);

    // Get existing data
    const existingData = await this.getGameData();
    
    // Merge with new data
    const updatedData: GameDataStore = {
      cards: data.cards || existingData?.cards || [],
      npcs: data.npcs || existingData?.npcs || [],
      config: data.config || existingData?.config || null,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const request = store.put(updatedData, 'gameData');
      
      request.onsuccess = () => {
        console.log('Game data saved to IndexedDB');
        resolve();
      };
      
      request.onerror = () => {
        console.error('Failed to save game data:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get game data from IndexedDB
   */
  public async getGameData(): Promise<GameDataStore | null> {
    await this.ensureInitialized();

    const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
    const store = transaction.objectStore(this.STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get('gameData');
      
      request.onsuccess = () => {
        const data = request.result as GameDataStore | undefined;
        
        // Check if data exists and is not expired
        if (data && Date.now() - data.timestamp < this.TTL) {
          console.log('Game data loaded from IndexedDB');
          resolve(data);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => {
        console.error('Failed to get game data:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Clear all stored data
   */
  public async clear(): Promise<void> {
    await this.ensureInitialized();

    const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
    const store = transaction.objectStore(this.STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      
      request.onsuccess = () => {
        console.log('IndexedDB cleared');
        resolve();
      };
      
      request.onerror = () => {
        console.error('Failed to clear IndexedDB:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get database size
   */
  public async getSize(): Promise<number> {
    try {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    } catch (error) {
      console.error('Failed to get storage estimate:', error);
      return 0;
    }
  }

  /**
   * Ensure database is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.db) {
      await this.init();
    }
  }

  /**
   * Check if IndexedDB is supported
   */
  public static isSupported(): boolean {
    return typeof indexedDB !== 'undefined';
  }
}