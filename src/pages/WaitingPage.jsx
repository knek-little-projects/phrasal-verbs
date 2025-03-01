import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRemoteGameEngine } from '../hooks/useRemoteGameEngine';
import './WaitingPage.scss';
import Loader from '../components/Loader';

export default function WaitingPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [joinError, setJoinError] = useState(null);
  const [hasJoined, setHasJoined] = useState(false);
  
  const {
    gameState,
    error,
    joinGame,
  } = useRemoteGameEngine({
    gameId,
  });

  useEffect(() => {
    const attemptJoinGame = async () => {
      if (!hasJoined) {
        console.log(`Attempting to join game: ${gameId}`);
        try {
          await joinGame();
          setHasJoined(true);
          console.log(`Successfully joined game: ${gameId}`);
        } catch (error) {
          setJoinError("Failed to join the game. Please try again.");
          console.error("Error joining game:", error);
        }
      }
    };

    attemptJoinGame();
  }, [gameId, hasJoined]);

  useEffect(() => {
    if (gameState && gameState.gameStarted) {
      console.log(`Game has started. Redirecting to game page: ${gameId}`);
      navigate(`/game/${gameId}`);
    }
  }, [gameState, navigate, gameId]);

  // Check for null gameState before rendering
  if (gameState == null) {
    return <Loader />;
  }

  // Destructure gameState after confirming it's not null
  const {
    playerNames,
    joinedPlayers,
    playerCount,
    gameStarted,
  } = gameState;

  // Check for invalid state before rendering
  if (playerCount == null || joinedPlayers == null) {
    throw new Error(`Invalid state: playerCount (${playerCount}) or joinedPlayers (${joinedPlayers}) is null or undefined.`);
  }

  if (playerCount < joinedPlayers) {
    throw new Error(`Invalid state: playerCount (${playerCount}) is less than joinedPlayers (${joinedPlayers}).`);
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
        {joinError && <div className="error-message">{joinError}</div>}
        
        <button className="back-button" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    </div>
  );
}
