import { useState, useEffect } from 'react';
import verbsData from '../constants/verbs.json';

export function useGameEngine(playerCount = 4, startDealtCardsCount = 8) {
  const [deck, setDeck] = useState([]);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [tableCards, setTableCards] = useState([]);
  const [cardPositions, setCardPositions] = useState([]);
  const [winner, setWinner] = useState(null);
  const [movingCard, setMovingCard] = useState(null);

  const initializeGame = () => {
    // When creating cards, also include matches if they exist
    const allVerbs = verbsData.categories.flatMap(category => 
      category.cards.map(card => ({
        phrasal_verb: card.phrasal_verb,
        related_word: card.related_words[Math.floor(Math.random() * card.related_words.length)],
        category: category.name,
        color: category.color,
        matches: category.matches
      }))
    );
    
    const newDeck = allVerbs.map((verb, index) => ({
      id: index,
      word: verb.phrasal_verb,
      hint: verb.related_word,
      category: verb.category,
      color: verb.color,
      matches: verb.matches
    }));
    
    // Shuffle deck
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }

    const newPlayers = [];
    for (let i = 0; i < playerCount; i++) {
      newPlayers.push({
        id: i,
        cards: newDeck.splice(0, startDealtCardsCount)
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

  const isCardPlayable = (card) => {
    if (tableCards.length === 0) return true;

    const topCard = tableCards[tableCards.length - 1];
    
    if (card.matches && topCard.matches) {
      const intersection = card.matches.filter(category => 
        topCard.matches.includes(category)
      );
      if (intersection.length > 0) return true;
    } else if (card.matches) {
      if (card.matches.includes(topCard.category)) return true;
    } else if (topCard.matches) {
      if (topCard.matches.includes(card.category)) return true;
    } else {
      if (card.category === topCard.category) return true;
    }

    const cardFirstWord = card.word.split(' ')[0];
    const topCardFirstWord = topCard.word.split(' ')[0];
    return cardFirstWord === topCardFirstWord;
  };

  const handlePlayCard = (cardIndex, startPos, tablePos) => {
    const updatedPlayers = [...players];
    const card = updatedPlayers[currentPlayer].cards[cardIndex];
    
    if (!isCardPlayable(card)) {
      return;
    }

    const shift = getRandomShift();
    const endPos = {
      x: tablePos.x + shift.x,
      y: tablePos.y + shift.y
    };

    setMovingCard({
      startPos,
      endPos,
      card,
      rotation: shift.rotation
    });

    updatedPlayers[currentPlayer].cards.splice(cardIndex, 1);
    setPlayers(updatedPlayers);

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

  const handleSkipTurn = (deckPos, handPos) => {
    if (deck.length > 0) {
      const newCard = deck[0];

      setMovingCard({
        startPos: deckPos,
        endPos: handPos,
        card: newCard,
        faceDown: true
      });

      const updatedPlayers = [...players];
      
      setTimeout(() => {
        updatedPlayers[currentPlayer].cards.push(newCard);
        setDeck(deck.slice(1));
        setPlayers(updatedPlayers);
        setCurrentPlayer((currentPlayer + 1) % playerCount);
        setMovingCard(null);
      }, 500);
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
    isCardPlayable,
  };
} 