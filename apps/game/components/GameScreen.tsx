'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import StatusBar from './StatusBar';
import GameCard from './GameCard';
import ResultScreen from './ResultScreen';
import GameOverScreen from './GameOverScreen';
import LoadingScreen from './LoadingScreen';
import ErrorScreen from './ErrorScreen';
import Tutorial from './Tutorial';
import PortfolioModal from './PortfolioModal';
import HelpModal from './HelpModal';
import DebugPanel from './DebugPanel';
import { GameEngine } from '@repo/game-logic';
import { StorageService } from '@/services/storage';
import { TelegramService } from '@/services/telegram';
import { BarChart3, HelpCircle } from 'lucide-react';

export default function GameScreen() {
  const {
    gameState,
    currentCard,
    currentNPC,
    isLoading,
    error,
    initializeGame,
    selectChoice,
    continueToNextCard,
    resetGame,
  } = useGame();

  const [showResult, setShowResult] = useState(false);
  const [lastChoice, setLastChoice] = useState<0 | 1 | 2 | 3 | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const gameEngine = new GameEngine();
  const storage = StorageService.getInstance();
  const telegram = TelegramService.getInstance();

  useEffect(() => {
    // Check if tutorial has been completed
    const tutorialCompleted = storage.getTutorialCompleted();
    if (!tutorialCompleted) {
      setShowTutorial(true);
    }
    initializeGame();
  }, []);

  const handleChoice = async (choiceIndex: 0 | 1 | 2 | 3) => {
    setLastChoice(choiceIndex);
    await selectChoice(choiceIndex);
    setShowResult(true);
  };

  const handleContinue = () => {
    setShowResult(false);
    setLastChoice(null);
    continueToNextCard(); // Instant, no await
  };

  const handleTutorialComplete = () => {
    storage.setTutorialCompleted(true);
    setShowTutorial(false);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} onRetry={() => initializeGame()} />;
  }

  if (!gameState || !currentCard || !currentNPC) {
    return <LoadingScreen />;
  }

  if (gameEngine.isGameOver(gameState)) {
    return <GameOverScreen gameState={gameState} onRestart={resetGame} />;
  }

  return (
    <>
      {showTutorial && <Tutorial onComplete={handleTutorialComplete} />}
      <PortfolioModal 
        isOpen={showPortfolio} 
        onClose={() => setShowPortfolio(false)} 
        gameState={gameState} 
      />
      <HelpModal 
        isOpen={showHelp} 
        onClose={() => setShowHelp(false)} 
      />
      
      <div className="game-container flex flex-col">
        <StatusBar gameState={gameState} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {showResult && lastChoice !== null ? (
              <ResultScreen
                card={currentCard}
                npc={currentNPC}
                choiceIndex={lastChoice}
                previousState={gameState}
                newState={gameState}
                onContinue={handleContinue}
              />
            ) : (
              <GameCard
                card={currentCard}
                npc={currentNPC}
                onChoice={handleChoice}
              />
            )}
          </div>
          
          {/* Bottom Action Buttons */}
          <div className="flex gap-3 p-4 bg-game-card border-t border-game-border">
            <button
              onClick={() => setShowPortfolio(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-game-bg hover:bg-gray-800 border border-game-border rounded-lg transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-semibold">Portfolio</span>
            </button>
            <button
              onClick={() => setShowHelp(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-game-bg hover:bg-gray-800 border border-game-border rounded-lg transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="font-semibold">Help</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Debug Panel for Test Mode or Browser */}
      <DebugPanel 
        gameState={gameState} 
        currentCard={currentCard} 
        isTestMode={telegram.isTestMode() || !telegram.isInTelegram()} 
      />
    </>
  );
}