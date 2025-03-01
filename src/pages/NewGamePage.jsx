import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NewGamePage.scss';

function NewGamePage() {
  const [gameId, setGameId] = useState('My New Game');
  const [playerCount, setPlayerCount] = useState(2);
  const [startDealtCardsCount, setStartDealtCardsCount] = useState(3);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!gameId.trim()) {
      setError('Please enter a game name');
      return;
    }

    // Navigate to the game page with the specified parameters
    navigate(`/game/${gameId}?playerCount=${playerCount}&startDealtCardsCount=${startDealtCardsCount}`);
  };

  return (
    <div className="new-game-page">
      <h1>Create New Game</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="gameId">Game Name:</label>
          <input
            type="text"
            id="gameId"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            placeholder="Enter a unique game name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="playerCount">Number of Players:</label>
          <select
            id="playerCount"
            value={playerCount}
            onChange={(e) => setPlayerCount(Number(e.target.value))}
          >
            {[2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="startDealtCardsCount">Starting Cards per Player:</label>
          <select
            id="startDealtCardsCount"
            value={startDealtCardsCount}
            onChange={(e) => setStartDealtCardsCount(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        <div className="button-container">
          <button type="submit" className="button">Start Game</button>
          <button type="button" className="button secondary" onClick={() => navigate('/')}>
            Back
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewGamePage; 