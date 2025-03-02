import React from 'react';
import OpponentHand from './OpponentHand';

const OpponentList = ({ players, playerNames, excludePlayerIndex, currentPlayer }) => {
  return (
    <div className="opponents">
      {players.map((player, index) => (
        index !== excludePlayerIndex && (
          <OpponentHand
            key={player.id}
            cards={player.cards}
            playerName={playerNames[player.id] || `???`}
            isActive={currentPlayer === player.id}
          />
        )
      ))}
    </div>
  );
}

export default OpponentList; 