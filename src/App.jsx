import { useState } from 'react';
import GameSetup from './components/GameSetup';
import GameBoard from './components/GameBoard';
import './App.scss';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState(2);
  
  const startGame = (numberOfPlayers) => {
    setPlayers(numberOfPlayers);
    setGameStarted(true);
  };

  return (
    <div className="app">
      {!gameStarted ? (
        <GameSetup onStart={startGame} />
      ) : (
        <GameBoard numberOfPlayers={players} />
      )}
    </div>
  );
}

export default App; 