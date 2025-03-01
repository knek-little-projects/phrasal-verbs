import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const ActiveGamesList = ({ activeGames, loading, handleJoinGame }) => {
  const formatTime = (isoString) => {
    try {
      return formatDistanceToNow(new Date(isoString), { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  const getPlayerNamesString = (playerNames, joinedPlayers) => {
    if (!playerNames || playerNames.length === 0) return 'No players';
    
    const joinedNames = playerNames.slice(0, joinedPlayers);
    const customNames = joinedNames.filter(name => !name.match(/^Player \d+$/));
    
    if (customNames.length === 0) return `${joinedPlayers} players`;
    
    if (customNames.length <= 2) {
      return customNames.join(', ');
    }
    
    return `${customNames[0]}, ${customNames[1]}, +${customNames.length - 2} more`;
  };

  return (
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
                <span className="player-count">
                  {getPlayerNamesString(game.playerNames, game.joinedPlayers)}
                </span>
                <span className="game-status">
                  {game.gameStarted ? 'In progress' : `Waiting (${game.joinedPlayers}/${game.playerCount})`}
                </span>
                <span className="last-played">
                  Last activity: {formatTime(game.lastPlayedTime)}
                </span>
              </div>
              <button 
                className="join-button"
                onClick={() => handleJoinGame(game.id)}
                disabled={game.gameStarted && game.joinedPlayers >= game.playerCount}
              >
                {game.gameStarted ? 'Spectate' : 'Join'}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No active games found. Create a new game instead!</p>
      )}
    </div>
  );
};

export default ActiveGamesList; 