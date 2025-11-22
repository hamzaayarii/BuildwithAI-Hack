const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  language: {
    type: String,
    required: true
  },
  languageCode: {
    type: String,
    required: true
  },
  sessionType: {
    type: String,
    enum: ['scenario', 'skill', 'freeform'],
    default: 'freeform'
  },
  scenario: {
    type: String,
    default: ''
  },
  skillFocus: {
    type: String,
    default: ''
  },
  persona: {
    type: String,
    default: 'patient_grandparent'
  },
  adaptiveDifficulty: {
    type: Boolean,
    default: true
  },
  currentDifficultyLevel: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  messages: [messageSchema],
  bilingualMode: {
    type: Boolean,
    default: false
  },
  audioMode: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'evaluated'],
    default: 'active'
  },
  startedAt: {
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
conversationSchema.index({ userId: 1, createdAt: -1 });
conversationSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);

