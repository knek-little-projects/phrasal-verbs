import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './JoinGamePage.scss';

function JoinGamePage() {
  const [gameId, setGameId] = useState('');
  const [activeGames, setActiveGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch active games from the server
    const fetchActiveGames = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/game/active');
        
        if (!response.ok) {
          throw new Error('Failed to fetch active games');
        }
        
        const data = await response.json();
        setActiveGames(data.games || []);
      } catch (error) {
        console.error('Error fetching active games:', error);
        setError('Unable to load active games. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchActiveGames();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!gameId.trim()) {
      setError('Please enter a game name');
      return;
    }
    
    navigate(`/game/${gameId}`);
  };

  const handleJoinGame = (selectedGameId) => {
    navigate(`/game/${selectedGameId}`);
  };

  return (
    <div className="join-game-page">
      <h1>Join Game</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="gameId">Game Name:</label>
          <input
            type="text"
            id="gameId"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            placeholder="Enter the game name to join"
          />
        </div>
        
        <div className="button-container">
          <button type="submit" className="button">Join Game</button>
          <button type="button" className="button secondary" onClick={() => navigate('/')}>
            Back
          </button>
        </div>
      </form>
      
      <div className="active-games">
        <h2>Active Games</h2>
        
        {loading ? (
          <p>Loading active games...</p>
        ) : activeGames.length > 0 ? (
          <ul className="game-list">
            {activeGames.map(game => (
              <li key={game.id} className="game-item">
                <div className="game-info">
                  <span className="game-name">{game.id}</span>
                  <span className="player-count">Players: {game.playerCount}</span>
                </div>
                <button 
                  className="join-button"
                  onClick={() => handleJoinGame(game.id)}
                >
                  Join
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No active games found. Create a new game instead!</p>
        )}
      </div>
    </div>
  );
}

export default JoinGamePage; 