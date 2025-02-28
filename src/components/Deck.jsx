import Card from './Card';
import './Deck.scss';

function Deck({ count }) {
  return (
    <div className="deck">
      <Card faceDown={true} />
      <div className="deck-count">{count}</div>
    </div>
  );
}

export default Deck; 