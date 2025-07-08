'use client';

import { useEffect, useState } from 'react';
import { GameProvider } from '@/contexts/GameContext';
import GameScreen from '@/components/GameScreen';
import LoadingScreen from '@/components/LoadingScreen';
import TestModeInfo from '@/components/TestModeInfo';
import { useTelegram } from '@/hooks/useTelegram';

export default function Home() {
  const { isReady, telegram } = useTelegram();
  const [showTestInfo, setShowTestInfo] = useState(false);
  const [testModeStarted, setTestModeStarted] = useState(false);

  useEffect(() => {
    // Add Telegram WebApp script if not already loaded
    if (typeof window !== 'undefined' && !window.Telegram) {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-web-app.js';
      script.async = true;
      document.head.appendChild(script);
    }

    // Check for test mode
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('testMode') === 'true' && !window.Telegram?.WebApp) {
        setShowTestInfo(true);
      }
    }
  }, []);

  const handleStartTest = () => {
    setShowTestInfo(false);
    setTestModeStarted(true);
  };

  if (showTestInfo && !testModeStarted) {
    return <TestModeInfo onStartTest={handleStartTest} />;
  }

  if (!isReady && !testModeStarted) {
    return <LoadingScreen />;
  }

  return (
    <GameProvider>
      <GameScreen />
    </GameProvider>
  );
}