const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Evaluation = require('../models/Evaluation');
const { protect } = require('../middleware/auth');

// @route   POST /api/friends/request
// @desc    Send friend request
// @access  Private
router.post('/request', protect, async (req, res) => {
  try {
    const { userId } = req.body;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send friend request to yourself'
      });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already friends
    if (req.user.friends.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Already friends'
      });
    }

    // Check if request already exists
    const existingRequest = targetUser.friendRequests.find(
      req => req.from.toString() === req.user._id.toString() && req.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Friend request already sent'
      });
    }

    // Add friend request
    targetUser.friendRequests.push({
      from: req.user._id,
      status: 'pending'
    });
    await targetUser.save();

    res.json({
      success: true,
      message: 'Friend request sent'
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/friends/requests
// @desc    Get friend requests
// @access  Private
router.get('/requests', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friendRequests.from', 'username avatar level xp streak');

    const requests = user.friendRequests
      .filter(req => req.status === 'pending')
      .map(req => ({
        id: req._id,
        from: req.from,
        createdAt: req.createdAt
      }));

    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/friends/requests/:requestId
// @desc    Accept or reject friend request
// @access  Private
router.put('/requests/:requestId', protect, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be accept or reject'
      });
    }

    const user = await User.findById(req.user._id);
    const request = user.friendRequests.id(requestId);

    if (!request || request.status !== 'pending') {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }

    if (action === 'accept') {
      // Add to friends list for both users
      if (!user.friends.includes(request.from)) {
        user.friends.push(request.from);
      }

      const friend = await User.findById(request.from);
      if (!friend.friends.includes(user._id)) {
        friend.friends.push(user._id);
      }

      // Remove request from both users
      user.friendRequests.id(requestId).status = 'accepted';
      friend.friendRequests.forEach(req => {
        if (req.from.toString() === user._id.toString() && req.status === 'pending') {
          req.status = 'accepted';
        }
      });

      await friend.save();
    } else {
      // Reject
      user.friendRequests.id(requestId).status = 'rejected';
    }

    await user.save();

    res.json({
      success: true,
      message: `Friend request ${action}ed`
    });
  } catch (error) {
    console.error('Handle friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/friends
// @desc    Get user's friends
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'username avatar level xp streak achievements totalConversations languagesPracticed');

    res.json({
      success: true,
      friends: user.friends
    });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/friends/:friendId/profile
// @desc    Get friend's profile with achievements and stats
// @access  Private
router.get('/:friendId/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.friends.includes(req.params.friendId)) {
      return res.status(403).json({
        success: false,
        message: 'Not friends with this user'
      });
    }

    const friend = await User.findById(req.params.friendId)
      .select('username avatar level xp streak achievements totalConversations languagesPracticed createdAt');

    // Get friend's recent evaluations
    const recentEvaluations = await Evaluation.find({ userId: req.params.friendId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('language overallScore createdAt');

    // Get friend's stats
    const allEvaluations = await Evaluation.find({ userId: req.params.friendId });
    const stats = {
      totalSessions: allEvaluations.length,
      averageScore: allEvaluations.length > 0
        ? Math.round(allEvaluations.reduce((sum, e) => sum + e.overallScore, 0) / allEvaluations.length)
        : 0,
      languagesPracticed: [...new Set(allEvaluations.map(e => e.language))].length,
      totalXP: allEvaluations.reduce((sum, e) => sum + e.xpAwarded, 0)
    };

    res.json({
      success: true,
      friend: {
        ...friend.toObject(),
        recentEvaluations,
        stats
      }
    });
  } catch (error) {
    console.error('Get friend profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/friends/:friendId
// @desc    Remove friend
// @access  Private
router.delete('/:friendId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const friend = await User.findById(req.params.friendId);

    if (!friend) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove from both friends lists
    user.friends = user.friends.filter(
      friendId => friendId.toString() !== req.params.friendId
    );
    friend.friends = friend.friends.filter(
      friendId => friendId.toString() !== user._id.toString()
    );

    await user.save();
    await friend.save();

    res.json({
      success: true,
      message: 'Friend removed'
    });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

