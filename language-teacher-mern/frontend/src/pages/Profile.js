import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, fetchUser } = useContext(AuthContext);
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAchievements();
    fetchStats();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await axios.get('/api/achievements');
      setAchievements(response.data.achievements);
    } catch (error) {
      console.error('Fetch achievements error:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/history/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  if (!user) return <div>Loading...</div>;

  const xpForNext = Math.pow(user.level, 2) * 100;
  const xpForCurrent = Math.pow(user.level - 1, 2) * 100;
  const xpProgress = user.xp - xpForCurrent;
  const xpNeeded = xpForNext - xpForCurrent;
  const xpPercent = (xpProgress / xpNeeded) * 100;

  return (
    <div className="profile-page">
      <div className="container">
        <h1>👤 Your Profile</h1>

        <div className="profile-card">
          <div className="profile-header">
            <span className="profile-avatar">{user.avatar}</span>
            <div>
              <h2>{user.username}</h2>
              <div className="profile-level">Level {user.level}</div>
              <div className="xp-info">
                {xpProgress} / {xpNeeded} XP
              </div>
              <div className="xp-bar">
                <div className="xp-fill" style={{ width: `${xpPercent}%` }}></div>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-number">{user.streak}</div>
              <div className="stat-label">Day Streak</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-number">{user.totalConversations}</div>
              <div className="stat-label">Conversations</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-number">{user.achievements?.length || 0}</div>
              <div className="stat-label">Achievements</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-number">{stats?.averageScore || 0}</div>
              <div className="stat-label">Avg Score</div>
            </div>
          </div>
        </div>

        <div className="section">
          <h3>🏆 Achievements</h3>
          <div className="achievements-grid">
            {achievements.map(achievement => (
              <div
                key={achievement.id}
                className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
              >
                {achievement.unlocked && <div className="achievement-badge">✓</div>}
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-name">{achievement.name}</div>
                <div className="achievement-desc">{achievement.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

