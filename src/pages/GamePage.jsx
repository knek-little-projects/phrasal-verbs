import { useRef, useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import GameBoard from '../components/GameBoard';
import WinnerOverlay from '../components/WinnerOverlay';
import MovingCard from '../components/MovingCard';
import { useRemoteGameEngine } from '../hooks/useRemoteGameEngine';
import Loader from '../components/Loader';
import './GamePage.scss';
import useLogin from '../hooks/useLogin';

export default function GamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const gameboardRef = useRef(null);
  const { playerName } = useLogin();
  
  const {
    gameState,
    movingCard,
    error,
    handlePlayCard,
    handleSkipTurn,
    restartGame,
  } = useRemoteGameEngine({ gameId });

  useEffect(() => {
    if (gameState && gameState.joinedPlayers < gameState.playerCount) {
      navigate(`/waiting/${gameId}`);
    }
  }, [gameState, gameId, navigate]);

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!gameState) {
    return <Loader />;
  }

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

  // Add the isMyTurn constant
  const currentPlayerName = playerNames[currentPlayer]; // Assuming currentPlayer is an index
  const isMyTurn = currentPlayerName === playerName; // Replace 0 with the index of the current user if needed
  const thisPlayerIndex = playerNames.findIndex(name => name === playerName)

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
      
      <GameBoard
        players={players}
        currentPlayer={currentPlayer}
        tableCards={tableCards}
        cardPositions={cardPositions}
        onPlayCard={onPlayCard}
        onSkipTurn={onSkipTurn}
        deck={deck}
        playerNames={playerNames}
        isMyTurn={isMyTurn}
        thisPlayerIndex={thisPlayerIndex}
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
          startPosition={movingCard.startPos}
          endPosition={movingCard.endPos}
          rotation={movingCard.rotation}
          onAnimationEnd={() => {/* handle animation end */}}
        />
      )}
    </div>
  );
} 