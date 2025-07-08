'use client';

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { GameState, Card, NPC, GameConfig } from '@repo/shared';
import { GameEngine } from '@repo/game-logic';
import {
  getUser,
  createUser,
  updateGameState,
  updateUserStatistics,
  getAvailableCards,
  getNPC,
  getGameConfig,
} from '@repo/firebase';
import { TelegramService } from '../services/telegram';
import { AnalyticsService } from '../services/analytics';

interface GameContextState {
  gameState: GameState | null;
  currentCard: Card | null;
  currentNPC: NPC | null;
  gameConfig: GameConfig | null;
  isLoading: boolean;
  error: string | null;
}

interface GameContextActions {
  initializeGame: () => Promise<void>;
  selectChoice: (choiceIndex: 0 | 1 | 2 | 3) => Promise<void>;
  continueToNextCard: () => Promise<void>;
  resetGame: () => Promise<void>;
}

type GameContextValue = GameContextState & GameContextActions;

const GameContext = createContext<GameContextValue | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: React.ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, setState] = useState<GameContextState>({
    gameState: null,
    currentCard: null,
    currentNPC: null,
    gameConfig: null,
    isLoading: true,
    error: null,
  });

  const [telegramId, setTelegramId] = useState<string | null>(null);
  const gameEngine = new GameEngine();
  const telegram = TelegramService.getInstance();
  const analytics = AnalyticsService.getInstance();

  const initializeGame = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    // Get Telegram user
    const telegramUser = telegram.getUser();
    if (!telegramUser) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Please open this app from Telegram',
      }));
      return;
    }

    const userId = telegram.getUserId();
    const username = telegram.getUsername();
    setTelegramId(userId);

    try {
      // Get game config
      const config = await getGameConfig();
      if (!config) {
        throw new Error('Game configuration not found');
      }

      // Get or create user
      let user = await getUser(userId);
      if (!user) {
        user = await createUser(userId, username);
      }

      // Get available cards and select one
      const availableCards = await getAvailableCards(user.gameState);
      console.log('Available cards:', availableCards.length, availableCards.map(c => ({ id: c.id, priority: c.priority })));
      
      const nextCard = gameEngine.selectNextCard(user.gameState, availableCards);
      console.log('Selected card:', nextCard?.id, nextCard?.priority);
      
      if (!nextCard) {
        throw new Error('No available cards');
      }

      const npc = await getNPC(nextCard.npcId);
      if (!npc) {
        throw new Error('NPC not found');
      }

      setState({
        gameState: user.gameState,
        currentCard: nextCard,
        currentNPC: npc,
        gameConfig: config,
        isLoading: false,
        error: null,
      });

      // Track game start
      analytics.trackGameStart(user.gameState);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize game';
      analytics.logError('Game initialization failed', error instanceof Error ? error.stack : undefined, {
        userId,
        username,
      });
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  const selectChoice = async (choiceIndex: 0 | 1 | 2 | 3) => {
    if (!state.gameState || !state.currentCard || !telegramId) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Process the choice
      const previousMoney = state.gameState.money;
      const previousReputation = state.gameState.reputation;
      
      // Add current card to recent cards tracking
      const updatedGameState = {
        ...state.gameState,
        flags: [...state.gameState.flags, `recent_card_${state.currentCard.id}`]
      };
      
      const newGameState = gameEngine.processCardChoice(
        state.currentCard,
        choiceIndex,
        updatedGameState
      );

      // Track decision
      analytics.trackDecision(state.currentCard.id, choiceIndex, {
        moneyChange: newGameState.money - previousMoney,
        reputationChange: newGameState.reputation - previousReputation,
      });

      // Check if game is over
      if (gameEngine.isGameOver(newGameState)) {
        const reason = newGameState.money <= 0 ? 'bankruptcy' : 'other';
        analytics.trackGameOver(newGameState, reason);
        
        // Update statistics
        await updateUserStatistics(telegramId, {
          bankruptcies: 1,
          maxTurns: Math.max(state.gameState.turn, newGameState.turn),
        });
      }

      // Update game state in database
      await updateGameState(telegramId, newGameState);

      // Update local state
      setState(prev => ({
        ...prev,
        gameState: newGameState,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to process choice',
      }));
    }
  };

  const continueToNextCard = async () => {
    if (!state.gameState || !telegramId) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Process turn end
      const endOfTurnState = gameEngine.processTurnEnd(state.gameState);
      
      // Get next card
      const availableCards = await getAvailableCards(endOfTurnState);
      console.log('Available cards for next turn:', availableCards.length, availableCards.map(c => ({ id: c.id, priority: c.priority })));
      
      const nextCard = gameEngine.selectNextCard(endOfTurnState, availableCards);
      console.log('Selected next card:', nextCard?.id, nextCard?.priority);
      
      if (!nextCard) {
        throw new Error('No available cards');
      }

      const npc = await getNPC(nextCard.npcId);
      if (!npc) {
        throw new Error('NPC not found');
      }

      // Update statistics
      await updateUserStatistics(telegramId, {
        totalDecisions: 1,
        maxMoney: Math.max(state.gameState.money, endOfTurnState.money),
        maxTurns: endOfTurnState.turn,
      });

      setState(prev => ({
        ...prev,
        gameState: endOfTurnState,
        currentCard: nextCard,
        currentNPC: npc,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to get next card',
      }));
    }
  };

  const resetGame = async () => {
    if (!telegramId) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const newGameState: GameState = {
        money: state.gameConfig?.startingMoney || 10000,
        reputation: state.gameConfig?.startingReputation || 0,
        turn: 1,
        passiveIncome: [],
        debts: [],
        temporaryEffects: [],
        npcRelationships: {},
        lastPlayedAt: new Date(),
        totalPlayTime: 0,
        flags: [],
      };

      await updateGameState(telegramId, newGameState);
      await updateUserStatistics(telegramId, { gamesPlayed: 1 });

      // Get first card
      const availableCards = await getAvailableCards(newGameState);
      const nextCard = gameEngine.selectNextCard(newGameState, availableCards);
      
      if (!nextCard) {
        throw new Error('No available cards');
      }

      const npc = await getNPC(nextCard.npcId);
      if (!npc) {
        throw new Error('NPC not found');
      }

      setState(prev => ({
        ...prev,
        gameState: newGameState,
        currentCard: nextCard,
        currentNPC: npc,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to reset game',
      }));
    }
  };

  const value: GameContextValue = {
    ...state,
    initializeGame,
    selectChoice,
    continueToNextCard,
    resetGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}