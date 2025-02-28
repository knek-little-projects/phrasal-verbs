import { useState, useEffect, useRef } from 'react';
import GameBoard from './components/GameBoard';
import WinnerOverlay from './components/WinnerOverlay';
import MovingCard from './components/MovingCard';
import './App.scss';

function App() {
  const [deck, setDeck] = useState([]);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [tableCards, setTableCards] = useState([]);
  const [cardPositions, setCardPositions] = useState([]);
  const [winner, setWinner] = useState(null);
  const [movingCard, setMovingCard] = useState(null);
  const gameboardRef = useRef(null);

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

  const getElementPosition = (element) => {
    const rect = element.getBoundingClientRect();
    const gameboardRect = gameboardRef.current.getBoundingClientRect();
    
    return {
      x: rect.left - gameboardRect.left + rect.width / 2,
      y: rect.top - gameboardRect.top + rect.height / 2
    };
  };

  const handleSkipTurn = () => {
    if (deck.length > 0) {
      // Get deck and current player hand positions
      const deckElement = gameboardRef.current.querySelector('.deck');
      const playerHandElement = gameboardRef.current.querySelector('.open-hand');
      
      if (deckElement && playerHandElement) {
        const startPos = getElementPosition(deckElement);
        const endPos = getElementPosition(playerHandElement);

        // Start animation
        setMovingCard({
          startPos,
          endPos
        });

        // The actual card movement logic will be executed after animation
        const updatedPlayers = [...players];
        const newCard = deck[0];
        
        // Delay the actual state updates until animation completes
        const timer = setTimeout(() => {
          updatedPlayers[currentPlayer].cards.push(newCard);
          setDeck(deck.slice(1));
          setPlayers(updatedPlayers);
          setCurrentPlayer((currentPlayer + 1) % 2);
          setMovingCard(null);
        }, 500); // Match this with animation duration

        return () => clearTimeout(timer);
      }
    }
  };

  return (
    <div className="app" ref={gameboardRef}>
      <GameBoard
        players={players}
        currentPlayer={currentPlayer}
        tableCards={tableCards}
        cardPositions={cardPositions}
        onPlayCard={handlePlayCard}
        onSkipTurn={handleSkipTurn}
        deck={deck}
      />
      {winner !== null && (
        <WinnerOverlay 
          winner={winner} 
          onRestart={initializeGame}
        />
      )}
      {movingCard && (
        <MovingCard
          startPosition={movingCard.startPos}
          endPosition={movingCard.endPos}
          onAnimationEnd={() => setMovingCard(null)}
        />
      )}
    </div>
  );
}

export default App; 