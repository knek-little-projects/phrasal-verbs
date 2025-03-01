import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NewGamePage.scss';

function NewGamePage() {
  const [gameId, setGameId] = useState('My New Game');
  const [playerCount, setPlayerCount] = useState(2);
  const [startDealtCardsCount, setStartDealtCardsCount] = useState(3);
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get player name from localStorage
    const storedName = localStorage.getItem('playerName');
    if (storedName) {
      setPlayerName(storedName);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!gameId.trim()) {
      setError('Please enter a game name');
      return;
    }

    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    // Save player name to localStorage
    localStorage.setItem('playerName', playerName);
    
    try {
      setIsCreating(true);
      setError('');
      
      // Call the initialize API to create the game
      const response = await fetch('http://localhost:5000/api/game/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          playerCount,
          startDealtCardsCount,
          playerName,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create game');
      }
      
      // Navigate to the waiting page after successful initialization
      navigate(`/waiting/${gameId}`);
    } catch (error) {
      setError(error.message || 'Failed to create game. Please try again.');
      console.error('Failed to create game:', error);
    } finally {
      setIsCreating(false);
    }
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
            disabled={isCreating}
          />
        </div>

        <div className="form-group">
          <label htmlFor="playerCount">Number of Players:</label>
          <select
            id="playerCount"
            value={playerCount}
            onChange={(e) => setPlayerCount(Number(e.target.value))}
            disabled={isCreating}
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
            disabled={isCreating}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        <div className="button-container">
          <button type="submit" className="button" disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Start Game'}
          </button>
          <button 
            type="button" 
            className="button secondary" 
            onClick={() => navigate('/')}
            disabled={isCreating}
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewGamePage; 