import { useEffect, useState } from 'react';
import { TelegramService } from '../services/telegram';
import { TelegramUser } from '../types/telegram';

export function useTelegram() {
  const [telegram] = useState(() => TelegramService.getInstance());
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure Telegram WebApp is fully loaded
    const timer = setTimeout(() => {
      const telegramUser = telegram.getUser();
      setUser(telegramUser);
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [telegram]);

  return {
    telegram,
    user,
    isReady,
    userId: user?.id.toString() || '',
    username: user?.username,
    fullName: telegram.getFullName(),
  };
}