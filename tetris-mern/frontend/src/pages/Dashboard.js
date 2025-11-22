import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleStartGame = (mode) => {
    navigate(`/game/${mode}`);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="user-info">
          <span className="user-avatar">{user?.avatar || '🎮'}</span>
          <div>
            <h2>Welcome, {user?.username || 'Player'}!</h2>
            <p className="user-stats">
              High Score: <span>{user?.highScore || 0}</span> • 
              Level: <span>{user?.highestLevel || 0}</span> • 
              Games: <span>{user?.totalGamesPlayed || 0}</span>
            </p>
          </div>
        </div>
        <nav className="dashboard-nav">
          <button onClick={() => navigate('/leaderboard')} className="nav-btn">
            🏆 Leaderboard
          </button>
          <button onClick={() => navigate('/profile')} className="nav-btn">
            👤 Profile
          </button>
        </nav>
      </div>

      <div className="game-modes">
        <h1 className="dashboard-title">Choose Game Mode</h1>
        
        <div className="mode-cards">
          <div className="mode-card" onClick={() => handleStartGame('single')}>
            <div className="mode-icon">🎮</div>
            <h3>Single Player</h3>
            <p>Classic Tetris experience. Clear lines, level up, and beat your high score!</p>
            <div className="mode-features">
              <span>✓ Progressive difficulty</span>
              <span>✓ Score tracking</span>
              <span>✓ Level system</span>
            </div>
            <button className="btn btn-primary">Start Game</button>
          </div>

          <div className="mode-card" onClick={() => handleStartGame('multiplayer')}>
            <div className="mode-icon">👥</div>
            <h3>Multiplayer</h3>
            <p>Challenge a friend! Send garbage lines and be the last one standing.</p>
            <div className="mode-features">
              <span>✓ Real-time battles</span>
              <span>✓ Garbage lines</span>
              <span>✓ Head-to-head</span>
            </div>
            <button className="btn btn-primary">Start Game</button>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <div className="controls-info">
          <h4>Controls</h4>
          <div className="controls-grid">
            <div className="control-item">
              <kbd>←</kbd> <kbd>→</kbd>
              <span>Move</span>
            </div>
            <div className="control-item">
              <kbd>↑</kbd>
              <span>Rotate</span>
            </div>
            <div className="control-item">
              <kbd>↓</kbd>
              <span>Soft Drop</span>
            </div>
            <div className="control-item">
              <kbd>Space</kbd>
              <span>Hard Drop</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

