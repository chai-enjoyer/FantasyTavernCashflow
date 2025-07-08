'use client';

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { GameState, Card, NPC, GameConfig } from '@repo/shared';
import { GameEngine } from '@repo/game-logic';
import {
  getUser,
  createUser,
  updateGameState,
  updateUserStatistics,
  getGameConfig,
  CardIndex,
  CardPrefetcher,
} from '@repo/firebase';
import { TelegramService } from '../services/telegram';
import { AnalyticsService } from '../services/analytics';

interface GameContextState {
  gameState: GameState | null;
  currentCard: Card | null;
  currentNPC: NPC | null;
  nextCard: Card | null; // Pre-loaded next card
  nextNPC: NPC | null; // Pre-loaded next NPC
  gameConfig: GameConfig | null;
  isLoading: boolean;
  error: string | null;
}

interface GameContextActions {
  initializeGame: () => Promise<void>;
  selectChoice: (choiceIndex: 0 | 1 | 2 | 3) => Promise<void>;
  continueToNextCard: () => void; // Instant, no async
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
    nextCard: null,
    nextNPC: null,
    gameConfig: null,
    isLoading: true,
    error: null,
  });

  const [telegramId, setTelegramId] = useState<string | null>(null);
  const gameEngine = new GameEngine();
  const telegram = TelegramService.getInstance();
  const analytics = AnalyticsService.getInstance();
  const cardIndex = CardIndex.getInstance();
  const prefetcher = CardPrefetcher.getInstance();

  // Pre-load next card whenever game state changes (synchronous for instant loading)
  const preloadNextCard = (gameState: GameState, currentCardId?: string) => {
    try {
      // Use the prefetcher to prepare multiple cards
      prefetcher.prefetchNextCards(gameState, currentCardId || '');
      
      // Process what the next turn would be
      const nextTurnState = gameEngine.processTurnEnd(gameState);
      
      // Get available cards using the index (instant)
      const availableCards = cardIndex.getAvailableCards(nextTurnState);
      
      // Filter out recent cards
      const recentCardFlags = nextTurnState.flags.filter(f => f.startsWith('recent_card_'));
      const recentCardIds = new Set(recentCardFlags.map(f => f.replace('recent_card_', '')));
      
      let filteredCards = availableCards.filter(c => !recentCardIds.has(c.card.id));
      
      if (filteredCards.length < 3 && recentCardFlags.length > 2) {
        const veryRecentIds = new Set(recentCardFlags.slice(-2).map(f => f.replace('recent_card_', '')));
        filteredCards = availableCards.filter(c => !veryRecentIds.has(c.card.id));
      }
      
      const cards = filteredCards.length > 0 ? filteredCards : availableCards;
      const cardData = cards.map(item => item.card);
      const nextCard = gameEngine.selectNextCard(nextTurnState, cardData);
      
      if (nextCard) {
        const cardWithNPC = cards.find(item => item.card.id === nextCard.id);
        if (cardWithNPC) {
          setState(prev => ({
            ...prev,
            nextCard: cardWithNPC.card,
            nextNPC: cardWithNPC.npc,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to preload next card:', error);
    }
  };

  const initializeGame = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    // Get Telegram user
    const telegramUser = telegram.getUser();
    if (!telegramUser && !telegram.isTestMode()) {
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

      // Ensure card index is built
      if (cardIndex.getStats().totalCards === 0) {
        const { getAllCards, getAllNPCs } = await import('@repo/firebase');
        const [cards, npcs] = await Promise.all([
          getAllCards(),
          getAllNPCs()
        ]);
        cardIndex.buildIndex(cards, npcs);
      }

      // Get first card using index
      const availableCards = cardIndex.getAvailableCards(user.gameState);
      const cards = availableCards.map(item => item.card);
      const nextCard = gameEngine.selectNextCard(user.gameState, cards);
      
      if (!nextCard) {
        throw new Error('No available cards');
      }

      const cardWithNPC = availableCards.find(item => item.card.id === nextCard.id);
      if (!cardWithNPC) {
        throw new Error('Card with NPC not found');
      }

      setState({
        gameState: user.gameState,
        currentCard: nextCard,
        currentNPC: cardWithNPC.npc,
        nextCard: null,
        nextNPC: null,
        gameConfig: config,
        isLoading: false,
        error: null,
      });

      // Track game start
      analytics.trackGameStart(user.gameState);
      
      // Start preloading next card (synchronous)
      preloadNextCard(user.gameState, nextCard.id);
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

    // Don't show loading, just update state
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
        
        // Update statistics in background
        updateUserStatistics(telegramId, {
          bankruptcies: 1,
          maxTurns: Math.max(state.gameState.turn, newGameState.turn),
        });
      }

      // Update game state in database (don't await)
      updateGameState(telegramId, newGameState);

      // Update local state immediately
      setState(prev => ({
        ...prev,
        gameState: newGameState,
      }));
      
      // Preload next card for when user continues (synchronous)
      preloadNextCard(newGameState, state.currentCard.id);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to process choice',
      }));
    }
  };

  const continueToNextCard = () => {
    if (!state.gameState || !telegramId) return;

    // Process turn end
    const endOfTurnState = gameEngine.processTurnEnd(state.gameState);
    
    // Use pre-loaded card if available
    if (state.nextCard && state.nextNPC) {
      setState(prev => ({
        ...prev,
        gameState: endOfTurnState,
        currentCard: prev.nextCard!,
        currentNPC: prev.nextNPC!,
        nextCard: null,
        nextNPC: null,
      }));
      
      // Update statistics in background
      updateUserStatistics(telegramId, {
        totalDecisions: 1,
        maxMoney: Math.max(state.gameState.money, endOfTurnState.money),
        maxTurns: endOfTurnState.turn,
      });
      
      // Start preloading next card (synchronous)
      preloadNextCard(endOfTurnState, state.nextCard.id);
    } else {
      // Fallback: load card synchronously from index
      const availableCards = cardIndex.getAvailableCards(endOfTurnState);
      const cards = availableCards.map(item => item.card);
      const nextCard = gameEngine.selectNextCard(endOfTurnState, cards);
      
      if (nextCard) {
        const cardWithNPC = availableCards.find(item => item.card.id === nextCard.id);
        if (cardWithNPC) {
          setState(prev => ({
            ...prev,
            gameState: endOfTurnState,
            currentCard: nextCard,
            currentNPC: cardWithNPC.npc,
          }));
          
          // Update statistics in background
          updateUserStatistics(telegramId, {
            totalDecisions: 1,
            maxMoney: Math.max(state.gameState.money, endOfTurnState.money),
            maxTurns: endOfTurnState.turn,
          });
          
          // Start preloading next card (synchronous)
          preloadNextCard(endOfTurnState, nextCard.id);
        }
      }
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

      // Get first card using index
      const availableCards = cardIndex.getAvailableCards(newGameState);
      const cards = availableCards.map(item => item.card);
      const nextCard = gameEngine.selectNextCard(newGameState, cards);
      
      if (!nextCard) {
        throw new Error('No available cards');
      }

      const cardWithNPC = availableCards.find(item => item.card.id === nextCard.id);
      if (!cardWithNPC) {
        throw new Error('Card with NPC not found');
      }

      setState(prev => ({
        ...prev,
        gameState: newGameState,
        currentCard: nextCard,
        currentNPC: cardWithNPC.npc,
        nextCard: null,
        nextNPC: null,
        isLoading: false,
      }));
      
      // Start preloading (synchronous)
      preloadNextCard(newGameState, nextCard.id);
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