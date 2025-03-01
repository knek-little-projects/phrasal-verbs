import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NewGamePage from './pages/NewGamePage';
import JoinGamePage from './pages/JoinGamePage';
import GamePage from './pages/GamePage';
import WaitingPage from './pages/WaitingPage';
import './App.scss';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/new" element={<NewGamePage />} />
          <Route path="/join" element={<JoinGamePage />} />
          <Route path="/game/:gameId" element={<GamePage />} />
          <Route path="/waiting/:gameId" element={<WaitingPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App; 