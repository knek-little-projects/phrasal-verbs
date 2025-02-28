import Card from './Card';
import './OpenHand.scss';
import React from 'react';
import { calculateRotation } from '../utils';

function OpenHand({ cards, onPlayCard, onSkipTurn, isCardPlayable }) {
  const [selectedCardIndex, setSelectedCardIndex] = React.useState(null);

  const handleCardClick = (index) => {
    if (selectedCardIndex === index && isCardPlayable(cards[index])) {
      // Second click on the same card - play it
      onPlayCard(index);
      setSelectedCardIndex(null);
    } else {
      // First click - just select the card
      setSelectedCardIndex(index);
    }
  };

  const handleSkipClick = () => {
    onSkipTurn();
    setSelectedCardIndex(null);
  };

  return (
    <div className="open-hand">
      <div className="player-cards">
        {cards.map((card, index) => (
          <div 
            key={index}
            className={`card-wrapper ${selectedCardIndex === index ? 'selected' : ''}`}
            style={{
              transform: `rotate(${calculateRotation(index, cards.length)}deg)`,
            }}
          >
            <Card 
              card={card}
              faceDown={false}
              onClick={() => handleCardClick(index)}
              disabled={!isCardPlayable(card)}
            />
          </div>
        ))}
        <div className="card skip-card" onClick={handleSkipClick}>Skip</div>
      </div>
    </div>
  );
}

export default OpenHand; 