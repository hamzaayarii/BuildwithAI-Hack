const mongoose = require('mongoose');

const gameStateSchema = new mongoose.Schema({
  board: [[Number]], // 20x10 grid
  currentPiece: {
    type: {
      type: String,
      enum: ['I', 'O', 'T', 'S', 'Z', 'J', 'L']
    },
    x: Number,
    y: Number,
    rotation: Number
  },
  nextPieces: [String],
  score: Number,
  level: Number,
  linesCleared: Number,
  gameOver: Boolean
}, { _id: false });

const gameSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gameMode: {
    type: String,
    enum: ['single', 'multiplayer'],
    default: 'single'
  },
  roomId: {
    type: String // For multiplayer
  },
  gameState: gameStateSchema,
  status: {
    type: String,
    enum: ['active', 'paused', 'finished'],
    default: 'active'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  finishedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for active games
gameSchema.index({ userId: 1, status: 1 });
gameSchema.index({ roomId: 1 });

module.exports = mongoose.model('Game', gameSchema);

