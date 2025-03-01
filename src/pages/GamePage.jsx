import { useRef, useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import GameBoard from '../components/GameBoard';
import WinnerOverlay from '../components/WinnerOverlay';
import MovingCard from '../components/MovingCard';
import PlayerNameForm from '../components/PlayerNameForm';
import { useRemoteGameEngine } from '../hooks/useRemoteGameEngine';
import './GamePage.scss';

function GamePage() {
  const { gameId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const gameboardRef = useRef(null);
  const [showNameForm, setShowNameForm] = useState(false);
  const [playerName, setPlayerName] = useState('');
  
  // Get parameters from URL or use defaults
  const playerCount = parseInt(searchParams.get('playerCount') || '4', 10);
  const startDealtCardsCount = parseInt(searchParams.get('startDealtCardsCount') || '8', 10);
  const urlPlayerName = searchParams.get('playerName') || '';

  useEffect(() => {
    // Check if player name exists in localStorage or URL
    const storedName = localStorage.getItem('playerName');
    if (urlPlayerName) {
      setPlayerName(urlPlayerName);
    } else if (storedName) {
      setPlayerName(storedName);
    } else {
      setShowNameForm(true);
    }
  }, [urlPlayerName]);

  const handleNameSubmit = (name) => {
    localStorage.setItem('playerName', name);
    setPlayerName(name);
    setShowNameForm(false);
  };

  const {
    deck,
    players,
    currentPlayer,
    tableCards,
    cardPositions,
    winner,
    movingCard,
    setMovingCard,
    handlePlayCard,
    handleSkipTurn,
    initializeGame,
    getGameState,
    restartGame,
    error,
    playerNames,
    gameStarted,
    joinedPlayers,
  } = useRemoteGameEngine({
    gameId, 
    playerCount, 
    startDealtCardsCount,
    playerName,
  });

  const [loading, setLoading] = useState(true);
  const [gameError, setGameError] = useState(null);

  useEffect(() => {
    // Get the game state when the component mounts and player name is set
    const fetchGameState = async () => {
      if (!playerName) return;
      
      try {
        setLoading(true);
        await getGameState();
        setLoading(false);
      } catch (error) {
        setGameError("Game not found or could not be loaded.");
        setLoading(false);
      }
    };
    
    fetchGameState();
  }, [gameId, playerName, getGameState]);

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

  if (showNameForm) {
    return (
      <div className="game-page name-form-container">
        <PlayerNameForm onSubmit={handleNameSubmit} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="game-page loading-container">
        <h2>Loading game...</h2>
      </div>
    );
  }

  if (gameError) {
    return (
      <div className="game-page error-container">
        <h2>Error</h2>
        <p>{gameError}</p>
        <button onClick={handleBackToHome}>Back to Home</button>
      </div>
    );
  }

  // Redirect to waiting page if game hasn't started
  if (!gameStarted && joinedPlayers < playerCount) {
    navigate(`/waiting/${gameId}?playerName=${playerName}&playerCount=${playerCount}&startDealtCardsCount=${startDealtCardsCount}`);
    return null;
  }

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
          startPosition={movingCard.startPos}
          endPosition={movingCard.endPos}
          onAnimationEnd={() => setMovingCard(null)}
          card={movingCard.card}
          rotation={movingCard.rotation}
        />
      )}
    </div>
  );
}

export default GamePage; 