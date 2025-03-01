import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PlayerNameForm from '../components/PlayerNameForm';
import './HomePage.scss';
import useLogin from '../hooks/useLogin'

function HomePage() {
  const { playerName, setPlayerName } = useLogin()
  const [showNameForm, setShowNameForm] = useState(false);

  useEffect(() => {
    if (!playerName) {
      setShowNameForm(true);
    }
  }, []);

  const handleNameSubmit = (name) => {
    setPlayerName(name);
    setShowNameForm(false);
  };

  if (showNameForm) {
    return (
      <div className="home-page name-form-container">
        <PlayerNameForm onSubmit={handleNameSubmit} />
      </div>
    );
  }

  return (
    <div className="home-page">
      <h1>Phrasal Verb Card Game</h1>
      <p className="welcome-message">Welcome, {playerName}!</p>
      <div className="button-container">
        <Link to="/new" className="button">New Game</Link>
        <Link to="/join" className="button">Join Game</Link>
      </div>
      <button
        className="change-name-button"
        onClick={() => setShowNameForm(true)}
      >
        Change Name
      </button>
    </div>
  );
}

export default HomePage;