const mongoose = require('mongoose');

const mistakeSchema = new mongoose.Schema({
  original: String,
  correction: String,
  explanation: String
});

const evaluationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
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
  overallScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  scoreExplanation: {
    type: String,
    required: true
  },
  strengths: [{
    type: String
  }],
  areasForImprovement: [{
    type: String
  }],
  mistakes: [mistakeSchema],
  recommendations: {
    type: String,
    required: true
  },
  encouragement: {
    type: String,
    required: true
  },
  conversationLength: {
    type: Number,
    default: 0
  },
  xpAwarded: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
evaluationSchema.index({ userId: 1, createdAt: -1 });
evaluationSchema.index({ userId: 1, language: 1 });
evaluationSchema.index({ userId: 1, overallScore: -1 });

module.exports = mongoose.model('Evaluation', evaluationSchema);

