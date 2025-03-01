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
  cardPositions, 
  onPlayCard,
  onSkipTurn,
  deck,
  playerNames = []
}) {
  const showSkipOption = true;

  const isCardPlayable = (card) => {
    return utils.isCardPlayable(card, tableCards[tableCards.length - 1])
  }

  const randomizedCardPositions = utils.generateCardPositions(tableCards.length, 30, 30, 20);

  const getPlayerName = (index) => {
    return playerNames && playerNames.length > index 
      ? playerNames[index] 
      : `Player ${index + 1}`;
  };

  return (
    <div className="game-board">
      <OpponentList players={players} currentPlayer={currentPlayer} />

      <div className="table">
        {deck.length > 0 && <Deck count={deck.length} />}
        
        <CardHeap tableCards={tableCards} cardPositions={randomizedCardPositions} />
      </div>

      <div className="player-name">{getPlayerName(currentPlayer)}</div>

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
