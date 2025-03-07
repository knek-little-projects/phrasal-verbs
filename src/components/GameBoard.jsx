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
  playerNames = [],
  thisPlayerIndex,
  isMyTurn,
}) {
  const showSkipOption = true;

  const isCardPlayable = (card) => {
    return utils.isCardPlayable(card, tableCards[tableCards.length - 1])
  }

  const randomizedCardPositions = utils.generateCardPositions(tableCards.length, 30, 30, 20);

  const getPlayerName = (index) => {
    return playerNames && playerNames.length > index
      ? playerNames[index]
      : `???`;
  };

  return (
    <div className="game-board">

      <div className="row opponents-row">
        <OpponentList
          players={players}
          playerNames={playerNames}
          excludePlayerIndex={thisPlayerIndex}
          currentPlayer={currentPlayer}
        />
      </div>

      <div className="row table-row">
        <div className="table">
          {deck.length > 0 && <Deck count={deck.length} />}

          <CardHeap tableCards={tableCards} cardPositions={randomizedCardPositions} />
        </div>
      </div>

      <div className="row">
        <div className="player-wrapper">
          <div className='player-name-wrapper'>
            <div className={`player-name ${isMyTurn ? 'active' : ''}`}>
              {getPlayerName(thisPlayerIndex)}
            </div>
          </div>

          <OpenHand
            cards={players[thisPlayerIndex]?.cards || []}
            onPlayCard={onPlayCard}
            onSkipTurn={onSkipTurn}
            isCardPlayable={isCardPlayable}
            showSkipOption={showSkipOption}
            playable={isMyTurn}
          />
        </div>
      </div>
    </div>
  );
}
