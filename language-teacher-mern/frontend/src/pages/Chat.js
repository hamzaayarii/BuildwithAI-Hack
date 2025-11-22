import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './Chat.css';

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [conversation, setConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [bilingualMode, setBilingualMode] = useState(false);
  const [audioMode, setAudioMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [helperMessages, setHelperMessages] = useState([]);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);
  const lastUserMessageRef = useRef('');

  useEffect(() => {
    if (conversationId) {
      fetchConversation();
    }
    
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      try {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
      } catch (error) {
        console.error('Failed to initialize speech recognition:', error);
      }
    }
    
    // Initialize speech synthesis
    synthesisRef.current = window.speechSynthesis;
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, [conversationId]);

  const fetchConversation = async () => {
    try {
      const response = await axios.get(`/api/conversations/${conversationId}`);
      setConversation(response.data.conversation);
    } catch (error) {
      console.error('Fetch conversation error:', error);
    }
  };

  const speakText = (text, language) => {
    if (!audioMode || !synthesisRef.current) return;

    synthesisRef.current.cancel();

    const langMap = {
      'Spanish': 'es-ES',
      'French': 'fr-FR',
      'German': 'de-DE',
      'Italian': 'it-IT',
      'Portuguese': 'pt-PT',
      'Japanese': 'ja-JP',
      'Chinese': 'zh-CN',
      'Korean': 'ko-KR',
      'Arabic': 'ar-SA',
      'Russian': 'ru-RU'
    };

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langMap[language] || 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    synthesisRef.current.speak(utterance);
  };

  const startListening = () => {
    if (!recognitionRef.current || isListening || loading) return;

    setIsListening(true);

    const langMap = {
      'Spanish': 'es-ES',
      'French': 'fr-FR',
      'German': 'de-DE',
      'Italian': 'it-IT',
      'Portuguese': 'pt-PT',
      'Japanese': 'ja-JP',
      'Chinese': 'zh-CN',
      'Korean': 'ko-KR',
      'Arabic': 'ar-SA',
      'Russian': 'ru-RU'
    };

    recognitionRef.current.lang = langMap[conversation?.language] || 'en-US';

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        showHelperMessage('No speech detected. Please try again.', 'error');
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setIsListening(false);
      if (error.name === 'InvalidStateError') {
        // Recognition already started, reset state
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current || !isListening) return;

    setIsListening(false);

    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.error('Error stopping recognition:', e);
    }
  };

  const showHelperMessage = (text, type = 'info') => {
    const helperMsg = { id: Date.now(), text, type };
    setHelperMessages(prev => [...prev, helperMsg]);
    setTimeout(() => {
      setHelperMessages(prev => prev.filter(msg => msg.id !== helperMsg.id));
    }, 5000);
  };

  const handleLifelineCommand = async (command, phrase = '') => {
    setLoading(true);
    try {
      const response = await axios.post(`/api/conversations/${conversationId}/lifeline`, {
        command,
        phrase,
        language: conversation.language,
        languageCode: conversation.languageCode,
        sessionType: conversation.sessionType,
        scenario: conversation.scenario,
        skillFocus: conversation.skillFocus,
        recentMessages: conversation.messages.slice(-3),
        lastUserMessage: lastUserMessageRef.current
      });

      showHelperMessage(response.data.response, 'helper');
    } catch (error) {
      console.error('Lifeline command error:', error);
      showHelperMessage('Failed to process command. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for lifeline commands
    if (lowerMessage === '/evaluate') {
      handleEvaluate();
      setMessage('');
      return;
    }

    if (lowerMessage === '/hint') {
      handleLifelineCommand('hint');
      setMessage('');
      return;
    }

    if (lowerMessage === '/explain') {
      handleLifelineCommand('explain');
      setMessage('');
      return;
    }

    if (lowerMessage.startsWith('/translate ')) {
      const phrase = userMessage.substring(11).trim();
      if (phrase) {
        handleLifelineCommand('translate', phrase);
      } else {
        showHelperMessage('Please provide a word or phrase to translate. Example: /translate hello');
      }
      setMessage('');
      return;
    }

    // Store last user message for /explain command
    lastUserMessageRef.current = userMessage;
    setMessage('');
    setLoading(true);

    try {
      // Add user message
      await axios.post(`/api/conversations/${conversationId}/messages`, {
        role: 'user',
        content: userMessage
      });

      // Get AI response
      const response = await axios.post(`/api/conversations/${conversationId}/ai-response`, {
        userMessage,
        bilingualMode
      });

      setConversation(response.data.conversation);
      
      // Speak the response in audio mode
      if (audioMode && response.data.response) {
        let textToSpeak = response.data.response;
        if (bilingualMode) {
          const match = textToSpeak.match(/(.*?)\[EN:/s);
          if (match) {
            textToSpeak = match[1].trim();
          }
        }
        speakText(textToSpeak, conversation.language);
      }
    } catch (error) {
      console.error('Send message error:', error);
      showHelperMessage('Failed to send message. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!conversation || conversation.messages.length < 2) {
      alert('Please have a conversation first before requesting an evaluation.');
      return;
    }

    try {
      const response = await axios.post('/api/evaluations', {
        conversationId
      });

      // Check achievements
      await axios.post('/api/achievements/check');

      navigate('/history');
    } catch (error) {
      console.error('Evaluate error:', error);
      alert('Failed to generate evaluation. Please try again.');
    }
  };

  if (!conversation) {
    return <div>Loading...</div>;
  }

  return (
    <div className="chat-container">
      <header className="chat-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          ← Back
        </button>
        <h2>{conversation.language}</h2>
        <div className="chat-controls">
          <label className="switch">
            <input
              type="checkbox"
              checked={audioMode}
              onChange={(e) => {
                setAudioMode(e.target.checked);
                if (!e.target.checked) {
                  stopListening();
                  if (synthesisRef.current) {
                    synthesisRef.current.cancel();
                  }
                }
              }}
            />
            <span className="slider"></span>
          </label>
          <span>🎤 Audio</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={bilingualMode}
              onChange={(e) => setBilingualMode(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
          <span>🌐 Bilingual</span>
          <button onClick={handleEvaluate} className="btn btn-primary">
            📊 Evaluate
          </button>
        </div>
      </header>

      <div className="chat-messages">
        {helperMessages.map(helper => (
          <div key={helper.id} className={`message helper ${helper.type}`}>
            <div className="message-content">
              {helper.type === 'helper' && '💡 '}
              {helper.type === 'error' && '⚠️ '}
              {helper.text}
            </div>
          </div>
        ))}
        {conversation.messages.map((msg, index) => {
          let mainText = msg.content;
          let translation = '';
          
          if (bilingualMode && msg.role === 'assistant') {
            const match = msg.content.match(/(.*?)\[EN:\s*(.*?)\]$/s);
            if (match) {
              mainText = match[1].trim();
              translation = match[2].trim();
            }
          }
          
          return (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-content">{mainText}</div>
              {translation && (
                <div className="bilingual-text">💬 {translation}</div>
              )}
            </div>
          );
        })}
        {loading && (
          <div className="message assistant">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input">
        {audioMode && (
          <button
            className={`mic-btn ${isListening ? 'recording' : ''}`}
            onMouseDown={startListening}
            onMouseUp={stopListening}
            onTouchStart={(e) => {
              e.preventDefault();
              startListening();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              stopListening();
            }}
            title="Hold to speak"
          >
            🎤
          </button>
        )}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={audioMode ? "Hold microphone button to speak or type here... (Try /hint, /translate, or /explain)" : "Type your message here... (Try /hint, /translate, or /explain)"}
          rows="1"
          className="input"
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || !message.trim()}
          className="btn btn-primary"
        >
          Send
        </button>
        <button
          onClick={() => showHelperMessage(`💡 Lifeline Commands:\n\n/hint - Get vocabulary or grammar hints\n/translate [word] - Quick translation\n/explain - Grammar explanation for your last message\n/evaluate - End conversation and get feedback`, 'helper')}
          className="help-btn"
          title="Show lifeline commands"
        >
          ❓
        </button>
      </div>
    </div>
  );
};

export default Chat;

