import { StorageService } from './storage';
import { TelegramService } from './telegram';

interface AudioClip {
  url: string;
  volume: number;
  duration?: number;
}

const SOUND_EFFECTS: Record<string, AudioClip> = {
  // UI Sounds
  buttonClick: { url: '/sounds/button-click.mp3', volume: 0.5 },
  cardFlip: { url: '/sounds/card-flip.mp3', volume: 0.6 },
  coinDrop: { url: '/sounds/coin-drop.mp3', volume: 0.4 },
  
  // Money sounds
  moneyGain: { url: '/sounds/money-gain.mp3', volume: 0.5 },
  moneyLoss: { url: '/sounds/money-loss.mp3', volume: 0.5 },
  
  // Game events
  achievement: { url: '/sounds/achievement.mp3', volume: 0.7 },
  levelUp: { url: '/sounds/level-up.mp3', volume: 0.8 },
  gameOver: { url: '/sounds/game-over.mp3', volume: 0.6 },
  
  // NPC sounds
  npcHappy: { url: '/sounds/npc-happy.mp3', volume: 0.5 },
  npcAngry: { url: '/sounds/npc-angry.mp3', volume: 0.5 },
  npcNeutral: { url: '/sounds/npc-neutral.mp3', volume: 0.5 },
  
  // Special events
  dragonRoar: { url: '/sounds/dragon-roar.mp3', volume: 0.7 },
  magicSpell: { url: '/sounds/magic-spell.mp3', volume: 0.6 },
  swordClash: { url: '/sounds/sword-clash.mp3', volume: 0.5 },
};

export class AudioService {
  private static instance: AudioService;
  private audioContext: AudioContext | null = null;
  private loadedSounds: Map<string, AudioBuffer> = new Map();
  private backgroundMusic: HTMLAudioElement | null = null;
  private storage: StorageService;
  private telegram: TelegramService;
  private soundEnabled: boolean;
  private musicEnabled: boolean;
  private hapticEnabled: boolean;

  private constructor() {
    this.storage = StorageService.getInstance();
    this.telegram = TelegramService.getInstance();
    this.soundEnabled = this.storage.getSoundEnabled();
    this.musicEnabled = this.storage.getMusicEnabled();
    this.hapticEnabled = this.storage.getHapticEnabled();
    
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new AudioContext();
      this.preloadSounds();
    }
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  private async preloadSounds(): Promise<void> {
    if (!this.audioContext) return;

    // Preload common sounds
    const commonSounds = ['buttonClick', 'cardFlip', 'coinDrop', 'moneyGain', 'moneyLoss'];
    
    for (const soundName of commonSounds) {
      const sound = SOUND_EFFECTS[soundName];
      if (sound) {
        try {
          const response = await fetch(sound.url);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
          this.loadedSounds.set(soundName, audioBuffer);
        } catch (error) {
          console.warn(`Failed to preload sound: ${soundName}`, error);
        }
      }
    }
  }

  public async playSound(soundName: keyof typeof SOUND_EFFECTS): Promise<void> {
    if (!this.soundEnabled || !this.audioContext) return;

    const sound = SOUND_EFFECTS[soundName];
    if (!sound) return;

    try {
      let audioBuffer = this.loadedSounds.get(soundName);
      
      if (!audioBuffer) {
        const response = await fetch(sound.url);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.loadedSounds.set(soundName, audioBuffer);
      }

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = audioBuffer;
      gainNode.gain.value = sound.volume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start(0);

      // Haptic feedback for certain sounds
      if (this.hapticEnabled) {
        switch (soundName) {
          case 'buttonClick':
          case 'cardFlip':
            this.telegram.hapticFeedback('selection');
            break;
          case 'achievement':
          case 'levelUp':
            this.telegram.hapticFeedback('notification');
            break;
          case 'gameOver':
          case 'moneyLoss':
            this.telegram.hapticFeedback('impact');
            break;
        }
      }
    } catch (error) {
      console.warn(`Failed to play sound: ${soundName}`, error);
    }
  }

  public playBackgroundMusic(url: string, volume: number = 0.3): void {
    if (!this.musicEnabled) return;

    this.stopBackgroundMusic();

    try {
      this.backgroundMusic = new Audio(url);
      this.backgroundMusic.volume = volume;
      this.backgroundMusic.loop = true;
      this.backgroundMusic.play().catch(error => {
        console.warn('Failed to play background music:', error);
      });
    } catch (error) {
      console.warn('Failed to create background music:', error);
    }
  }

  public stopBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.src = '';
      this.backgroundMusic = null;
    }
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    this.storage.setSoundEnabled(enabled);
  }

  public setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    this.storage.setMusicEnabled(enabled);
    
    if (!enabled) {
      this.stopBackgroundMusic();
    }
  }

  public setHapticEnabled(enabled: boolean): void {
    this.hapticEnabled = enabled;
    this.storage.setHapticEnabled(enabled);
  }

  public getSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public getMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  public getHapticEnabled(): boolean {
    return this.hapticEnabled;
  }

  // Game-specific sound methods
  public playMoneyChange(amount: number): void {
    if (amount > 0) {
      this.playSound('moneyGain');
    } else if (amount < 0) {
      this.playSound('moneyLoss');
    }
  }

  public playNPCSound(emotion: 'positive' | 'negative' | 'neutral'): void {
    switch (emotion) {
      case 'positive':
        this.playSound('npcHappy');
        break;
      case 'negative':
        this.playSound('npcAngry');
        break;
      case 'neutral':
        this.playSound('npcNeutral');
        break;
    }
  }

  public playSpecialSound(npcClass: string): void {
    switch (npcClass) {
      case 'dragon':
        this.playSound('dragonRoar');
        break;
      case 'mage':
        this.playSound('magicSpell');
        break;
      case 'adventurer':
        this.playSound('swordClash');
        break;
    }
  }
}