import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Leaderboard.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [mode, setMode] = useState('single');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();
  }, [mode]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/scores/leaderboard?mode=${mode}&limit=50`);
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back
        </button>
        <h1>🏆 Leaderboard</h1>
        <div className="mode-selector">
          <button
            className={`mode-btn ${mode === 'single' ? 'active' : ''}`}
            onClick={() => setMode('single')}
          >
            Single Player
          </button>
          <button
            className={`mode-btn ${mode === 'multiplayer' ? 'active' : ''}`}
            onClick={() => setMode('multiplayer')}
          >
            Multiplayer
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading leaderboard...</div>
      ) : (
        <div className="leaderboard-container">
          <div className="leaderboard-table">
            <div className="table-header">
              <div className="rank-col">Rank</div>
              <div className="player-col">Player</div>
              <div className="score-col">Score</div>
              <div className="level-col">Level</div>
              <div className="lines-col">Lines</div>
            </div>
            {leaderboard.length === 0 ? (
              <div className="no-scores">No scores yet. Be the first to play!</div>
            ) : (
              leaderboard.map((entry, index) => (
                <div key={entry._id} className={`table-row ${index < 3 ? 'top-three' : ''}`}>
                  <div className="rank-col">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `#${index + 1}`}
                  </div>
                  <div className="player-col">
                    <span className="player-avatar">{entry.userId?.avatar || '🎮'}</span>
                    <span className="player-name">{entry.userId?.username || 'Anonymous'}</span>
                  </div>
                  <div className="score-col">{entry.score.toLocaleString()}</div>
                  <div className="level-col">{entry.level}</div>
                  <div className="lines-col">{entry.linesCleared}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;

