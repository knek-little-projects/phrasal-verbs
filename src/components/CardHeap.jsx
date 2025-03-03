import React from 'react';
import Card from './Card';

const CardHeap = ({ tableCards, cardPositions }) => {
  return (
    <div className="card-heap">
      {tableCards.map((card, index) => {
        const { x, y, rotation } = cardPositions[index] || { x: 0, y: 0, rotation: 0 };
        return (
          <div
            key={index}
            className="table-card"
            style={{
              position: 'absolute',
              transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`,
              '--card-index': index
            }}
          >
            <Card card={card} faceDown={false} />
          </div>
        );
      })}
    </div>
  );
};

export default CardHeap; 