import Card from './Card';
import Deck from './Deck';
import OpenHand from './OpenHand';
import OpponentHand from './OpponentHand';
import './GameBoard.scss';

export default function GameBoard({ 
  players, 
  currentPlayer, 
  tableCards, 
  cardPositions,
  onPlayCard,
  onSkipTurn,
  deck,
  isCardPlayable
}) {
  return (
    <div className="game-board">
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

      <div className="table">
        {deck.length > 0 && <Deck count={deck.length} />}
        
        {tableCards.map((card, index) => (
          <div
            key={index}
            className="table-card"
            style={{
              position: 'absolute',
              transform: `translate(${cardPositions[index]?.x}px, ${cardPositions[index]?.y}px) rotate(${cardPositions[index]?.rotation}deg)`,
              '--card-index': index
            }}
          >
            <Card card={card} faceDown={false} />
          </div>
        ))}
      </div>

      <div className="player-name">{`Player ${currentPlayer + 1}`}</div>

      <OpenHand 
        cards={players[currentPlayer]?.cards || []}
        onPlayCard={onPlayCard}
        onSkipTurn={onSkipTurn}
        isCardPlayable={isCardPlayable}
      />
    </div>
  );
}
