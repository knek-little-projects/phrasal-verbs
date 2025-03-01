import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useRemoteGameEngine } from '../hooks/useRemoteGameEngine';
import './WaitingPage.scss';

function WaitingPage() {
  const { gameId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const playerCount = parseInt(searchParams.get('playerCount') || '4', 10);
  const playerName = searchParams.get('playerName') || '';
  const startDealtCardsCount = parseInt(searchParams.get('startDealtCardsCount') || '8', 10);

  const {
    error,
    playerNames,
    joinedPlayers,
    gameStarted,
    joinGame,
    initializeGame,
  } = useRemoteGameEngine({
    gameId,
    playerCount,
    startDealtCardsCount,
    playerName,
  });

  useEffect(() => {
    if (playerName) {
      initializeGame();
    }
  }, [playerName, initializeGame]);

  useEffect(() => {
    if (gameStarted) {
      // Redirect to game page when the game starts
      navigate(`/game/${gameId}?playerName=${playerName}&playerCount=${playerCount}&startDealtCardsCount=${startDealtCardsCount}`);
    }
  }, [gameStarted, navigate, gameId, playerName, playerCount, startDealtCardsCount]);

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
            onClick={joinGame}
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