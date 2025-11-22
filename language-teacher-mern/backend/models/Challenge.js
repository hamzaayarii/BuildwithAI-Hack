const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  opponent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['scenario', 'skill', 'freeform'],
    required: true
  },
  targetScore: {
    type: Number,
    min: 50,
    max: 100,
    default: 80
  },
  creatorScore: {
    type: Number,
    min: 0,
    max: 100
  },
  opponentScore: {
    type: Number,
    min: 0,
    max: 100
  },
  creatorEvaluation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evaluation'
  },
  opponentEvaluation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evaluation'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
challengeSchema.index({ code: 1 });
challengeSchema.index({ creator: 1, status: 1 });
challengeSchema.index({ opponent: 1, status: 1 });

module.exports = mongoose.model('Challenge', challengeSchema);

