const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const { protect } = require('../middleware/auth');

// @route   POST /api/games
// @desc    Create a new game
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { gameMode, roomId } = req.body;

    const game = await Game.create({
      userId: req.user._id,
      gameMode: gameMode || 'single',
      roomId: roomId || null,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      game
    });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/games/:id/state
// @desc    Update game state
// @access  Private
router.put('/:id/state', protect, async (req, res) => {
  try {
    const { gameState } = req.body;

    const game = await Game.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    game.gameState = gameState;
    if (gameState.gameOver) {
      game.status = 'finished';
      game.finishedAt = new Date();
    }
    await game.save();

    res.json({
      success: true,
      game
    });
  } catch (error) {
    console.error('Update game state error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/games/:id
// @desc    Get game by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const game = await Game.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    res.json({
      success: true,
      game
    });
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

