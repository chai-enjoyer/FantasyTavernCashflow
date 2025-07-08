import { TelegramService } from './telegram';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

interface ErrorEvent {
  message: string;
  stack?: string;
  context?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private sessionId: string;
  private telegram: TelegramService;
  private eventQueue: AnalyticsEvent[] = [];
  private errorQueue: ErrorEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.telegram = TelegramService.getInstance();
    this.setupErrorHandlers();
    this.startFlushInterval();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupErrorHandlers(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.logError(event.message, event.error?.stack, {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.logError(
          `Unhandled Promise Rejection: ${event.reason}`,
          event.reason?.stack,
          { type: 'unhandledRejection' }
        );
      });
    }
  }

  private startFlushInterval(): void {
    // Flush events every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000);
  }

  public track(eventName: string, properties?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: Date.now(),
      userId: this.telegram.getUserId(),
      sessionId: this.sessionId,
    };

    this.eventQueue.push(event);

    // Flush immediately for important events
    const importantEvents = [
      'game_started',
      'game_over',
      'tutorial_completed',
      'purchase_made',
      'error_occurred',
    ];

    if (importantEvents.includes(eventName)) {
      this.flush();
    }
  }

  public logError(message: string, stack?: string, context?: Record<string, any>): void {
    const error: ErrorEvent = {
      message,
      stack,
      context,
      timestamp: Date.now(),
      userId: this.telegram.getUserId(),
      sessionId: this.sessionId,
    };

    this.errorQueue.push(error);
    console.error('Error logged:', error);

    // Flush errors immediately
    this.flush();
  }

  private async flush(): Promise<void> {
    if (this.eventQueue.length === 0 && this.errorQueue.length === 0) {
      return;
    }

    const events = [...this.eventQueue];
    const errors = [...this.errorQueue];

    // Clear queues
    this.eventQueue = [];
    this.errorQueue = [];

    try {
      // In production, send to your analytics endpoint
      if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'production') {
        await this.sendToAnalytics(events, errors);
      } else {
        // In development, log to console
        if (events.length > 0) {
          console.log('Analytics Events:', events);
        }
        if (errors.length > 0) {
          console.error('Error Events:', errors);
        }
      }
    } catch (error) {
      console.error('Failed to send analytics:', error);
      // Re-add events to queue
      this.eventQueue.push(...events);
      this.errorQueue.push(...errors);
    }
  }

  private async sendToAnalytics(events: AnalyticsEvent[], errors: ErrorEvent[]): Promise<void> {
    const analyticsEndpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
    
    if (!analyticsEndpoint) {
      return;
    }

    const payload = {
      events,
      errors,
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      platform: 'telegram-web-app',
    };

    await fetch(analyticsEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  // Game-specific tracking methods
  public trackGameStart(gameState: any): void {
    this.track('game_started', {
      money: gameState.money,
      reputation: gameState.reputation,
      turn: gameState.turn,
    });
  }

  public trackGameOver(gameState: any, reason: string): void {
    this.track('game_over', {
      reason,
      finalMoney: gameState.money,
      finalReputation: gameState.reputation,
      turnsPlayed: gameState.turn,
    });
  }

  public trackDecision(cardId: string, choice: number, result: any): void {
    this.track('decision_made', {
      cardId,
      choice,
      moneyChange: result.moneyChange,
      reputationChange: result.reputationChange,
    });
  }

  public trackTutorial(step: string): void {
    this.track('tutorial_progress', { step });
  }

  public trackScreenView(screenName: string): void {
    this.track('screen_view', { screenName });
  }

  public trackUserAction(action: string, details?: Record<string, any>): void {
    this.track('user_action', {
      action,
      ...details,
    });
  }

  // Cleanup
  public destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}