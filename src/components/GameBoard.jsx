import Card from './Card';
import Deck from './Deck';
import OpenHand from './OpenHand';
import OpponentHand from './OpponentHand';
import CardHeap from './CardHeap';
import './GameBoard.scss';
import * as utils from '../utils';


export default function GameBoard({ 
  players, 
  currentPlayer, 
  tableCards, 
  cardPositions,
  onPlayCard,
  onSkipTurn,
  deck,
}) {

  const isCardPlayable = (card) => {
    return utils.isCardPlayable(card, tableCards[tableCards.length - 1])
  }

  const randomizedCardPositions = utils.generateCardPositions(tableCards.length, 30, 30, 20);

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
        
        <CardHeap tableCards={tableCards} cardPositions={randomizedCardPositions} />
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
