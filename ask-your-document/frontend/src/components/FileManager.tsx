import React from 'react';
import { FileText, Trash2, Calendar, HardDrive } from 'lucide-react';
import { FileInfo } from '../services/api';

interface FileManagerProps {
  files: FileInfo[];
  onDelete: (fileId: string) => void;
  loading: boolean;
}

const FileManager: React.FC<FileManagerProps> = ({ files, onDelete, loading }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.pdf')) return '📄';
    if (filename.endsWith('.docx')) return '📝';
    if (filename.endsWith('.txt')) return '📃';
    return '📄';
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Uploaded Documents ({files.length})
        </h3>
      </div>

      {files.map((file) => (
        <div
          key={file.file_id}
          className="group bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:border-indigo-300"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{getFileIcon(file.filename)}</span>
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {file.filename}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  {formatFileSize(file.file_size)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(file.upload_date)}
                </span>
              </div>
            </div>

            <button
              onClick={() => onDelete(file.file_id)}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
              title="Delete this file"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileManager;

