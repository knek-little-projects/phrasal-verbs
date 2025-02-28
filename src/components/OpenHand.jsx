import Card from './Card';
import './OpenHand.scss';

function OpenHand({ cards, onPlayCard, onSkipTurn, isCardPlayable }) {
  const calculateRotation = (index, total) => {
    // Calculate angle from -30 to +30 degrees based on position
    const maxAngle = 5
    const startAngle = -maxAngle;
    const endAngle = maxAngle
    const step = total > 1 ? (endAngle - startAngle) / (total - 1) : 0;
    return startAngle + (step * index);
  };

  return (
    <div className="open-hand">
      <div className="player-cards">
        {cards.map((card, index) => (
          <div 
            key={index}
            className="card-wrapper"
            style={{
              transform: `rotate(${calculateRotation(index, cards.length)}deg)`,
            }}
          >
            <Card 
              card={card}
              faceDown={false}
              onClick={() => onPlayCard(index)}
              disabled={!isCardPlayable(card)}
            />
          </div>
        ))}
        <div className="card skip-card" onClick={onSkipTurn}>Skip</div>
      </div>
    </div>
  );
}

export default OpenHand; 