const express = require('express');
const router = express.Router();
const Evaluation = require('../models/Evaluation');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const axios = require('axios');
const { checkAchievements } = require('./achievements');

// Calculate XP based on evaluation
const calculateXP = (evaluation, conversationLength) => {
  let xp = 50; // Base XP

  // Bonus for score
  if (evaluation.overallScore >= 95) {
    xp += 100;
  } else if (evaluation.overallScore >= 80) {
    xp += 50;
  } else if (evaluation.overallScore >= 60) {
    xp += 25;
  }

  // Bonus for conversation length
  if (conversationLength >= 20) {
    xp += 30;
  } else if (conversationLength >= 10) {
    xp += 15;
  }

  return xp;
};

// @route   POST /api/evaluations
// @desc    Create evaluation for a conversation
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { conversationId } = req.body;
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Groq API key not configured. Please set GROQ_API_KEY in backend .env file.'
      });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (conversation.messages.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Conversation must have at least 2 messages'
      });
    }

    // Call Python service for evaluation
    try {
      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8001';
      const response = await axios.post(`${pythonServiceUrl}/api/ai/evaluate`, {
        conversation: {
          language: conversation.language,
          languageCode: conversation.languageCode,
          sessionType: conversation.sessionType,
          scenario: conversation.scenario,
          skillFocus: conversation.skillFocus,
          persona: conversation.persona,
          messages: conversation.messages
        },
        apiKey
      });

      const evaluationData = response.data.evaluation;

      // Calculate XP
      const xpAwarded = calculateXP(evaluationData, conversation.messages.length);

      // Create evaluation
      const evaluation = await Evaluation.create({
        userId: req.user._id,
        conversationId: conversation._id,
        language: conversation.language,
        languageCode: conversation.languageCode,
        sessionType: conversation.sessionType,
        scenario: conversation.scenario,
        skillFocus: conversation.skillFocus,
        persona: conversation.persona,
        overallScore: evaluationData.overallScore,
        scoreExplanation: evaluationData.scoreExplanation,
        strengths: evaluationData.strengths,
        areasForImprovement: evaluationData.areasForImprovement,
        mistakes: evaluationData.mistakes || [],
        recommendations: evaluationData.recommendations,
        encouragement: evaluationData.encouragement,
        conversationLength: conversation.messages.length,
        xpAwarded
      });

      // Update conversation status
      conversation.status = 'evaluated';
      conversation.completedAt = new Date();
      await conversation.save();

      // Update user stats
      const user = await User.findById(req.user._id);
      user.xp += xpAwarded;
      const leveledUp = user.updateLevel();
      user.totalConversations += 1;
      user.updateStreak();

      // Update language stats
      const langIndex = user.languagesPracticed.findIndex(
        lang => lang.language === conversation.language
      );
      if (langIndex >= 0) {
        const lang = user.languagesPracticed[langIndex];
        lang.sessionsCount += 1;
        lang.averageScore = ((lang.averageScore * (lang.sessionsCount - 1)) + evaluationData.overallScore) / lang.sessionsCount;
        lang.lastPracticed = new Date();
      } else {
        user.languagesPracticed.push({
          language: conversation.language,
          languageCode: conversation.languageCode,
          sessionsCount: 1,
          averageScore: evaluationData.overallScore,
          lastPracticed: new Date()
        });
      }

      await user.save();

      // Check and unlock achievements
      const newlyUnlocked = await checkAchievements(req.user._id);

      res.status(201).json({
        success: true,
        evaluation,
        xpAwarded,
        leveledUp,
        newLevel: user.level,
        newlyUnlocked
      });
    } catch (error) {
      console.error('Python service error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate evaluation',
        error: error.response?.data?.message || error.message
      });
    }
  } catch (error) {
    console.error('Create evaluation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/evaluations
// @desc    Get user's evaluations
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { language, limit = 20, page = 1 } = req.query;
    const query = { userId: req.user._id };
    
    if (language) {
      query.language = language;
    }

    const evaluations = await Evaluation.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('conversationId', 'language sessionType scenario skillFocus');

    const total = await Evaluation.countDocuments(query);

    res.json({
      success: true,
      evaluations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get evaluations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/evaluations/:id
// @desc    Get a specific evaluation
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const evaluation = await Evaluation.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('conversationId');

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation not found'
      });
    }

    res.json({
      success: true,
      evaluation
    });
  } catch (error) {
    console.error('Get evaluation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/evaluations/stats/summary
// @desc    Get evaluation statistics
// @access  Private
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ userId: req.user._id });

    const stats = {
      total: evaluations.length,
      averageScore: evaluations.length > 0
        ? Math.round(evaluations.reduce((sum, e) => sum + e.overallScore, 0) / evaluations.length)
        : 0,
      languagesPracticed: [...new Set(evaluations.map(e => e.language))].length,
      totalXP: evaluations.reduce((sum, e) => sum + e.xpAwarded, 0),
      byLanguage: {}
    };

    // Group by language
    evaluations.forEach(eval => {
      if (!stats.byLanguage[eval.language]) {
        stats.byLanguage[eval.language] = {
          count: 0,
          averageScore: 0,
          totalScore: 0
        };
      }
      stats.byLanguage[eval.language].count += 1;
      stats.byLanguage[eval.language].totalScore += eval.overallScore;
      stats.byLanguage[eval.language].averageScore = Math.round(
        stats.byLanguage[eval.language].totalScore / stats.byLanguage[eval.language].count
      );
    });

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

