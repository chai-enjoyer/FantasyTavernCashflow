import { TelegramWebApp, TelegramUser } from '../types/telegram';

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export class TelegramService {
  private static instance: TelegramService;
  private webApp: TelegramWebApp | null = null;
  private mockMode: boolean = false;
  private testMode: boolean = false;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService();
    }
    return TelegramService.instance;
  }

  private initialize(): void {
    if (typeof window !== 'undefined') {
      // Check for test mode
      const urlParams = new URLSearchParams(window.location.search);
      this.testMode = urlParams.get('testMode') === 'true';
      
      if (this.testMode) {
        console.log('🧪 Test Mode Enabled - Running without Telegram');
        this.mockMode = true;
      } else if (window.Telegram?.WebApp) {
        this.webApp = window.Telegram.WebApp;
        this.webApp.ready();
        this.webApp.expand();
        
        // Set theme
        this.webApp.setHeaderColor('#1a1a1a');
        this.webApp.setBackgroundColor('#0a0a0a');
        
        // Enable closing confirmation
        this.webApp.enableClosingConfirmation();
      } else {
        console.warn('Telegram WebApp not available, running in mock mode');
        this.mockMode = true;
      }
    }
  }

  public isTestMode(): boolean {
    return this.testMode;
  }

  public getUser(): TelegramUser | null {
    if (this.mockMode) {
      // Return mock user for development
      const mockUserId = this.testMode ? 
        `test_${Date.now()}_${Math.random().toString(36).substring(7)}` : 
        '123456789';
      
      return {
        id: mockUserId as any,
        first_name: 'Test',
        last_name: 'User',
        username: this.testMode ? 'browser_tester' : 'testuser',
        language_code: 'en',
        is_premium: false,
      };
    }

    return this.webApp?.initDataUnsafe?.user || null;
  }

  public getUserId(): string {
    const user = this.getUser();
    return user ? user.id.toString() : '';
  }

  public getUsername(): string | undefined {
    const user = this.getUser();
    return user?.username;
  }

  public getFullName(): string {
    const user = this.getUser();
    if (!user) return 'Anonymous';
    
    const parts = [user.first_name];
    if (user.last_name) {
      parts.push(user.last_name);
    }
    return parts.join(' ');
  }

  public showAlert(message: string): void {
    if (this.webApp) {
      this.webApp.showAlert(message);
    } else {
      alert(message);
    }
  }

  public showConfirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.webApp) {
        this.webApp.showConfirm(message, (confirmed) => {
          resolve(confirmed);
        });
      } else {
        resolve(confirm(message));
      }
    });
  }

  public showPopup(params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text: string;
    }>;
  }): Promise<string | null> {
    return new Promise((resolve) => {
      if (this.webApp) {
        this.webApp.showPopup(params, (buttonId) => {
          resolve(buttonId);
        });
      } else {
        // Fallback for development
        alert(`${params.title || ''}\n\n${params.message}`);
        resolve('ok');
      }
    });
  }

  public hapticFeedback(type: 'impact' | 'notification' | 'selection' = 'impact'): void {
    if (this.webApp?.HapticFeedback) {
      switch (type) {
        case 'impact':
          this.webApp.HapticFeedback.impactOccurred('light');
          break;
        case 'notification':
          this.webApp.HapticFeedback.notificationOccurred('success');
          break;
        case 'selection':
          this.webApp.HapticFeedback.selectionChanged();
          break;
      }
    }
  }

  public openLink(url: string, tryInstantView: boolean = true): void {
    if (this.webApp) {
      this.webApp.openLink(url, { try_instant_view: tryInstantView });
    } else {
      window.open(url, '_blank');
    }
  }

  public close(): void {
    if (this.webApp) {
      this.webApp.close();
    } else {
      window.close();
    }
  }

  public shareGame(text: string): void {
    // Next.js will replace this at build time
    const botUsername = 'FantasyTavernCashflowBot';
    const shareUrl = `https://t.me/share/url?url=https://t.me/${botUsername}&text=${encodeURIComponent(text)}`;
    this.openLink(shareUrl, false);
  }

  public getThemeParams() {
    return this.webApp?.themeParams || {
      bg_color: '#0a0a0a',
      text_color: '#ffffff',
      hint_color: '#999999',
      link_color: '#2481cc',
      button_color: '#2481cc',
      button_text_color: '#ffffff',
      secondary_bg_color: '#1a1a1a',
    };
  }

  public isExpanded(): boolean {
    return this.webApp?.isExpanded || false;
  }

  public getViewportHeight(): number {
    return this.webApp?.viewportHeight || window.innerHeight;
  }

  public onViewportChanged(callback: () => void): void {
    if (this.webApp) {
      this.webApp.onEvent('viewportChanged', callback);
    }
  }

  public offViewportChanged(callback: () => void): void {
    if (this.webApp) {
      this.webApp.offEvent('viewportChanged', callback);
    }
  }

  public setClosingConfirmation(enabled: boolean): void {
    if (enabled) {
      this.webApp?.enableClosingConfirmation();
    } else {
      this.webApp?.disableClosingConfirmation();
    }
  }

  public isVersionAtLeast(version: string): boolean {
    return this.webApp?.isVersionAtLeast(version) || false;
  }
}