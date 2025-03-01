import { Link } from 'react-router-dom';
import './HomePage.scss';

function HomePage() {
  return (
    <div className="home-page">
      <h1>Phrasal Verb Card Game</h1>
      <div className="button-container">
        <Link to="/new" className="button">New Game</Link>
        <Link to="/join" className="button">Join Game</Link>
      </div>
    </div>
  );
}

export default HomePage;