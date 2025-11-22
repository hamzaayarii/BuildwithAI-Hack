const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const { protect } = require('../middleware/auth');
const axios = require('axios');

// @route   POST /api/conversations
// @desc    Create a new conversation
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      language,
      languageCode,
      sessionType,
      scenario,
      skillFocus,
      persona,
      adaptiveDifficulty
    } = req.body;

    const conversation = await Conversation.create({
      userId: req.user._id,
      language,
      languageCode,
      sessionType: sessionType || 'freeform',
      scenario: scenario || '',
      skillFocus: skillFocus || '',
      persona: persona || 'patient_grandparent',
      adaptiveDifficulty: adaptiveDifficulty !== undefined ? adaptiveDifficulty : true
    });

    res.status(201).json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/conversations
// @desc    Get user's conversations
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const query = { userId: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const conversations = await Conversation.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Conversation.countDocuments(query);

    res.json({
      success: true,
      conversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/conversations/:id
// @desc    Get a specific conversation
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/conversations/:id/messages
// @desc    Add a message to conversation
// @access  Private
router.post('/:id/messages', protect, async (req, res) => {
  try {
    const { role, content } = req.body;
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    conversation.messages.push({ role, content });
    await conversation.save();

    res.json({
      success: true,
      message: conversation.messages[conversation.messages.length - 1]
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/conversations/:id/ai-response
// @desc    Get AI response for conversation
// @access  Private
router.post('/:id/ai-response', protect, async (req, res) => {
  try {
    const { userMessage } = req.body;
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Groq API key not configured. Please set GROQ_API_KEY in backend .env file.'
      });
    }

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Add user message
    conversation.messages.push({ role: 'user', content: userMessage });
    await conversation.save();

      // Update bilingual mode if provided
      if (req.body.bilingualMode !== undefined) {
        conversation.bilingualMode = req.body.bilingualMode;
        await conversation.save();
      }

      // Call Python service for AI response
      try {
        const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8001';
        const response = await axios.post(`${pythonServiceUrl}/api/ai/chat`, {
          conversation: {
            language: conversation.language,
            languageCode: conversation.languageCode,
            sessionType: conversation.sessionType,
            scenario: conversation.scenario,
            skillFocus: conversation.skillFocus,
            persona: conversation.persona,
            adaptiveDifficulty: conversation.adaptiveDifficulty,
            currentDifficultyLevel: conversation.currentDifficultyLevel,
            bilingualMode: conversation.bilingualMode,
            messages: conversation.messages.slice(-10) // Last 10 messages for context
          },
          apiKey
        });

      const aiResponse = response.data.response;

      // Add AI response
      conversation.messages.push({ role: 'assistant', content: aiResponse });
      await conversation.save();

      res.json({
        success: true,
        response: aiResponse,
        conversation
      });
    } catch (error) {
      console.error('Python service error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get AI response',
        error: error.response?.data?.message || error.message
      });
    }
  } catch (error) {
    console.error('AI response error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/conversations/:id/lifeline
// @desc    Handle lifeline commands (hint, translate, explain)
// @access  Private
router.post('/:id/lifeline', protect, async (req, res) => {
  try {
    const { command, phrase, language, languageCode, sessionType, scenario, skillFocus, recentMessages, lastUserMessage } = req.body;
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Groq API key not configured. Please set GROQ_API_KEY in backend .env file.'
      });
    }

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Call Python service for lifeline command
    try {
      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8001';
      const response = await axios.post(`${pythonServiceUrl}/api/ai/lifeline`, {
        command,
        phrase,
        language: language || conversation.language,
        languageCode: languageCode || conversation.languageCode,
        sessionType: sessionType || conversation.sessionType,
        scenario: scenario || conversation.scenario,
        skillFocus: skillFocus || conversation.skillFocus,
        recentMessages: recentMessages || conversation.messages.slice(-3),
        lastUserMessage
      }, {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      res.json({
        success: true,
        response: response.data.response
      });
    } catch (error) {
      console.error('Python service error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process lifeline command',
        error: error.response?.data?.message || error.message
      });
    }
  } catch (error) {
    console.error('Lifeline command error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/conversations/:id/complete
// @desc    Mark conversation as completed
// @access  Private
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    conversation.status = 'completed';
    conversation.completedAt = new Date();
    await conversation.save();

    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Complete conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

