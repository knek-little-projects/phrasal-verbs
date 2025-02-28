import { useState, useEffect } from 'react';
import Card from './Card';
import './GameBoard.scss';

function GameBoard({ numberOfPlayers }) {
  const [deck, setDeck] = useState([]);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [tableCards, setTableCards] = useState([]);

  // Initialize deck and deal cards
  useEffect(() => {
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
    for (let i = 0; i < numberOfPlayers; i++) {
      newPlayers.push({
        id: i,
        cards: newDeck.splice(0, 4)
      });
    }

    setDeck(newDeck);
    setPlayers(newPlayers);
  }, [numberOfPlayers]);

  const playCard = (cardIndex) => {
    const player = players[currentPlayer];
    const card = player.cards[cardIndex];
    
    // Remove card from player's hand
    const updatedPlayers = [...players];
    updatedPlayers[currentPlayer].cards.splice(cardIndex, 1);
    
    // Add card to table
    setTableCards([...tableCards, card]);
    
    // Next player's turn
    setCurrentPlayer((currentPlayer + 1) % numberOfPlayers);
    setPlayers(updatedPlayers);
  };

  const skipTurn = () => {
    if (deck.length > 0) {
      const updatedPlayers = [...players];
      const newCard = deck[0];
      updatedPlayers[currentPlayer].cards.push(newCard);
      
      setDeck(deck.slice(1));
      setPlayers(updatedPlayers);
      setCurrentPlayer((currentPlayer + 1) % numberOfPlayers);
    }
  };

  return (
    <div className="game-board">
      <div className="opponents">
        {players.map((player, index) => (
          index !== currentPlayer && (
            <div key={player.id} className="opponent-cards">
              {player.cards.map((card, cardIndex) => (
                <Card 
                  key={cardIndex} 
                  card={card} 
                  faceDown={true} 
                  small={true}
                />
              ))}
            </div>
          )
        ))}
      </div>

      <div className="table">
        {tableCards.length > 0 && (
          <Card card={tableCards[tableCards.length - 1]} faceDown={false} />
        )}
      </div>

      <div className="player-cards">
        {players[currentPlayer]?.cards.map((card, index) => (
          <Card 
            key={index}
            card={card}
            faceDown={false}
            onClick={() => playCard(index)}
          />
        ))}
        <button className="skip-button" onClick={skipTurn}>Skip</button>
      </div>
    </div>
  );
}

export default GameBoard; 