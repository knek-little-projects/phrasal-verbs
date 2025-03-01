import React from 'react';
import './WinnerOverlay.scss';

function WinnerOverlay({ winner, onRestart, onExit, playerNames = [] }) {
  const winnerName = playerNames && playerNames.length > winner 
    ? playerNames[winner] 
    : `Player ${winner + 1}`;

  return (
    <div className="winner-overlay">
      <div className="winner-content">
        <h2>{winnerName} Wins!</h2>
        <div className="button-container">
          <button onClick={onRestart} className="restart-button">
            Play Again
          </button>
          <button onClick={onExit} className="exit-button">
            Exit to Menu
          </button>
        </div>
      </div>
    </div>
  );
}

export default WinnerOverlay; 