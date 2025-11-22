const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Evaluation = require('../models/Evaluation');
const { protect } = require('../middleware/auth');

// Achievement definitions
const ACHIEVEMENTS = [
  {
    id: 'first_conversation',
    name: 'First Steps',
    desc: 'Complete your first conversation',
    icon: '👣',
    xpReward: 50
  },
  {
    id: 'five_conversations',
    name: 'Getting Started',
    desc: 'Complete 5 conversations',
    icon: '🌱',
    xpReward: 100
  },
  {
    id: 'streak_3',
    name: 'Committed Learner',
    desc: '3-day practice streak',
    icon: '🔥',
    xpReward: 100
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    desc: '7-day practice streak',
    icon: '⚡',
    xpReward: 200
  },
  {
    id: 'score_80',
    name: 'High Achiever',
    desc: 'Score 80+ on evaluation',
    icon: '🌟',
    xpReward: 150
  },
  {
    id: 'score_95',
    name: 'Near Perfect',
    desc: 'Score 95+ on evaluation',
    icon: '💎',
    xpReward: 300
  },
  {
    id: 'restaurant_master',
    name: 'Restaurant Master',
    desc: 'Complete restaurant scenario',
    icon: '🍽️',
    xpReward: 100
  },
  {
    id: 'job_interview_master',
    name: 'Interview Pro',
    desc: 'Complete job interview scenario',
    icon: '💼',
    xpReward: 100
  },
  {
    id: 'five_languages',
    name: 'Polyglot',
    desc: 'Practice 5 different languages',
    icon: '🌍',
    xpReward: 250
  },
  {
    id: 'level_5',
    name: 'Intermediate',
    desc: 'Reach level 5',
    icon: '🎓',
    xpReward: 500
  },
  {
    id: 'level_10',
    name: 'Advanced',
    desc: 'Reach level 10',
    icon: '🚀',
    xpReward: 1000
  }
];

// Check and unlock achievements
const checkAchievements = async (userId) => {
  const user = await User.findById(userId);
  const evaluations = await Evaluation.find({ userId });

  const checks = [
    {
      id: 'first_conversation',
      check: () => user.totalConversations >= 1
    },
    {
      id: 'five_conversations',
      check: () => user.totalConversations >= 5
    },
    {
      id: 'streak_3',
      check: () => user.streak >= 3
    },
    {
      id: 'streak_7',
      check: () => user.streak >= 7
    },
    {
      id: 'score_80',
      check: () => evaluations.some(e => e.overallScore >= 80)
    },
    {
      id: 'score_95',
      check: () => evaluations.some(e => e.overallScore >= 95)
    },
    {
      id: 'restaurant_master',
      check: () => evaluations.some(e => e.scenario === 'restaurant')
    },
    {
      id: 'job_interview_master',
      check: () => evaluations.some(e => e.scenario === 'job_interview')
    },
    {
      id: 'five_languages',
      check: () => {
        const languages = new Set(evaluations.map(e => e.language));
        return languages.size >= 5;
      }
    },
    {
      id: 'level_5',
      check: () => user.level >= 5
    },
    {
      id: 'level_10',
      check: () => user.level >= 10
    }
  ];

  const newlyUnlocked = [];

  for (const check of checks) {
    if (!user.achievements.includes(check.id) && check.check()) {
      user.achievements.push(check.id);
      const achievement = ACHIEVEMENTS.find(a => a.id === check.id);
      if (achievement) {
        user.xp += achievement.xpReward;
        newlyUnlocked.push(achievement);
      }
    }
  }

  if (newlyUnlocked.length > 0) {
    user.updateLevel();
    await user.save();
  }

  return newlyUnlocked;
};

// @route   GET /api/achievements
// @desc    Get all achievements
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const achievementsWithStatus = ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      unlocked: user.achievements.includes(achievement.id)
    }));

    res.json({
      success: true,
      achievements: achievementsWithStatus
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/achievements/check
// @desc    Check and unlock achievements (called after evaluation)
// @access  Private
router.post('/check', protect, async (req, res) => {
  try {
    const newlyUnlocked = await checkAchievements(req.user._id);

    res.json({
      success: true,
      newlyUnlocked,
      message: newlyUnlocked.length > 0 
        ? `Unlocked ${newlyUnlocked.length} achievement(s)!` 
        : 'No new achievements'
    });
  } catch (error) {
    console.error('Check achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
module.exports.checkAchievements = checkAchievements;

