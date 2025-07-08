import { useCallback } from 'react';
import { AnalyticsService } from '@/services/analytics';

export function useAnalytics() {
  const analytics = AnalyticsService.getInstance();

  const track = useCallback((eventName: string, properties?: Record<string, any>) => {
    analytics.track(eventName, properties);
  }, [analytics]);

  const trackError = useCallback((message: string, error?: Error, context?: Record<string, any>) => {
    analytics.logError(message, error?.stack, context);
  }, [analytics]);

  const trackScreenView = useCallback((screenName: string) => {
    analytics.trackScreenView(screenName);
  }, [analytics]);

  const trackUserAction = useCallback((action: string, details?: Record<string, any>) => {
    analytics.trackUserAction(action, details);
  }, [analytics]);

  return {
    track,
    trackError,
    trackScreenView,
    trackUserAction,
    analytics,
  };
}