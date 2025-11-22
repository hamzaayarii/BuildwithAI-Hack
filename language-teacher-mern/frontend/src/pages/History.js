import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './History.css';

const History = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
    fetchStats();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/history');
      setEvaluations(response.data.evaluations);
    } catch (error) {
      console.error('Fetch history error:', error);
    } finally {
      setLoading(false);
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="history-page">
      <div className="container">
        <h1>📈 Performance History</h1>

        {stats && (
          <div className="stats-overview">
            <div className="stat-card">
              <div className="stat-number">{stats.totalSessions}</div>
              <div className="stat-label">Total Sessions</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.averageScore}</div>
              <div className="stat-label">Average Score</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.languagesPracticed.length}</div>
              <div className="stat-label">Languages Practiced</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalXP}</div>
              <div className="stat-label">Total XP Earned</div>
            </div>
          </div>
        )}

        <div className="evaluations-list">
          <h2>Recent Sessions</h2>
          {evaluations.length === 0 ? (
            <p>No evaluation history yet. Complete conversations and request evaluations to see your progress here!</p>
          ) : (
            evaluations.map(evaluation => (
              <div key={evaluation._id} className="evaluation-card">
                <div className="evaluation-header">
                  <div>
                    <div className="evaluation-language">{evaluation.language}</div>
                    <div className="evaluation-date">
                      {new Date(evaluation.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div
                    className="evaluation-score"
                    style={{
                      color:
                        evaluation.overallScore >= 80
                          ? 'var(--success)'
                          : evaluation.overallScore >= 60
                          ? 'var(--warning)'
                          : 'var(--error)'
                    }}
                  >
                    {evaluation.overallScore}/100
                  </div>
                </div>
                <div className="evaluation-summary">{evaluation.scoreExplanation}</div>
                <div className="evaluation-details">
                  <div>
                    <strong>Strengths:</strong>
                    <ul>
                      {evaluation.strengths?.slice(0, 3).map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Areas for Improvement:</strong>
                    <ul>
                      {evaluation.areasForImprovement?.slice(0, 3).map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default History;

