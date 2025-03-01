import { useRef, useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import GameBoard from '../components/GameBoard';
import WinnerOverlay from '../components/WinnerOverlay';
import MovingCard from '../components/MovingCard';
import { useRemoteGameEngine } from '../hooks/useRemoteGameEngine';
import './GamePage.scss';

function GamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const gameboardRef = useRef(null);

  const {
    gameState,
    movingCard,
    error,
    handlePlayCard,
    handleSkipTurn,
    restartGame,
  } = useRemoteGameEngine({ gameId });

  // Update references from individual state variables to gameState properties
  const {
    deck,
    players,
    currentPlayer,
    tableCards,
    cardPositions,
    winner,
    playerNames,
  } = gameState;

  // Update effect to check joined players against player count
  useEffect(() => {
    if (gameState.joinedPlayers < gameState.playerCount) {
      navigate(`/waiting/${gameId}`);
    }
  }, [gameState.joinedPlayers, gameState.playerCount, gameId, navigate]);

  const getElementPosition = (element) => {
    const rect = element.getBoundingClientRect();
    const gameboardRect = gameboardRef.current.getBoundingClientRect();
    
    return {
      x: rect.left - gameboardRect.left + rect.width / 2,
      y: rect.top - gameboardRect.top + rect.height / 2
    };
  };

  const onPlayCard = (cardIndex) => {
    const cardElement = gameboardRef.current.querySelector('.open-hand .player-cards .card-wrapper.selected .card');
    const tableElement = gameboardRef.current.querySelector('.table');
    
    if (!cardElement || !tableElement) return;

    const startPos = getElementPosition(cardElement);
    const tablePos = getElementPosition(tableElement);
    
    handlePlayCard(cardIndex, startPos, tablePos);
  };

  const onSkipTurn = () => {
    if (deck.length === 0) {
      handleSkipTurn();
      return;
    }

    const deckElement = gameboardRef.current.querySelector('.deck');
    const playerHandElement = gameboardRef.current.querySelector('.open-hand');
    
    if (!deckElement || !playerHandElement) return;

    const deckPos = getElementPosition(deckElement);
    const handPos = getElementPosition(playerHandElement);
    
    handleSkipTurn(deckPos, handPos);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="game-page" ref={gameboardRef}>
      <div className="game-header">
        <h2>Game: {gameId}</h2>
        <button className="back-button" onClick={handleBackToHome}>
          Exit Game
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <GameBoard
        players={players}
        currentPlayer={currentPlayer}
        tableCards={tableCards}
        cardPositions={cardPositions}
        onPlayCard={onPlayCard}
        onSkipTurn={onSkipTurn}
        deck={deck}
        playerNames={playerNames}
      />
      
      {winner !== null && (
        <WinnerOverlay 
          winner={winner} 
          onRestart={restartGame}
          onExit={handleBackToHome}
          playerNames={playerNames}
        />
      )}
      
      {movingCard && (
        <MovingCard
          card={movingCard.card}
          startPos={movingCard.startPos}
          endPos={movingCard.endPos}
          rotation={movingCard.rotation}
        />
      )}
    </div>
  );
}

export default GamePage; 