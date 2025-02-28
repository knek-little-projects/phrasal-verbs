import Card from './Card';
import './OpenHand.scss';

function OpenHand({ cards, onPlayCard, onSkipTurn, playerName, isCardPlayable }) {
  return (
    <div className="open-hand">
      <div className="player-name">{playerName}</div>
      <div className="player-cards">
        {cards.map((card, index) => (
          <Card 
            key={index}
            card={card}
            faceDown={false}
            onClick={() => onPlayCard(index)}
            disabled={!isCardPlayable(card)}
          />
        ))}
        <div className="card skip-card" onClick={onSkipTurn}>Skip</div>
      </div>
    </div>
  );
}

export default OpenHand; 