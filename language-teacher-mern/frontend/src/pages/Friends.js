import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './Friends.css';

const Friends = () => {
  const { user } = useContext(AuthContext);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendProfile, setFriendProfile] = useState(null);
  const [allAchievements, setAllAchievements] = useState([]);

  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
    fetchAllAchievements();
  }, []);

  const fetchAllAchievements = async () => {
    try {
      const response = await axios.get('/api/achievements');
      setAllAchievements(response.data.achievements);
    } catch (error) {
      console.error('Fetch achievements error:', error);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await axios.get('/api/friends');
      setFriends(response.data.friends);
    } catch (error) {
      console.error('Fetch friends error:', error);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await axios.get('/api/friends/requests');
      setFriendRequests(response.data.requests);
    } catch (error) {
      console.error('Fetch friend requests error:', error);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;

    try {
      const response = await axios.get(`/api/users/search?q=${searchQuery}`);
      setSearchResults(response.data.users);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await axios.post('/api/friends/request', { userId });
      alert('Friend request sent!');
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.put(`/api/friends/requests/${requestId}`, { action: 'accept' });
      fetchFriends();
      fetchFriendRequests();
    } catch (error) {
      console.error('Accept request error:', error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.put(`/api/friends/requests/${requestId}`, { action: 'reject' });
      fetchFriendRequests();
    } catch (error) {
      console.error('Reject request error:', error);
    }
  };

  const handleViewFriend = async (friendId) => {
    try {
      const response = await axios.get(`/api/friends/${friendId}/profile`);
      setFriendProfile(response.data.friend);
      setSelectedFriend(friendId);
    } catch (error) {
      console.error('View friend error:', error);
    }
  };

  return (
    <div className="friends-page">
      <div className="container">
        <h1>👥 Friends</h1>

        <div className="friends-section">
          <h2>Search Users</h2>
          <div className="search-box">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by username..."
              className="input"
            />
            <button onClick={handleSearch} className="btn btn-primary">Search</button>
          </div>

          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map(user => (
                <div key={user._id} className="user-card">
                  <span className="avatar">{user.avatar}</span>
                  <div>
                    <div className="username">{user.username}</div>
                    <div className="user-level">Level {user.level}</div>
                  </div>
                  <button
                    onClick={() => handleSendRequest(user._id)}
                    className="btn btn-primary"
                  >
                    Add Friend
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {friendRequests.length > 0 && (
          <div className="friends-section">
            <h2>Friend Requests</h2>
            {friendRequests.map(request => (
              <div key={request.id} className="request-card">
                <span className="avatar">{request.from.avatar}</span>
                <div>
                  <div className="username">{request.from.username}</div>
                  <div className="user-level">Level {request.from.level}</div>
                </div>
                <div className="request-actions">
                  <button
                    onClick={() => handleAcceptRequest(request.id)}
                    className="btn btn-primary"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.id)}
                    className="btn btn-secondary"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="friends-section">
          <h2>Your Friends ({friends.length})</h2>
          {friends.length === 0 ? (
            <p>No friends yet. Search for users to add friends!</p>
          ) : (
            <div className="friends-grid">
              {friends.map(friend => (
                <div
                  key={friend._id}
                  className="friend-card"
                  onClick={() => handleViewFriend(friend._id)}
                >
                  <span className="avatar">{friend.avatar}</span>
                  <div className="username">{friend.username}</div>
                  <div className="user-stats">
                    Level {friend.level} • {friend.xp} XP • 🔥 {friend.streak}
                  </div>
                  <div className="achievements-count">
                    🏆 {friend.achievements?.length || 0} achievements
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {friendProfile && (
          <div className="friend-profile-modal">
            <div className="modal-content">
              <button
                onClick={() => {
                  setFriendProfile(null);
                  setSelectedFriend(null);
                }}
                className="close-btn"
              >
                ×
              </button>
              <h2>{friendProfile.username}'s Profile</h2>
              <div className="profile-info">
                <span className="avatar large">{friendProfile.avatar}</span>
                <div>
                  <div className="username">{friendProfile.username}</div>
                  <div className="user-level">Level {friendProfile.level}</div>
                  <div className="user-stats">
                    {friendProfile.xp} XP • 🔥 {friendProfile.streak} day streak
                  </div>
                </div>
              </div>
              <div className="stats-section">
                <h3>Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-label">Total Sessions</div>
                    <div className="stat-value">{friendProfile.stats?.totalSessions || 0}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Average Score</div>
                    <div className="stat-value">{friendProfile.stats?.averageScore || 0}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Languages</div>
                    <div className="stat-value">{friendProfile.stats?.languagesPracticed || 0}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Total XP</div>
                    <div className="stat-value">{friendProfile.stats?.totalXP || 0}</div>
                  </div>
                </div>
              </div>
              <div className="achievements-section">
                <h3>🏆 Achievements ({friendProfile.achievements?.length || 0})</h3>
                <div className="achievements-grid">
                  {allAchievements.map(achievement => {
                    const isUnlocked = friendProfile.achievements?.includes(achievement.id) || false;
                    return (
                      <div
                        key={achievement.id}
                        className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                      >
                        {isUnlocked && <div className="achievement-badge">✓</div>}
                        <div className="achievement-icon">{achievement.icon}</div>
                        <div className="achievement-name">{achievement.name}</div>
                        <div className="achievement-desc">{achievement.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;

