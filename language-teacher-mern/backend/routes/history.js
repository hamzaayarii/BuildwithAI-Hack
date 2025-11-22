const express = require('express');
const router = express.Router();
const Evaluation = require('../models/Evaluation');
const Conversation = require('../models/Conversation');
const { protect } = require('../middleware/auth');

// @route   GET /api/history
// @desc    Get user's performance history
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
      .populate('conversationId', 'sessionType scenario skillFocus');

    const total = await Evaluation.countDocuments(query);

    // Calculate statistics
    const allEvaluations = await Evaluation.find({ userId: req.user._id });
    const avgScore = allEvaluations.length > 0
      ? Math.round(allEvaluations.reduce((sum, e) => sum + e.overallScore, 0) / allEvaluations.length)
      : 0;

    const languageCounts = {};
    allEvaluations.forEach(eval => {
      languageCounts[eval.language] = (languageCounts[eval.language] || 0) + 1;
    });

    res.json({
      success: true,
      evaluations,
      statistics: {
        totalSessions: allEvaluations.length,
        averageScore: avgScore,
        languagesPracticed: Object.keys(languageCounts).length,
        languageCounts
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/history/stats
// @desc    Get detailed statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ userId: req.user._id });
    const conversations = await Conversation.find({ userId: req.user._id });

    const stats = {
      totalSessions: evaluations.length,
      totalConversations: conversations.length,
      averageScore: evaluations.length > 0
        ? Math.round(evaluations.reduce((sum, e) => sum + e.overallScore, 0) / evaluations.length)
        : 0,
      languagesPracticed: [...new Set(evaluations.map(e => e.language))],
      totalXP: evaluations.reduce((sum, e) => sum + e.xpAwarded, 0),
      byLanguage: {},
      bySessionType: {},
      scoreDistribution: {
        excellent: 0, // 90-100
        good: 0,      // 70-89
        fair: 0,      // 50-69
        poor: 0       // 0-49
      }
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

    // Group by session type
    evaluations.forEach(eval => {
      const type = eval.sessionType || 'freeform';
      if (!stats.bySessionType[type]) {
        stats.bySessionType[type] = {
          count: 0,
          averageScore: 0,
          totalScore: 0
        };
      }
      stats.bySessionType[type].count += 1;
      stats.bySessionType[type].totalScore += eval.overallScore;
      stats.bySessionType[type].averageScore = Math.round(
        stats.bySessionType[type].totalScore / stats.bySessionType[type].count
      );
    });

    // Score distribution
    evaluations.forEach(eval => {
      if (eval.overallScore >= 90) {
        stats.scoreDistribution.excellent += 1;
      } else if (eval.overallScore >= 70) {
        stats.scoreDistribution.good += 1;
      } else if (eval.overallScore >= 50) {
        stats.scoreDistribution.fair += 1;
      } else {
        stats.scoreDistribution.poor += 1;
      }
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

