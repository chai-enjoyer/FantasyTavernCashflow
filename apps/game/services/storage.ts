const STORAGE_KEYS = {
  TUTORIAL_COMPLETED: 'fantasy_tavern_tutorial_completed',
  SOUND_ENABLED: 'fantasy_tavern_sound_enabled',
  MUSIC_ENABLED: 'fantasy_tavern_music_enabled',
  HAPTIC_ENABLED: 'fantasy_tavern_haptic_enabled',
} as const;

export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private isStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  public get<T>(key: keyof typeof STORAGE_KEYS, defaultValue: T): T {
    if (!this.isStorageAvailable()) {
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(STORAGE_KEYS[key]);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  }

  public set<T>(key: keyof typeof STORAGE_KEYS, value: T): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  public remove(key: keyof typeof STORAGE_KEYS): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEYS[key]);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }

  // Convenience methods
  public getTutorialCompleted(): boolean {
    return this.get('TUTORIAL_COMPLETED', false);
  }

  public setTutorialCompleted(completed: boolean): void {
    this.set('TUTORIAL_COMPLETED', completed);
  }

  public getSoundEnabled(): boolean {
    return this.get('SOUND_ENABLED', true);
  }

  public setSoundEnabled(enabled: boolean): void {
    this.set('SOUND_ENABLED', enabled);
  }

  public getMusicEnabled(): boolean {
    return this.get('MUSIC_ENABLED', true);
  }

  public setMusicEnabled(enabled: boolean): void {
    this.set('MUSIC_ENABLED', enabled);
  }

  public getHapticEnabled(): boolean {
    return this.get('HAPTIC_ENABLED', true);
  }

  public setHapticEnabled(enabled: boolean): void {
    this.set('HAPTIC_ENABLED', enabled);
  }
}