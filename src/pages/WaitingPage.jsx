import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRemoteGameEngine } from '../hooks/useRemoteGameEngine';
import './WaitingPage.scss';

function WaitingPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const {
    error,
    playerNames,
    joinedPlayers,
    gameStarted,
    playerCount,
    joinGame,
    getGameState,
  } = useRemoteGameEngine({
    gameId,
  });

  useEffect(() => {
    const checkGame = async () => {
      try {
        setLoading(true);
        // Get the current game state
        await getGameState();
        setLoading(false);
      } catch (error) {
        console.error("Error getting game state:", error);
        setLoading(false);
      }
    };
    
    checkGame();
  }, [getGameState]);

  useEffect(() => {
    if (gameStarted) {
      // Redirect to game page when the game starts
      navigate(`/game/${gameId}`);
    }
  }, [gameStarted, navigate, gameId]);

  const handleJoinGame = async () => {
    try {
      await joinGame();
    } catch (error) {
      console.error("Error joining game:", error);
    }
  };

  if (loading) {
    return (
      <div className="waiting-page">
        <div className="waiting-container">
          <h2>Loading game...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="waiting-page">
      <div className="waiting-container">
        <h2>Game: {gameId}</h2>
        <p className="waiting-message">
          Waiting for players to join ({joinedPlayers}/{playerCount})
        </p>
        
        <div className="player-list">
          <h3>Players:</h3>
          <ul>
            {playerNames.slice(0, joinedPlayers).map((name, index) => (
              <li key={index} className="player-item">
                {name}
              </li>
            ))}
            {Array(playerCount - joinedPlayers).fill().map((_, index) => (
              <li key={`empty-${index}`} className="player-item empty">
                Waiting for player...
              </li>
            ))}
          </ul>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {joinedPlayers < playerCount && (
          <button 
            className="join-button"
            onClick={handleJoinGame}
          >
            Join Game
          </button>
        )}
        
        <button className="back-button" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default WaitingPage; 