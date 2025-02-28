import './Card.scss';

function Card({ card, faceDown, small, onClick }) {
  return (
    <div 
      className={`card ${faceDown ? 'face-down' : ''} ${small ? 'small' : ''}`}
      onClick={onClick}
    >
      {!faceDown && <span className="card-number">{card.number}</span>}
    </div>
  );
}

export default Card; 