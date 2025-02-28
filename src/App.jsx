import { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import './App.scss';

function App() {
  const [deck, setDeck] = useState([]);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [tableCards, setTableCards] = useState([]);
  const [cardPositions, setCardPositions] = useState([]);
  const [winner, setWinner] = useState(null);

  const initializeGame = () => {
    const newDeck = [];
    for (let i = 1; i <= 32; i++) {
      newDeck.push({ id: i, number: i });
    }
    
    // Shuffle deck
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }

    // Deal cards to players
    const newPlayers = [];
    for (let i = 0; i < 2; i++) {
      newPlayers.push({
        id: i,
        cards: newDeck.splice(0, 4)
      });
    }

    setDeck(newDeck);
    setPlayers(newPlayers);
    setCurrentPlayer(0);
    setTableCards([]);
    setCardPositions([]);
    setWinner(null);
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

  const handlePlayCard = (cardIndex) => {
    const updatedPlayers = [...players];
    const card = updatedPlayers[currentPlayer].cards[cardIndex];
    updatedPlayers[currentPlayer].cards.splice(cardIndex, 1);
    
    setTableCards([...tableCards, card]);
    setCardPositions([...cardPositions, getRandomShift()]);
    
    if (updatedPlayers[currentPlayer].cards.length === 0) {
      setWinner(currentPlayer);
    } else {
      setCurrentPlayer((currentPlayer + 1) % 2);
    }
    
    setPlayers(updatedPlayers);
  };

  const handleSkipTurn = () => {
    if (deck.length > 0) {
      const updatedPlayers = [...players];
      const newCard = deck[0];
      updatedPlayers[currentPlayer].cards.push(newCard);
      
      setDeck(deck.slice(1));
      setPlayers(updatedPlayers);
      setCurrentPlayer((currentPlayer + 1) % 2);
    }
  };

  return (
    <div className="app">
      <GameBoard
        players={players}
        currentPlayer={currentPlayer}
        tableCards={tableCards}
        cardPositions={cardPositions}
        winner={winner}
        onPlayCard={handlePlayCard}
        onSkipTurn={handleSkipTurn}
        onRestart={initializeGame}
      />
    </div>
  );
}

export default App; 