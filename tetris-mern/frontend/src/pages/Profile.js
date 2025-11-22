import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, fetchUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchUserStats();
    fetchRecentScores();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await axios.get('/api/scores/personal-best');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentScores = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/scores/user/${user?.id}?limit=10`);
      setScores(response.data.scores);
    } catch (error) {
      console.error('Error fetching scores:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back
        </button>
        <h1>👤 Profile</h1>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar">{user.avatar || '🎮'}</div>
            <h2>{user.username}</h2>
            <p className="profile-email">{user.email}</p>
          </div>

          <div className="profile-stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-info">
                <div className="stat-label">High Score</div>
                <div className="stat-value">{user.highScore?.toLocaleString() || 0}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <div className="stat-label">Highest Level</div>
                <div className="stat-value">{user.highestLevel || 0}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎮</div>
              <div className="stat-info">
                <div className="stat-label">Games Played</div>
                <div className="stat-value">{user.totalGamesPlayed || 0}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-info">
                <div className="stat-label">Lines Cleared</div>
                <div className="stat-value">{user.totalLinesCleared?.toLocaleString() || 0}</div>
              </div>
            </div>

            {user.multiplayerWins !== undefined && (
              <>
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-info">
                    <div className="stat-label">Multiplayer Wins</div>
                    <div className="stat-value">{user.multiplayerWins || 0}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">❌</div>
                  <div className="stat-info">
                    <div className="stat-label">Multiplayer Losses</div>
                    <div className="stat-value">{user.multiplayerLosses || 0}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="recent-scores-section">
          <h3>Recent Games</h3>
          {loading ? (
            <div className="loading">Loading scores...</div>
          ) : scores.length === 0 ? (
            <div className="no-scores">No games played yet. Start playing to see your scores here!</div>
          ) : (
            <div className="scores-list">
              {scores.map((score) => (
                <div key={score._id} className="score-item">
                  <div className="score-main">
                    <div className="score-value">{score.score.toLocaleString()}</div>
                    <div className="score-details">
                      <span>Level {score.level}</span>
                      <span>•</span>
                      <span>{score.linesCleared} lines</span>
                      <span>•</span>
                      <span className="score-mode">{score.gameMode}</span>
                    </div>
                  </div>
                  <div className="score-date">
                    {new Date(score.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

