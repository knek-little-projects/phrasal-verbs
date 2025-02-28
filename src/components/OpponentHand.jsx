import Card from './Card';
import './OpponentHand.scss';

function OpponentHand({ cards, playerName }) {
  return (
    <div className="opponent-hand">
      <div className="player-name">{playerName}</div>
      <div className="opponent-cards">
        {cards.map((card, index) => (
          <Card 
            key={index} 
            card={card} 
            faceDown={true} 
            small={true}
          />
        ))}
      </div>
    </div>
  );
}

export default OpponentHand; 