import { useState, useEffect, useRef } from 'react';
import GameBoard from './components/GameBoard';
import WinnerOverlay from './components/WinnerOverlay';
import MovingCard from './components/MovingCard';
import verbsData from './constants/verbs.json';
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
    // Collect all phrasal verbs with their related words from all categories
    const allVerbs = verbsData.categories.flatMap(category => 
      category.cards.map(card => ({
        phrasal_verb: card.phrasal_verb,
        related_word: card.related_words[Math.floor(Math.random() * card.related_words.length)],
        category: category.name,
        color: category.color
      }))
    );
    
    // Create deck with one card per phrasal verb
    const newDeck = allVerbs.map((verb, index) => ({
      id: index,
      word: verb.phrasal_verb,
      hint: verb.related_word,
      category: verb.category,
      color: verb.color
    }));
    
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
    
    // Check if the play is valid
    const isValidPlay = () => {
      // If table is empty, any card is valid
      if (tableCards.length === 0) return true;

      const topCard = tableCards[tableCards.length - 1];
      
      // Same category
      if (card.category === topCard.category) return true;

      // Same first word
      const cardFirstWord = card.word.split(' ')[0];
      const topCardFirstWord = topCard.word.split(' ')[0];
      if (cardFirstWord === topCardFirstWord) return true;

      return false;
    };

    if (!isValidPlay()) {
      // Optionally show some feedback to the player
      return;
    }

    // Get source and target positions
    const cardElement = gameboardRef.current.querySelector(`.open-hand .card:nth-child(${cardIndex + 1})`);
    const tableElement = gameboardRef.current.querySelector('.table');
    
    if (cardElement && tableElement) {
      const startPos = getElementPosition(cardElement);
      const tablePos = getElementPosition(tableElement);
      const shift = getRandomShift();
      
      // Calculate end position with random shift
      const endPos = {
        x: tablePos.x + shift.x,
        y: tablePos.y + shift.y
      };

      // Start animation
      setMovingCard({
        startPos,
        endPos,
        card,
        rotation: shift.rotation
      });

      // Remove card from player's hand immediately
      updatedPlayers[currentPlayer].cards.splice(cardIndex, 1);
      setPlayers(updatedPlayers);

      // Delay the actual card placement on table until animation completes
      const timer = setTimeout(() => {
        setTableCards([...tableCards, card]);
        setCardPositions([...cardPositions, shift]);
        setMovingCard(null);

        if (updatedPlayers[currentPlayer].cards.length === 0) {
          setWinner(currentPlayer);
        } else {
          setCurrentPlayer((currentPlayer + 1) % 2);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
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

        const newCard = deck[0]; // Get the card that will be drawn

        // Start animation with the actual card data
        setMovingCard({
          startPos,
          endPos,
          card: newCard, // Pass the card that's being drawn
          faceDown: true // Keep the card face down during animation
        });

        // The actual card movement logic will be executed after animation
        const updatedPlayers = [...players];
        
        // Delay the actual state updates until animation completes
        const timer = setTimeout(() => {
          updatedPlayers[currentPlayer].cards.push(newCard);
          setDeck(deck.slice(1));
          setPlayers(updatedPlayers);
          setCurrentPlayer((currentPlayer + 1) % 2);
          setMovingCard(null);
        }, 500);

        return () => clearTimeout(timer);
      }
    }
  };

  // Add this function to check if a card can be played
  const isCardPlayable = (card) => {
    if (tableCards.length === 0) return true;

    const topCard = tableCards[tableCards.length - 1];
    
    // Same category
    if (card.category === topCard.category) return true;

    // Same first word
    const cardFirstWord = card.word.split(' ')[0];
    const topCardFirstWord = topCard.word.split(' ')[0];
    if (cardFirstWord === topCardFirstWord) return true;

    return false;
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
        isCardPlayable={isCardPlayable}
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
          card={movingCard.card}
          rotation={movingCard.rotation}
        />
      )}
    </div>
  );
}

export default App; 