import { useState, useEffect } from 'react';
import './PlayerNameForm.scss';

function PlayerNameForm({ onSubmit, initialName = '' }) {
  const [playerName, setPlayerName] = useState(initialName);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    onSubmit(playerName);
  };

  return (
    <div className="player-name-form">
      <h2>Enter Your Name</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="playerName">Your Name:</label>
          <input
            type="text"
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            autoFocus
          />
        </div>
        
        <button type="submit" className="button">
          Continue
        </button>
      </form>
    </div>
  );
}

export default PlayerNameForm; 