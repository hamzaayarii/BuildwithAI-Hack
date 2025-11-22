import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSend: (question: string) => void;
  disabled: boolean;
  loading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled, loading }) => {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !disabled && !loading) {
      onSend(question.trim());
      setQuestion('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="flex-1 relative">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question or just say hi... 💬"
          disabled={disabled || loading}
          className="w-full border-2 border-gray-300 rounded-xl px-5 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-300 text-gray-800 placeholder-gray-400"
        />
        <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>
      <button
        type="submit"
        disabled={disabled || loading || !question.trim()}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="hidden sm:inline">Thinking...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span className="hidden sm:inline">Send</span>
          </>
        )}
      </button>
    </form>
  );
};

export default ChatInput;
