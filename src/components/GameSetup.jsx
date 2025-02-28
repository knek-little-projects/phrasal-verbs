import { useState } from 'react';
import './GameSetup.scss';

function GameSetup({ onStart }) {
  const [players, setPlayers] = useState(2);
  const [initialCards, setInitialCards] = useState(4);

  const handleStart = () => {
    onStart(players, initialCards);
  };

  return (
    <div className="game-setup">
      <h1>Card Game Setup</h1>
      <div className="setup-controls">
        <label>
          Number of Players:
          <select 
            value={players} 
            onChange={(e) => setPlayers(parseInt(e.target.value))}
          >
            <option value={2}>2 Players</option>
            <option value={3}>3 Players</option>
            <option value={4}>4 Players</option>
          </select>
        </label>
        <label>
          Initial Cards per Player:
          <select 
            value={initialCards} 
            onChange={(e) => setInitialCards(parseInt(e.target.value))}
          >
            {[2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num} Cards</option>
            ))}
          </select>
        </label>
        <button onClick={handleStart}>Start Game</button>
      </div>
    </div>
  );
}

export default GameSetup; 