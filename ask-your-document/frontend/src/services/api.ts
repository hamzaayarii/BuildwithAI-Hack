import axios from 'axios';

const API_URL = 'http://localhost:8000';

export interface UploadResponse {
  message: string;
  session_id: string;
  filename: string;
  total_chunks: number;
  document_length: number;
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

export const uploadDocument = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

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

export const checkHealth = async (): Promise<{ status: string }> => {
  const response = await axios.get(`${API_URL}/health`);
  return response.data;
};
