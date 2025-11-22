import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './Dashboard.css';

const languages = [
  { name: 'Spanish', code: 'es', flag: '🇪🇸' },
  { name: 'French', code: 'fr', flag: '🇫🇷' },
  { name: 'German', code: 'de', flag: '🇩🇪' },
  { name: 'Italian', code: 'it', flag: '🇮🇹' },
  { name: 'Portuguese', code: 'pt', flag: '🇵🇹' },
  { name: 'Japanese', code: 'ja', flag: '🇯🇵' },
  { name: 'Chinese', code: 'zh', flag: '🇨🇳' },
  { name: 'Korean', code: 'ko', flag: '🇰🇷' },
  { name: 'Arabic', code: 'ar', flag: '🇸🇦' },
  { name: 'Russian', code: 'ru', flag: '🇷🇺' }
];

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showGoalSelection, setShowGoalSelection] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [sessionType, setSessionType] = useState('freeform');
  const [scenario, setScenario] = useState('');
  const [skillFocus, setSkillFocus] = useState('');
  const [persona, setPersona] = useState('patient_grandparent');
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState(true);

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setShowGoalSelection(true);
  };

  const handleStartSession = async () => {
    try {
      const response = await axios.post('/api/conversations', {
        language: selectedLanguage.name,
        languageCode: selectedLanguage.code,
        sessionType,
        scenario,
        skillFocus,
        persona,
        adaptiveDifficulty
      });

      navigate(`/chat/${response.data.conversation._id}`);
    } catch (error) {
      console.error('Start session error:', error);
      alert('Failed to start session. Please try again.');
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="user-info">
          <span className="avatar">{user?.avatar}</span>
          <div>
            <div className="username">{user?.username}</div>
            <div className="user-stats">
              Level {user?.level} • {user?.xp} XP • 🔥 {user?.streak} day streak
            </div>
          </div>
        </div>
        <nav className="nav-links">
          <button onClick={() => navigate('/profile')} className="nav-btn">Profile</button>
          <button onClick={() => navigate('/friends')} className="nav-btn">Friends</button>
          <button onClick={() => navigate('/history')} className="nav-btn">History</button>
          <button onClick={logout} className="nav-btn">Logout</button>
        </nav>
      </header>

      <div className="container">
        {!showGoalSelection ? (
          <>
            <h1>🌍 Choose a Language</h1>
            <p className="subtitle">Select a language to practice</p>

            <div className="language-grid">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  className="language-btn"
                  onClick={() => handleLanguageSelect(lang)}
                >
                  <span className="flag">{lang.flag}</span>
                  <span className="lang-name">{lang.name}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="goal-selection">
            <button onClick={() => setShowGoalSelection(false)} className="back-btn">
              ← Back
            </button>
            <h2>🎯 Customize Your Session</h2>

            <div className="section">
              <h3>Session Type</h3>
              <div className="options-grid">
                <label className="option-card">
                  <input
                    type="radio"
                    name="sessionType"
                    value="scenario"
                    checked={sessionType === 'scenario'}
                    onChange={(e) => setSessionType(e.target.value)}
                  />
                  <div className="option-content">
                    <span>🎭</span>
                    <span>Scenario Practice</span>
                  </div>
                </label>
                <label className="option-card">
                  <input
                    type="radio"
                    name="sessionType"
                    value="skill"
                    checked={sessionType === 'skill'}
                    onChange={(e) => setSessionType(e.target.value)}
                  />
                  <div className="option-content">
                    <span>💪</span>
                    <span>Skill Focus</span>
                  </div>
                </label>
                <label className="option-card">
                  <input
                    type="radio"
                    name="sessionType"
                    value="freeform"
                    checked={sessionType === 'freeform'}
                    onChange={(e) => setSessionType(e.target.value)}
                  />
                  <div className="option-content">
                    <span>💬</span>
                    <span>Free Conversation</span>
                  </div>
                </label>
              </div>
            </div>

            {sessionType === 'scenario' && (
              <div className="section">
                <h3>Choose Scenario</h3>
                <div className="options-grid">
                  {['job_interview', 'restaurant', 'travel', 'shopping', 'debate', 'doctor'].map(s => (
                    <label key={s} className="option-card small">
                      <input
                        type="radio"
                        name="scenario"
                        value={s}
                        checked={scenario === s}
                        onChange={(e) => setScenario(e.target.value)}
                      />
                      <div className="option-content">
                        <span>{s === 'job_interview' ? '💼' : s === 'restaurant' ? '🍽️' : s === 'travel' ? '✈️' : s === 'shopping' ? '🛍️' : s === 'debate' ? '🗣️' : '⚕️'}</span>
                        <span>{s.replace('_', ' ')}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {sessionType === 'skill' && (
              <div className="section">
                <h3>Choose Skill Focus</h3>
                <div className="options-grid">
                  {['past_tenses', 'future_tenses', 'conditionals', 'business_vocab', 'pronunciation', 'idioms'].map(skill => (
                    <label key={skill} className="option-card small">
                      <input
                        type="radio"
                        name="skill"
                        value={skill}
                        checked={skillFocus === skill}
                        onChange={(e) => setSkillFocus(e.target.value)}
                      />
                      <div className="option-content">
                        <span>{skill === 'past_tenses' ? '⏰' : skill === 'future_tenses' ? '🔮' : skill === 'conditionals' ? '❓' : skill === 'business_vocab' ? '📊' : skill === 'pronunciation' ? '🗨️' : '💡'}</span>
                        <span>{skill.replace('_', ' ')}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="section">
              <h3>AI Persona</h3>
              <div className="options-grid">
                {[
                  { value: 'patient_grandparent', label: 'Patient Grandparent', icon: '👵' },
                  { value: 'enthusiastic_friend', label: 'Enthusiastic Friend', icon: '😊' },
                  { value: 'formal_business', label: 'Business Partner', icon: '👔' },
                  { value: 'socratic_questioner', label: 'Socratic Questioner', icon: '🤔' }
                ].map(p => (
                  <label key={p.value} className="option-card small">
                    <input
                      type="radio"
                      name="persona"
                      value={p.value}
                      checked={persona === p.value}
                      onChange={(e) => setPersona(e.target.value)}
                    />
                    <div className="option-content">
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="section">
              <label className="switch-option">
                <input
                  type="checkbox"
                  checked={adaptiveDifficulty}
                  onChange={(e) => setAdaptiveDifficulty(e.target.checked)}
                />
                <span>Adaptive Difficulty</span>
              </label>
            </div>

            <button onClick={handleStartSession} className="btn btn-primary">
              Start Session 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

