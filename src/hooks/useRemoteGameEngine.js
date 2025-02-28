import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

export function useRemoteGameEngine(
  gameId, 
  playerCount = 4, 
  startDealtCardsCount = 8,
  timeout = 1000,
) {
  const [deck, setDeck] = useState([]);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [tableCards, setTableCards] = useState([]);
  const [cardPositions, setCardPositions] = useState([]);
  const [winner, setWinner] = useState(null);
  const [movingCard, setMovingCard] = useState(null);
  const [error, setError] = useState(null);

  const initializeGame = async () => {
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
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to connect to game server');
      }
      
      const data = await response.json();
      
      setDeck(data.deck);
      setPlayers(data.players);
      setCurrentPlayer(data.currentPlayer);
      setTableCards(data.tableCards);
      setCardPositions(data.cardPositions);
      setWinner(data.winner);
    } catch (error) {
      setError('Unable to connect to game server. Please check your connection and try again.');
      console.error('Failed to initialize game:', error);
    }
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const getRandomShift = () => {
    const getRandomShiftValue = () => {
      const shift = Math.random() * (20 - 5) + 5;
      return Math.random() > 0.5 ? shift : -shift;
    };

    return {
      x: getRandomShiftValue(),
      y: getRandomShiftValue(),
      rotation: Math.random() * 30 - 15
    };
  };

  const handlePlayCard = async (cardIndex, startPos, tablePos) => {
    try {
      setError(null);
      const shift = getRandomShift();
      const endPos = {
        x: tablePos.x + shift.x,
        y: tablePos.y + shift.y
      };

      const card = players[currentPlayer].cards[cardIndex];
      setMovingCard({
        startPos,
        endPos,
        card,
        rotation: shift.rotation
      });

      const response = await fetch(`${API_BASE_URL}/game/play-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          cardIndex,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to play card');
      }
      
      setTimeout(() => {
        setPlayers(data.players);
        setCurrentPlayer(data.currentPlayer);
        setTableCards(data.tableCards);
        setCardPositions(prev => [...prev, shift]);
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
      if (deck.length > 0) {
        const newCard = deck[0];
        setMovingCard({
          startPos: deckPos,
          endPos: handPos,
          card: newCard,
          faceDown: true
        });

        const response = await fetch(`${API_BASE_URL}/game/skip-turn`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gameId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error('Failed to skip turn');
        }

        setTimeout(() => {
          setDeck(data.deck);
          setPlayers(data.players);
          setCurrentPlayer(data.currentPlayer);
          setMovingCard(null);
        }, timeout);
      }
    } catch (error) {
      setMovingCard(null);
      setError('Failed to skip turn. Please check your connection and try again.');
      console.error('Failed to skip turn:', error);
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
    error,
    initializeGame,
  };
} 