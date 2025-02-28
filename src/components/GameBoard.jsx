import Deck from './Deck';
import OpenHand from './OpenHand';
import OpponentList from './OpponentList';
import CardHeap from './CardHeap';
import './GameBoard.scss';
import * as utils from '../utils';


export default function GameBoard({ 
  players, 
  currentPlayer, 
  tableCards, 
  onPlayCard,
  onSkipTurn,
  deck,
}) {
  const showSkipOption = true;

  const isCardPlayable = (card) => {
    return utils.isCardPlayable(card, tableCards[tableCards.length - 1])
  }

  const randomizedCardPositions = utils.generateCardPositions(tableCards.length, 30, 30, 20);

  return (
    <div className="game-board">
      <OpponentList players={players} currentPlayer={currentPlayer} />

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
        showSkipOption={showSkipOption}
      />
    </div>
  );
}
