import './Card.scss';

function Card({ card, faceDown, small, onClick }) {
  return (
    <div 
      className={`card ${faceDown ? 'face-down' : ''} ${small ? 'small' : ''}`}
      onClick={onClick}
    >
      {!faceDown && <span className="card-word">{card.word}</span>}
    </div>
  );
}

export default Card; 