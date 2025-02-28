import './WinnerOverlay.scss';

export default function WinnerOverlay({ winner, onRestart }) {
  return (
    <div className="winner-overlay">
      <div className="winner-message">
        <h2>🎉 Player {winner + 1} Wins! 🎉</h2>
        <button className="restart-button" onClick={onRestart}>
          Start Over
        </button>
      </div>
    </div>
  );
} 