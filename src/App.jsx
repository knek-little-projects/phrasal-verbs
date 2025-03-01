import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NewGamePage from './pages/NewGamePage';
import JoinGamePage from './pages/JoinGamePage';
import GamePage from './pages/GamePage';
import './App.scss';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/new" element={<NewGamePage />} />
          <Route path="/join" element={<JoinGamePage />} />
          <Route path="/game/:gameId" element={<GamePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 