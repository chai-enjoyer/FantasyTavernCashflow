'use client';

import { useEffect } from 'react';
import { GameProvider } from '@/contexts/GameContext';
import GameScreen from '@/components/GameScreen';
import LoadingScreen from '@/components/LoadingScreen';
import { useTelegram } from '@/hooks/useTelegram';

export default function Home() {
  const { isReady, telegram } = useTelegram();

  useEffect(() => {
    // Add Telegram WebApp script if not already loaded
    if (typeof window !== 'undefined' && !window.Telegram) {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-web-app.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <GameProvider>
      <GameScreen />
    </GameProvider>
  );
}