const express = require('express');
const router = express.Router();
const Score = require('../models/Score');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   POST /api/scores
// @desc    Save a game score
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { score, level, linesCleared, gameMode, gameDuration, piecesPlaced, tetrises, won } = req.body;

    // Create score record
    const scoreRecord = await Score.create({
      userId: req.user._id,
      score,
      level,
      linesCleared,
      gameMode: gameMode || 'single',
      gameDuration,
      piecesPlaced,
      tetrises,
      won: gameMode === 'multiplayer' ? won : undefined
    });

    // Update user stats
    const user = await User.findById(req.user._id);
    if (score > user.highScore) {
      user.highScore = score;
    }
    if (level > user.highestLevel) {
      user.highestLevel = level;
    }
    user.totalLinesCleared += linesCleared;
    user.totalGamesPlayed += 1;
    
    // Update multiplayer stats
    if (gameMode === 'multiplayer') {
      if (won === true) {
        user.multiplayerWins = (user.multiplayerWins || 0) + 1;
      } else if (won === false) {
        user.multiplayerLosses = (user.multiplayerLosses || 0) + 1;
      }
    }
    
    await user.save();

    res.status(201).json({
      success: true,
      score: scoreRecord,
      userStats: {
        highScore: user.highScore,
        highestLevel: user.highestLevel,
        totalGamesPlayed: user.totalGamesPlayed,
        totalLinesCleared: user.totalLinesCleared
      }
    });
  } catch (error) {
    console.error('Save score error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/scores/leaderboard
// @desc    Get leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { mode = 'single', limit = 50 } = req.query;

    const scores = await Score.find({ gameMode: mode })
      .sort({ score: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'username avatar')
      .select('score level linesCleared gameDuration createdAt userId');

    res.json({
      success: true,
      leaderboard: scores
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/scores/user/:userId
// @desc    Get user's score history
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;

    const scores = await Score.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Score.countDocuments({ userId: req.params.userId });

    res.json({
      success: true,
      scores,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get user scores error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/scores/personal-best
// @desc    Get current user's personal best
// @access  Private
router.get('/personal-best', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const bestScore = await Score.findOne({ userId: req.user._id })
      .sort({ score: -1 });

    res.json({
      success: true,
      highScore: user.highScore,
      highestLevel: user.highestLevel,
      totalGamesPlayed: user.totalGamesPlayed,
      totalLinesCleared: user.totalLinesCleared,
      bestScore: bestScore
    });
  } catch (error) {
    console.error('Get personal best error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

