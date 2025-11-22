import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ChatWindow, { Message } from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import { uploadDocument, askQuestion } from './services/api';
import { FileText, AlertCircle } from 'lucide-react';
import './index.css';

function App() {
  const [sessionId, setSessionId] = useState<string>('');
  const [filename, setFilename] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError('');

    try {
      const response = await uploadDocument(file);
      setSessionId(response.session_id);
      setFilename(response.filename);
      setMessages([
        {
          role: 'system',
          content: `✅ Document uploaded: ${response.filename}\n📄 ${response.total_chunks} chunks created\n📊 ${response.document_length} characters processed\n\nYou can now ask questions about this document!`,
        },
      ]);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload document');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async (question: string) => {
    if (!sessionId) return;

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setLoading(true);
    setError('');

    try {
      const response = await askQuestion(question, sessionId);

      // Add assistant message with sources
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.answer,
          sources: response.sources,
        },
      ]);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to get answer');
      console.error('Chat error:', err);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '❌ Sorry, I encountered an error processing your question. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <FileText className="w-10 h-10 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-800">Ask Your Document</h1>
            </div>
            <p className="text-gray-600">
              Upload a document and chat with it using AI-powered RAG
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            {/* Upload Section */}
            {!sessionId && (
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  Upload Your Document
                </h2>
                <FileUpload onUpload={handleUpload} loading={loading} disabled={loading} />
              </div>
            )}

            {/* Document Info */}
            {sessionId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Current Document:</span> {filename}
                </p>
                <button
                  onClick={() => {
                    setSessionId('');
                    setFilename('');
                    setMessages([]);
                  }}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Upload a different document
                </button>
              </div>
            )}

            {/* Chat Section */}
            {sessionId && (
              <>
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Chat with Your Document
                  </h2>
                  <ChatWindow messages={messages} />
                </div>

                <ChatInput
                  onSend={handleAsk}
                  disabled={!sessionId}
                  loading={loading}
                />
              </>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>Powered by Weaviate, OpenAI, FastAPI & React</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
