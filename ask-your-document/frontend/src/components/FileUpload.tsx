import React, { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface FileUploadProps {
  onUpload: (file: File) => void;
  loading: boolean;
  disabled: boolean;
  hasSession: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, loading, disabled, hasSession }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files).filter(file => 
        file.name.endsWith('.txt') || file.name.endsWith('.pdf') || file.name.endsWith('.docx')
      );
      if (files.length > 0) {
        setSelectedFiles(prev => [...prev, ...files]);
      } else {
        alert('Please upload .txt, .pdf, or .docx files');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadClick = async () => {
    for (const file of selectedFiles) {
      await onUpload(file);
    }
    setSelectedFiles([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive 
            ? 'border-indigo-500 bg-indigo-50 scale-105' 
            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".txt,.pdf,.docx"
          multiple
          onChange={handleChange}
          disabled={disabled}
        />
        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl mb-4">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <p className="text-lg font-semibold text-gray-800 mb-2">
            {hasSession ? 'Add More Documents' : 'Upload Your Documents'}
          </p>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-semibold text-indigo-600">Click to browse</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">TXT, PDF, or DOCX files • Multiple files supported</p>
          <p className="text-xs text-gray-400 mt-1">🌍 Supports English, French, Arabic & 100+ languages</p>
        </label>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-semibold text-gray-700">Selected Files ({selectedFiles.length})</p>
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
          
          <button
            onClick={handleUploadClick}
            disabled={loading || disabled}
            className="mt-3 w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </span>
            ) : (
              `Upload ${selectedFiles.length} ${selectedFiles.length === 1 ? 'Document' : 'Documents'}`
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
