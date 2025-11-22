import axios from 'axios';

const API_URL = 'http://localhost:8000';

export interface FileInfo {
  file_id: string;
  filename: string;
  upload_date: string;
  file_size: number;
}

export interface UploadResponse {
  message: string;
  session_id: string;
  file_id: string;
  filename: string;
  total_chunks: number;
  document_length: number;
  file_size: number;
  upload_date: string;
}

export interface ChatResponse {
  answer: string;
  sources: Array<{
    chunk_index: number;
    content: string;
    full_content: string;
  }>;
  retrieved_chunks: number;
}

export interface FilesResponse {
  session_id: string;
  files: FileInfo[];
  total_files: number;
}

export const uploadDocument = async (file: File, sessionId?: string): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  if (sessionId) {
    formData.append('session_id', sessionId);
  }

  const response = await axios.post<UploadResponse>(`${API_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const askQuestion = async (question: string, sessionId: string): Promise<ChatResponse> => {
  const formData = new FormData();
  formData.append('question', question);
  formData.append('session_id', sessionId);

  const response = await axios.post<ChatResponse>(`${API_URL}/chat`, formData);

  return response.data;
};

export const getSessionFiles = async (sessionId: string): Promise<FilesResponse> => {
  const response = await axios.get<FilesResponse>(`${API_URL}/sessions/${sessionId}/files`);
  return response.data;
};

export const deleteFile = async (fileId: string): Promise<void> => {
  await axios.delete(`${API_URL}/files/${fileId}`);
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  await axios.delete(`${API_URL}/sessions/${sessionId}`);
};

export const checkHealth = async (): Promise<{ status: string }> => {
  const response = await axios.get(`${API_URL}/health`);
  return response.data;
};
