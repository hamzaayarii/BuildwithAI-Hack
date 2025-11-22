import React, { useEffect, useRef } from 'react';
import { User, Bot, FileText, Sparkles, TrendingUp, Target } from 'lucide-react';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: Array<{
    chunk_index: number;
    content: string;
    confidence?: number;
    similarity_score?: number;
  }>;
  confidence_score?: number;
  source_coverage?: number;
}

interface ChatWindowProps {
  messages: Message[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-[500px] overflow-y-auto rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 space-y-4 custom-scrollbar">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-indigo-500" />
            </div>
            <p className="text-lg font-semibold text-gray-600 mb-2">Ready to Chat!</p>
            <p className="text-sm text-gray-500">Ask questions about your documents or just say hi 👋</p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`flex gap-3 max-w-[85%] ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                      : msg.role === 'system'
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : msg.role === 'system' ? (
                    <FileText className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`px-5 py-3 rounded-2xl shadow-md ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : msg.role === 'system'
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-2 border-green-200'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                  {/* Confidence Metrics */}
                  {msg.role === 'assistant' && msg.confidence_score !== undefined && msg.source_coverage !== undefined && (
                    <div className="mt-3 flex gap-3 text-xs">
                      <div className="flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full">
                        <TrendingUp className="w-3 h-3 text-blue-600" />
                        <span className="text-blue-700 font-medium">
                          {msg.confidence_score}% Match
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-purple-50 px-3 py-1.5 rounded-full">
                        <Target className="w-3 h-3 text-purple-600" />
                        <span className="text-purple-700 font-medium">
                          {msg.source_coverage}% Grounded
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Sources ({msg.sources.length}):
                      </p>
                      <div className="space-y-2">
                        {msg.sources.map((source, idx) => (
                          <details key={idx} className="text-xs bg-gray-50 rounded-lg p-2">
                            <summary className="cursor-pointer text-indigo-600 hover:text-indigo-800 font-medium flex items-center justify-between">
                              <span>📄 Chunk {source.chunk_index + 1}</span>
                              {source.confidence !== undefined && (
                                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full ml-2">
                                  {source.confidence}% similar
                                </span>
                              )}
                            </summary>
                            <p className="mt-2 pl-3 text-gray-600 italic border-l-2 border-indigo-200">
                              "{source.content}"
                            </p>
                          </details>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default ChatWindow;
