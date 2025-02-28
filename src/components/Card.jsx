import './Card.scss';

function Card({ card, faceDown, small, onClick, disabled }) {
  return (
    <div 
      className={`card ${faceDown ? 'face-down' : ''} ${small ? 'small' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
      style={!faceDown ? { borderTop: `3px solid ${card.color}` } : {}}
    >
      {!faceDown && (
        <div className="card-content">
          <span className="card-word">{card.word}</span>
          <span className="card-hint">{card.hint}</span>
          <span className="card-category" style={{ color: card.color }}>
            {card.category}
          </span>
        </div>
      )}
    </div>
  );
}

export default Card; 