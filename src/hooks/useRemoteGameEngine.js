import { useState, useEffect, useCallback } from 'react';
import * as api from '../api'; // Import all API functions from the index.js file
import GameState from './GameState'; // Import the GameState class

const API_BASE_URL = 'http://localhost:5000/api';
const POLL_INTERVAL = 2000; // Poll every 2 seconds

export function useRemoteGameEngine({
  gameId, 
  timeout = 1000,
}) {
  const playerName = localStorage.getItem('playerName');
  if (!playerName) {
    throw new Error('playerName is required');
  }

  const [gameState, setGameState] = useState(null);
  const [movingCard, setMovingCard] = useState(null);
  const [error, setError] = useState(null);

  // Fetch and update the complete game state
  const updateGameState = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getGameState(gameId);
      
      setGameState(prevState => ({
        ...prevState,
        deck: data.deck || [],
        players: data.players || [],
        currentPlayer: data.currentPlayer,
        tableCards: data.tableCards || [],
        cardPositions: data.cardPositions || [],
        winner: data.winner,
        playerNames: data.playerNames || [],
        joinedPlayers: data.joinedPlayers || 0,
        gameStarted: data.gameStarted || false,
        playerCount: data.playerCount,
        startDealtCardsCount: data.startDealtCardsCount,
      }));
      
      return data;
    } catch (error) {
      setError('Unable to get game state. Please check your connection and try again.');
      console.error('Failed to get game state:', error);
      throw error;
    }
  }, [gameId]);

  // Set up continuous polling
  useEffect(() => {
    let intervalId;
    
    const pollGameState = async () => {
      try {
        await updateGameState();
      } catch (error) {
        console.error('Error polling game state:', error);
      }
    };

    // Initial fetch
    pollGameState();
    
    // Set up interval
    intervalId = setInterval(pollGameState, POLL_INTERVAL);
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [updateGameState]);

  const joinGame = useCallback(async () => {
    try {
      setError(null);
      const data = await api.joinGame(gameId, playerName);
      await updateGameState(); // Use updateGameState to ensure consistent state
      return data;
    } catch (error) {
      setError(error.message || 'Failed to join game. Please try again.');
      console.error('Failed to join game:', error);
      throw error;
    }
  }, [gameId, playerName, updateGameState]);

  const handlePlayCard = async (cardIndex, startPos, tablePos) => {
    try {
      setError(null);
      
      // Set up the animation
      const card = gameState.players[gameState.currentPlayer].cards[cardIndex];
      const shift = getRandomShift();
      const rotation = Math.random() * 60 - 30;
      
      setMovingCard({
        card,
        startPos,
        endPos: {
          x: tablePos.x + shift.x,
          y: tablePos.y + shift.y
        },
        rotation
      });
      
      // Send the request to the server
      await api.playCard(gameId, cardIndex);
      
      // Update will happen automatically via polling
      // Just need to handle animation completion
      setTimeout(() => {
        setMovingCard(null);
      }, timeout);
    } catch (error) {
      setMovingCard(null);
      setError('Failed to play card. Please check your connection and try again.');
      console.error('Failed to play card:', error);
    }
  };

  const handleSkipTurn = async (deckPos, handPos) => {
    try {
      setError(null);
      
      if (deckPos && handPos) {
        // Set up the animation for drawing a card
        setMovingCard({
          card: { phrasal_verb: '?', related_word: '?', category: 'unknown', color: '#ccc' },
          startPos: deckPos,
          endPos: handPos,
          rotation: 0
        });
      }
      
      // Send the request to the server
      await api.skipTurn(gameId);
      
      if (deckPos && handPos) {
        // Clear animation after timeout
        setTimeout(() => {
          setMovingCard(null);
        }, timeout);
      }
      // State update will happen automatically via polling
    } catch (error) {
      setMovingCard(null);
      setError('Failed to skip turn. Please check your connection and try again.');
      console.error('Failed to skip turn:', error);
    }
  };

  const restartGame = async () => {
    try {
      setError(null);
      await api.restartGame(gameId, playerName);
      await updateGameState(); // Use updateGameState to ensure consistent state
    } catch (error) {
      setError('Failed to restart game. Please check your connection and try again.');
      console.error('Failed to restart game:', error);
    }
  };

  // Helper function for card animations
  const getRandomShift = () => {
    const getRandomShiftValue = () => {
      const shift = Math.random() * (20 - 5) + 5;
      return Math.random() > 0.5 ? shift : -shift;
    };

    return {
      x: getRandomShiftValue(),
      y: getRandomShiftValue()
    };
  };

  return {
    gameState,
    movingCard,
    error,
    joinGame,
    restartGame,
    handlePlayCard,
    handleSkipTurn,
  };
} 