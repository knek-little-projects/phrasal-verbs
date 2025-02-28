import Card from './Card';
import Deck from './Deck';
import OpenHand from './OpenHand';
import './GameBoard.scss';

function GameBoard({ 
  players, 
  currentPlayer, 
  tableCards, 
  cardPositions, 
  winner,
  onPlayCard,
  onSkipTurn,
  onRestart,
  deck
}) {
  return (
    <div className="game-board">
      {winner !== null ? (
        <div className="winner-overlay">
          <div className="winner-message">
            <h2>🎉 Player {winner + 1} Wins! 🎉</h2>
            <button className="restart-button" onClick={onRestart}>
              Start Over
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="opponents">
            {players.map((player, index) => (
              index !== currentPlayer && (
                <div key={player.id} className="opponent">
                  <div className="player-name">Player {player.id + 1}</div>
                  <div className="opponent-cards">
                    {player.cards.map((card, cardIndex) => (
                      <Card 
                        key={cardIndex} 
                        card={card} 
                        faceDown={true} 
                        small={true}
                      />
                    ))}
                  </div>
                </div>
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

          <OpenHand 
            cards={players[currentPlayer]?.cards || []}
            onPlayCard={onPlayCard}
            onSkipTurn={onSkipTurn}
            playerName={`Player ${currentPlayer + 1}`}
          />
        </>
      )}
    </div>
  );
}

export default GameBoard; 