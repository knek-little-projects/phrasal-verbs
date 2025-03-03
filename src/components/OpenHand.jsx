import Card from './Card';
import './OpenHand.scss';
import React from 'react';
import { calculateRotation } from '../utils';

// Custom hook for drag scrolling
const useDragScroll = () => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);

  const handleMouseDown = (e) => {
    console.log('Mouse down event triggered');
    setIsDragging(true);
    setStartX(e.pageX - e.currentTarget.offsetLeft);
    setScrollLeft(e.currentTarget.scrollLeft);
  };

  const handleMouseLeave = () => {
    console.log('Mouse leave event triggered');
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    console.log('Mouse up event triggered');
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - e.currentTarget.offsetLeft;
    const walk = (x - startX) * 2; // Adjust scroll speed
    console.log(`Dragging: ${walk}, Scroll Left: ${scrollLeft}`);
    e.currentTarget.scrollLeft = scrollLeft + walk; // Update scroll position
  };

  return {
    isDragging,
    handleMouseDown,
    handleMouseLeave,
    handleMouseUp,
    handleMouseMove,
  };
};

// Custom hook for touch support and mouse events
const useTouchSupport = () => {
  const isTouchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  console.log(`Touch supported: ${isTouchSupported}`);

  const {
    handleMouseDown,
    handleMouseLeave,
    handleMouseUp,
    handleMouseMove,
  } = useDragScroll();

  // Create an object for mouse event handlers
  const mouseEvents = {
    onMouseDown: !isTouchSupported ? handleMouseDown : undefined,
    onMouseLeave: !isTouchSupported ? handleMouseLeave : undefined,
    onMouseUp: !isTouchSupported ? handleMouseUp : undefined,
    onMouseMove: !isTouchSupported ? handleMouseMove : undefined,
  };

  return { isTouchSupported, mouseEvents };
};

function OpenHand({ 
  cards, 
  onPlayCard, 
  onSkipTurn, 
  isCardPlayable,
  showSkipOption,
  playable,
  isActive,
}) {
  const [selectedCardIndex, setSelectedCardIndex] = React.useState(null);
  
  // Use the custom hook for touch support
  // const { mouseEvents } = useTouchSupport();

  const handleCardClick = (index) => {
    if (playable && selectedCardIndex === index && isCardPlayable(cards[index])) {
      // Second click on the same card - play it
      onPlayCard(index);
      setSelectedCardIndex(null);
    } else {
      // First click - just select the card
      setSelectedCardIndex(index);
    }
  };

  const handleSkipClick = () => {
    if (playable) {
      onSkipTurn();
      setSelectedCardIndex(null);
    }
  };

  return (
    <div className={`open-hand ${isActive ? 'active' : ''}`}>
      <div 
        className="player-cards-container"
      >
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
                disabled={!playable || !isCardPlayable(card)}
              />
            </div>
          ))}
          {showSkipOption && playable && <div className="card skip-card" onClick={handleSkipClick}>Skip</div>}
        </div>
      </div>
    </div>
  );
}

export default OpenHand; 