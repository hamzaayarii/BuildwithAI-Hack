import React, { useState } from 'react';
import { Info, X, TrendingUp, Target } from 'lucide-react';

const MetricsInfo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        title="Learn about confidence metrics"
      >
        <Info className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                📊 Understanding Confidence Metrics
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Match Score */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-bold text-blue-900">Match Score (Confidence)</h3>
                </div>
                <p className="text-blue-800 mb-3">
                  Shows how relevant the retrieved document chunks are to your question.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between bg-white bg-opacity-50 rounded-lg p-2">
                    <span className="font-medium text-blue-900">90-100%</span>
                    <span className="text-blue-700">Excellent match</span>
                  </div>
                  <div className="flex items-center justify-between bg-white bg-opacity-50 rounded-lg p-2">
                    <span className="font-medium text-blue-900">75-89%</span>
                    <span className="text-blue-700">Good match</span>
                  </div>
                  <div className="flex items-center justify-between bg-white bg-opacity-50 rounded-lg p-2">
                    <span className="font-medium text-blue-900">60-74%</span>
                    <span className="text-blue-700">Fair match</span>
                  </div>
                  <div className="flex items-center justify-between bg-white bg-opacity-50 rounded-lg p-2">
                    <span className="font-medium text-blue-900">&lt;60%</span>
                    <span className="text-blue-700">Weak match</span>
                  </div>
                </div>
              </div>

              {/* Grounding Score */}
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-5 border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-bold text-purple-900">Grounding Score (Coverage)</h3>
                </div>
                <p className="text-purple-800 mb-3">
                  Shows what % of the answer comes from the document vs. AI inference.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between bg-white bg-opacity-50 rounded-lg p-2">
                    <span className="font-medium text-purple-900">80-100%</span>
                    <span className="text-purple-700">Highly grounded in document</span>
                  </div>
                  <div className="flex items-center justify-between bg-white bg-opacity-50 rounded-lg p-2">
                    <span className="font-medium text-purple-900">50-79%</span>
                    <span className="text-purple-700">Moderately grounded</span>
                  </div>
                  <div className="flex items-center justify-between bg-white bg-opacity-50 rounded-lg p-2">
                    <span className="font-medium text-purple-900">20-49%</span>
                    <span className="text-purple-700">Lightly grounded</span>
                  </div>
                  <div className="flex items-center justify-between bg-white bg-opacity-50 rounded-lg p-2">
                    <span className="font-medium text-purple-900">0-19%</span>
                    <span className="text-purple-700">Conversational (not doc-based)</span>
                  </div>
                </div>
              </div>

              {/* Examples */}
              <div className="border-2 border-gray-200 rounded-xl p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-4">📝 Examples</h3>
                
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">✅</span>
                      <span className="font-semibold text-green-900">Best Case</span>
                    </div>
                    <p className="text-sm text-green-800 mb-2">
                      Q: "What is the deadline?"<br/>
                      A: "The deadline is March 15th [Chunk 2]"
                    </p>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">90% Match</span>
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">95% Grounded</span>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">⚠️</span>
                      <span className="font-semibold text-yellow-900">Verify This</span>
                    </div>
                    <p className="text-sm text-yellow-800 mb-2">
                      Q: "What does this suggest?"<br/>
                      A: "The document shows growth [Chunk 1]. This typically indicates..."
                    </p>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">82% Match</span>
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">55% Grounded</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">💬</span>
                      <span className="font-semibold text-gray-900">Casual Chat</span>
                    </div>
                    <p className="text-sm text-gray-800 mb-2">
                      Q: "Hi there!"<br/>
                      A: "Hello! How can I help you today?"
                    </p>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full">N/A</span>
                      <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full">0% Grounded</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-5">
                <h3 className="text-lg font-bold text-indigo-900 mb-3">💡 Tips</h3>
                <ul className="space-y-2 text-sm text-indigo-800">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span><strong>Both High:</strong> Most reliable, use with confidence</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span><strong>High Match, Low Ground:</strong> Verify AI's interpretation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span><strong>Both Low:</strong> Normal for casual conversation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span><strong>Click sources:</strong> Always check the original chunks</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-semibold"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MetricsInfo;

