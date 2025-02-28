import React from 'react';
import OpponentHand from './OpponentHand';

const OpponentList = ({ players, currentPlayer }) => {
  return (
    <div className="opponents">
      {players.map((player, index) => (
        index !== currentPlayer && (
          <OpponentHand
            key={player.id}
            cards={player.cards}
            playerName={`Player ${player.id + 1}`}
          />
        )
      ))}
    </div>
  );
}

export default OpponentList; 