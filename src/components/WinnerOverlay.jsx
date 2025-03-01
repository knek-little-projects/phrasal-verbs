import React from 'react';
import './WinnerOverlay.scss';

function WinnerOverlay({ winner, onRestart, onExit }) {
  return (
    <div className="winner-overlay">
      <div className="winner-content">
        <h2>Player {winner + 1} Wins!</h2>
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