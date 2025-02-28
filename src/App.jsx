import { useState, useEffect, useRef } from 'react';
import GameBoard from './components/GameBoard';
import WinnerOverlay from './components/WinnerOverlay';
import MovingCard from './components/MovingCard';
import verbsData from './constants/verbs.json';
import './App.scss';

function App() {
  const playerCount = 4
  const startDealtCardsCount = 8

  const [deck, setDeck] = useState([]);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [tableCards, setTableCards] = useState([]);
  const [cardPositions, setCardPositions] = useState([]);
  const [winner, setWinner] = useState(null);
  const [movingCard, setMovingCard] = useState(null);
  const gameboardRef = useRef(null);


  const initializeGame = () => {
    // When creating cards, also include matches if they exist
    const allVerbs = verbsData.categories.flatMap(category => 
      category.cards.map(card => ({
        phrasal_verb: card.phrasal_verb,
        related_word: card.related_words[Math.floor(Math.random() * card.related_words.length)],
        category: category.name,
        color: category.color,
        matches: category.matches // Add matches from category
      }))
    );
    
    // Create deck with one card per phrasal verb
    const newDeck = allVerbs.map((verb, index) => ({
      id: index,
      word: verb.phrasal_verb,
      hint: verb.related_word,
      category: verb.category,
      color: verb.color,
      matches: verb.matches // Include matches in card data
    }));
    
    // Shuffle deck
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }

    // Deal cards to players
    const newPlayers = [];
    for (let i = 0; i < playerCount; i++) { 
      newPlayers.push({
        id: i,
        cards: newDeck.splice(0, startDealtCardsCount) // Update to deal 8 cards
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
    console.log('handlePlayCard called with index:', cardIndex);
    
    const updatedPlayers = [...players];
    const card = updatedPlayers[currentPlayer].cards[cardIndex];
    
    console.log('Current player:', currentPlayer);
    console.log('Card to play:', card);
    
    if (!isCardPlayable(card)) {
      console.log('Card is not playable');
      return;
    }

    // Alternative approach - find the selected card
    let cardElement = gameboardRef.current.querySelector('.open-hand .player-cards .card-wrapper.selected .card');
    const tableElement = gameboardRef.current.querySelector('.table');
    
    console.log('Card element found:', !!cardElement);
    console.log('Table element found:', !!tableElement);
    console.log('Trying to find card at index:', cardIndex);
    
    if (!cardElement || !tableElement) {
      console.log('Required elements not found');
      console.log('DOM structure:', gameboardRef.current.innerHTML);
      return;
    }

    const startPos = getElementPosition(cardElement);
    const tablePos = getElementPosition(tableElement);
    const shift = getRandomShift();
    
    // Calculate end position with random shift
    const endPos = {
      x: tablePos.x + shift.x,
      y: tablePos.y + shift.y
    };

    console.log('Animation positions:', { startPos, endPos });

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
    setTimeout(() => {
      setTableCards(prevTableCards => [...prevTableCards, card]);
      setCardPositions(prevPositions => [...prevPositions, shift]);
      setMovingCard(null);

      if (updatedPlayers[currentPlayer].cards.length === 0) {
        setWinner(currentPlayer);
      } else {
        setCurrentPlayer((currentPlayer + 1) % playerCount);
      }
    }, 500);
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
          setCurrentPlayer((currentPlayer + 1) % playerCount); // Update to cycle through 4 players
          setMovingCard(null);
        }, 500);

        return () => clearTimeout(timer);
      }
    }
  };

  // Update the isCardPlayable function
  const isCardPlayable = (card) => {
    if (tableCards.length === 0) return true;

    const topCard = tableCards[tableCards.length - 1];
    
    // Check categories
    if (card.matches && topCard.matches) {
      // If both cards have matches, check for intersection
      const intersection = card.matches.filter(category => 
        topCard.matches.includes(category)
      );
      if (intersection.length > 0) return true;
    } else if (card.matches) {
      // If only player's card has matches
      if (card.matches.includes(topCard.category)) return true;
    } else if (topCard.matches) {
      // If only table card has matches
      if (topCard.matches.includes(card.category)) return true;
    } else {
      // If neither has matches, do direct category comparison
      if (card.category === topCard.category) return true;
    }

    // Same first word check remains unchanged
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