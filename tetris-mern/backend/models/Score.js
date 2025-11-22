const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  linesCleared: {
    type: Number,
    required: true
  },
  gameMode: {
    type: String,
    enum: ['single', 'multiplayer'],
    default: 'single'
  },
  gameDuration: {
    type: Number, // in seconds
    default: 0
  },
  piecesPlaced: {
    type: Number,
    default: 0
  },
  tetrises: {
    type: Number,
    default: 0
  },
  won: {
    type: Boolean,
    default: undefined // Only set for multiplayer games
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for leaderboards
scoreSchema.index({ score: -1, createdAt: -1 });
scoreSchema.index({ userId: 1, createdAt: -1 });
scoreSchema.index({ gameMode: 1, score: -1 });

module.exports = mongoose.model('Score', scoreSchema);

