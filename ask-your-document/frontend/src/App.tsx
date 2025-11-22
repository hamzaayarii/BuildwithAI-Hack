import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import FileManager from './components/FileManager';
import ChatWindow, { Message } from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import MetricsInfo from './components/MetricsInfo';
import ConceptGraph from './components/ConceptGraph';
import { uploadDocument, askQuestion, getSessionFiles, deleteFile, deleteSession, FileInfo } from './services/api';
import { FileText, AlertCircle, Trash2, Plus, MessageCircle, FolderOpen, Sparkles, Network } from 'lucide-react';
import './index.css';

function App() {
  const [sessionId, setSessionId] = useState<string>('');
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showUpload, setShowUpload] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [lastQuestion, setLastQuestion] = useState<string>('');

  // Load files when session exists
  useEffect(() => {
    if (sessionId) {
      loadFiles();
    }
  }, [sessionId]);

  const loadFiles = async () => {
    try {
      const response = await getSessionFiles(sessionId);
      setFiles(response.files);
    } catch (err) {
      console.error('Error loading files:', err);
    }
  };

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError('');

    try {
      const response = await uploadDocument(file, sessionId || undefined);
      
      // Set or keep session ID
      if (!sessionId) {
        setSessionId(response.session_id);
        setMessages([
          {
            role: 'system',
            content: `👋 Welcome! I'm your AI document assistant.\n\n✅ Successfully uploaded: ${response.filename}\n📊 Processed ${response.total_chunks} chunks\n\nI can help you:\n• Answer questions about your documents\n• Summarize content\n• Find specific information\n• Chat naturally in English, French, Arabic, and more!\n\nFeel free to ask me anything or just say hi! 💬`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'system',
            content: `✅ Added new document: ${response.filename}\n📊 ${response.total_chunks} chunks processed\n\nYou can now ask questions across all your uploaded documents!`,
          },
        ]);
      }

      // Reload files list
      await loadFiles();
      setShowUpload(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload document');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async (question: string) => {
    if (!sessionId) return;

    // Store last question for graph animation
    setLastQuestion(question);

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setLoading(true);
    setError('');

    try {
      const response = await askQuestion(question, sessionId);

      // Add assistant message with sources and metrics
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.answer,
          sources: response.sources,
          confidence_score: response.confidence_score,
          source_coverage: response.source_coverage,
        },
      ]);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to get answer');
      console.error('Chat error:', err);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '❌ Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (conceptLabel: string) => {
    // Auto-fill question based on clicked concept
    const question = `Tell me about ${conceptLabel}`;
    handleAsk(question);
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await deleteFile(fileId);
      await loadFiles();
      setMessages((prev) => [
        ...prev,
        {
          role: 'system',
          content: '🗑️ File deleted successfully',
        },
      ]);
    } catch (err: any) {
      setError('Failed to delete file');
      console.error('Delete error:', err);
    }
  };

  const handleNewSession = async () => {
    if (sessionId && !confirm('Start a new session? This will clear all current documents.')) {
      return;
    }

    try {
      if (sessionId) {
        await deleteSession(sessionId);
      }
      setSessionId('');
      setFiles([]);
      setMessages([]);
      setShowUpload(false);
    } catch (err) {
      console.error('Error clearing session:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Ask Your Documents
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              AI-powered document chat • Multiple files • 100+ languages 🌍
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                Smart RAG
              </span>
              <span>•</span>
              <span>.txt, .pdf, .docx</span>
              <span>•</span>
              <span>Powered by Cohere</span>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar - File Management */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-indigo-500" />
                    Documents
                  </h2>
                  {sessionId && (
                    <button
                      onClick={handleNewSession}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Clear all and start new"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {!sessionId || showUpload ? (
                  <div>
                    <FileUpload 
                      onUpload={handleUpload} 
                      loading={loading} 
                      disabled={loading}
                      hasSession={!!sessionId}
                    />
                    {sessionId && (
                      <button
                        onClick={() => setShowUpload(false)}
                        className="mt-3 w-full text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <FileManager 
                      files={files} 
                      onDelete={handleDeleteFile} 
                      loading={loading}
                    />
                    <button
                      onClick={() => setShowUpload(true)}
                      className="mt-4 w-full bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 px-4 py-3 rounded-xl hover:from-indigo-100 hover:to-purple-100 transition-all duration-300 font-semibold flex items-center justify-center gap-2 border-2 border-indigo-200 hover:border-indigo-300"
                    >
                      <Plus className="w-5 h-5" />
                      Add More Documents
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-indigo-500" />
                    Chat
                  </h2>
                  <div className="flex items-center gap-3">
                    {files.length > 0 && (
                      <>
                        <span className="text-sm text-gray-500">
                          {files.length} {files.length === 1 ? 'document' : 'documents'} loaded
                        </span>
                        <button
                          onClick={() => setShowGraph(!showGraph)}
                          className={`p-2 rounded-lg transition-all duration-300 ${
                            showGraph
                              ? 'bg-indigo-100 text-indigo-600'
                              : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
                          }`}
                          title="Toggle Concept Graph"
                        >
                          <Network className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <MetricsInfo />
                  </div>
                </div>

                {!sessionId ? (
                  <div className="h-[500px] flex items-center justify-center text-center">
                    <div>
                      <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-8 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                        <FileText className="w-16 h-16 text-indigo-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-700 mb-3">
                        Upload Documents to Start
                      </h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        Upload one or multiple documents (.txt, .pdf, .docx) to start asking questions across all of them!
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {showGraph ? (
                      <div className="space-y-4">
                        <div className="h-[400px]">
                          <ConceptGraph
                            sessionId={sessionId}
                            onNodeClick={handleNodeClick}
                            lastQuestion={lastQuestion}
                          />
                        </div>
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-indigo-900">Interactive Concept Graph</p>
                              <p className="text-xs text-indigo-700 mt-1">
                                Click any node to instantly ask questions about that concept. Watch the graph animate as you explore!
                              </p>
                            </div>
                          </div>
                        </div>
                        <ChatWindow messages={messages} />
                      </div>
                    ) : (
                      <ChatWindow messages={messages} />
                    )}
                    <ChatInput
                      onSend={handleAsk}
                      disabled={!sessionId || files.length === 0}
                      loading={loading}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p className="flex items-center justify-center gap-2">
              Powered by 
              <span className="font-semibold text-indigo-600">Weaviate</span>
              •
              <span className="font-semibold text-purple-600">Cohere</span>
              •
              <span className="font-semibold text-blue-600">FastAPI</span>
              •
              <span className="font-semibold text-cyan-600">React</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
