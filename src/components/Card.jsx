import './Card.scss';

function Card({ card, faceDown, small, onClick, disabled }) {
  return (
    <div 
      className={`card ${faceDown ? 'face-down' : ''} ${small ? 'small' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      style={!faceDown ? { 
        borderTop: `3px solid ${card.color}`,
      } : {}}
    >
      {!faceDown && (
        <div className="card-content">
          <div className="card-main-content">
            <span className="card-word" style={{ whiteSpace: 'pre-wrap' }}>{card.word}</span>
          </div>
          <div className="card-bottom">
            <span className="card-hint" style={{ whiteSpace: 'pre-wrap' }}>{card.hint}</span>
            <span 
              className="card-category" 
              style={{ 
                color: card.color,
                whiteSpace: 'pre-wrap'
              }}
            >
              {card.category}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Card; 