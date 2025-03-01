import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

export function useRemoteGameEngine({
  gameId, 
  playerCount = 4, 
  startDealtCardsCount = 8,
  playerName = '',
  timeout = 1000,
}) {
  const [deck, setDeck] = useState([]);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [tableCards, setTableCards] = useState([]);
  const [cardPositions, setCardPositions] = useState([]);
  const [winner, setWinner] = useState(null);
  const [movingCard, setMovingCard] = useState(null);
  const [error, setError] = useState(null);
  const [playerNames, setPlayerNames] = useState([]);
  const [joinedPlayers, setJoinedPlayers] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  const initializeGame = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/game/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          playerCount,
          startDealtCardsCount,
          playerName,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to connect to game server');
      }
      
      const data = await response.json();
      
      setDeck(data.deck || []);
      setPlayers(data.players || []);
      setCurrentPlayer(data.currentPlayer || 0);
      setTableCards(data.tableCards || []);
      setCardPositions(data.cardPositions || []);
      setWinner(data.winner);
      setPlayerNames(data.playerNames || []);
      setJoinedPlayers(data.joinedPlayers || 0);
      setGameStarted(data.gameStarted || false);
      
      // Start polling if the game hasn't started yet
      if (!data.gameStarted && data.joinedPlayers < data.playerCount) {
        setIsPolling(true);
      } else {
        setIsPolling(false);
      }
    } catch (error) {
      setError('Unable to connect to game server. Please check your connection and try again.');
      console.error('Failed to initialize game:', error);
    }
  }, [gameId, playerCount, startDealtCardsCount, playerName]);

  const joinGame = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/game/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          playerName,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join game');
      }
      
      const data = await response.json();
      
      setDeck(data.deck || []);
      setPlayers(data.players || []);
      setCurrentPlayer(data.currentPlayer || 0);
      setTableCards(data.tableCards || []);
      setCardPositions(data.cardPositions || []);
      setWinner(data.winner);
      setPlayerNames(data.playerNames || []);
      setJoinedPlayers(data.joinedPlayers || 0);
      setGameStarted(data.gameStarted || false);
      
      // Start polling if the game hasn't started yet
      if (!data.gameStarted && data.joinedPlayers < data.playerCount) {
        setIsPolling(true);
      } else {
        setIsPolling(false);
      }
      
      return data;
    } catch (error) {
      setError(error.message || 'Failed to join game. Please try again.');
      console.error('Failed to join game:', error);
      throw error;
    }
  };

  const checkGameStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/game/status?gameId=${gameId}`);
      
      if (!response.ok) {
        throw new Error('Failed to check game status');
      }
      
      const data = await response.json();
      
      if (data.exists) {
        setJoinedPlayers(data.joinedPlayers || 0);
        setGameStarted(data.started || false);
        setPlayerNames(data.playerNames || []);
        
        // If the game has started, fetch the full game state
        if (data.started && !gameStarted) {
          await initializeGame();
        }
        
        // Stop polling if the game has started
        if (data.started) {
          setIsPolling(false);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Failed to check game status:', error);
      return null;
    }
  }, [gameId, gameStarted, initializeGame]);

  // Set up polling for game status
  useEffect(() => {
    let intervalId;
    
    if (isPolling) {
      intervalId = setInterval(() => {
        checkGameStatus();
      }, 2000); // Poll every 2 seconds
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPolling, checkGameStatus]);

  useEffect(() => {
    // Initialize the game when the component mounts
    if (gameId && playerName) {
      initializeGame();
    }
  }, [gameId, playerName, initializeGame]);

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

  const handlePlayCard = async (cardIndex, startPos, tablePos) => {
    try {
      setError(null);
      
      // Set up the animation
      const card = players[currentPlayer].cards[cardIndex];
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
      const response = await fetch(`${API_BASE_URL}/game/play-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          cardIndex
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to play card');
      }
      
      const data = await response.json();
      
      // Update the game state after the animation completes
      setTimeout(() => {
        setPlayers(data.players);
        setCurrentPlayer(data.currentPlayer);
        setTableCards(data.tableCards);
        setWinner(data.winner);
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
      const response = await fetch(`${API_BASE_URL}/game/skip-turn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to skip turn');
      }
      
      const data = await response.json();
      
      if (deckPos && handPos) {
        // Update the game state after the animation completes
        setTimeout(() => {
          setDeck(data.deck);
          setPlayers(data.players);
          setCurrentPlayer(data.currentPlayer);
          setMovingCard(null);
        }, timeout);
      } else {
        // Update immediately if no animation
        setDeck(data.deck);
        setPlayers(data.players);
        setCurrentPlayer(data.currentPlayer);
      }
    } catch (error) {
      setMovingCard(null);
      setError('Failed to skip turn. Please check your connection and try again.');
      console.error('Failed to skip turn:', error);
    }
  };

  const restartGame = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/game/restart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          gameId,
          playerName 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to restart game');
      }

      const data = await response.json();
      setDeck(data.deck);
      setPlayers(data.players);
      setCurrentPlayer(data.currentPlayer);
      setTableCards(data.tableCards);
      setCardPositions(data.cardPositions);
      setWinner(data.winner);
      setPlayerNames(data.playerNames || []);
    } catch (error) {
      setError('Failed to restart game. Please check your connection and try again.');
      console.error('Failed to restart game:', error);
    }
  };

  return {
    deck,
    players,
    currentPlayer,
    tableCards,
    cardPositions,
    winner,
    movingCard,
    setMovingCard,
    handlePlayCard,
    handleSkipTurn,
    initializeGame,
    joinGame,
    restartGame,
    error,
    playerNames,
    joinedPlayers,
    playerCount,
    gameStarted,
  };
} 