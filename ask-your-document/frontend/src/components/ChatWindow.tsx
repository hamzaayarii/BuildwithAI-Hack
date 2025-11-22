import React from 'react';
import { User, Bot, FileText } from 'lucide-react';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: Array<{
    chunk_index: number;
    content: string;
  }>;
}

interface ChatWindowProps {
  messages: Message[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  return (
    <div className="h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Upload a document to start asking questions</p>
          </div>
        </div>
      ) : (
        messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex gap-3 max-w-[80%] ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.role === 'user'
                    ? 'bg-blue-500'
                    : msg.role === 'system'
                    ? 'bg-green-500'
                    : 'bg-gray-700'
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
                className={`px-4 py-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : msg.role === 'system'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                {/* Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Sources:</p>
                    <div className="space-y-2">
                      {msg.sources.map((source, idx) => (
                        <details key={idx} className="text-xs">
                          <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                            Chunk {source.chunk_index + 1}
                          </summary>
                          <p className="mt-1 pl-3 text-gray-500 italic">
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
        ))
      )}
    </div>
  );
};

export default ChatWindow;
