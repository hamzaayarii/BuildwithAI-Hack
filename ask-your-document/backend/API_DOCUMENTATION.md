# API Documentation

## Base URL
`http://127.0.0.1:8000`

---

## Endpoints

### 1. Health Check
**GET** `/`
```json
{
  "message": "Ask Your Document API is running",
  "status": "healthy",
  "weaviate_connected": true
}
```

**GET** `/health`
```json
{
  "status": "ok",
  "weaviate": "connected",
  "cohere_key": "configured",
  "features": {
    "multiple_files": true,
    "supported_formats": [".txt", ".pdf", ".docx"],
    "multilingual": true,
    "languages": ["English", "French", "Arabic", "100+ more"]
  }
}
```

---

### 2. Upload Document(s)

**POST** `/upload`

Upload one or multiple documents to a session.

**Form Data:**
- `file`: File to upload (.txt, .pdf, or .docx)
- `session_id` (optional): Existing session ID to add file to. If not provided, creates a new session.

**Response:**
```json
{
  "message": "Document uploaded and processed successfully",
  "session_id": "uuid-here",
  "file_id": "file-uuid-here",
  "filename": "document.pdf",
  "total_chunks": 28,
  "document_length": 5420,
  "file_size": 125840,
  "upload_date": "2024-01-15T10:30:00"
}
```

**Example - First Upload:**
```bash
curl -X POST http://127.0.0.1:8000/upload \
  -F "file=@document1.pdf"
```

**Example - Add to Existing Session:**
```bash
curl -X POST http://127.0.0.1:8000/upload \
  -F "file=@document2.pdf" \
  -F "session_id=your-session-id-here"
```

---

### 3. Chat with Documents

**POST** `/chat`

Ask questions about your uploaded documents. Works across all files in the session.

**Form Data:**
- `question`: Your question (in any language)
- `session_id`: The session ID from upload

**Response:**
```json
{
  "answer": "The document discusses... [Chunk 1]",
  "sources": [
    {
      "chunk_index": 0,
      "content": "Preview of chunk...",
      "full_content": "Complete chunk text"
    }
  ],
  "retrieved_chunks": 4
}
```

**Example:**
```bash
curl -X POST http://127.0.0.1:8000/chat \
  -F "question=What is the main topic?" \
  -F "session_id=your-session-id-here"
```

**Multilingual Support:**
```bash
# French
curl -X POST http://127.0.0.1:8000/chat \
  -F "question=Quel est le sujet principal?" \
  -F "session_id=your-session-id-here"

# Arabic
curl -X POST http://127.0.0.1:8000/chat \
  -F "question=ما هو الموضوع الرئيسي؟" \
  -F "session_id=your-session-id-here"
```

---

### 4. File Management

#### List Files in Session
**GET** `/sessions/{session_id}/files`

Get all files uploaded in a session.

**Response:**
```json
{
  "session_id": "uuid-here",
  "files": [
    {
      "file_id": "file-uuid-1",
      "filename": "document1.pdf",
      "upload_date": "2024-01-15T10:30:00",
      "file_size": 125840
    },
    {
      "file_id": "file-uuid-2",
      "filename": "document2.docx",
      "upload_date": "2024-01-15T10:35:00",
      "file_size": 45200
    }
  ],
  "total_files": 2
}
```

**Example:**
```bash
curl -X GET http://127.0.0.1:8000/sessions/your-session-id-here/files
```

---

#### Delete a Specific File
**DELETE** `/files/{file_id}`

Delete a specific file and all its chunks from the system.

**Response:**
```json
{
  "message": "File file-uuid-here deleted successfully"
}
```

**Example:**
```bash
curl -X DELETE http://127.0.0.1:8000/files/file-uuid-here
```

---

#### Delete Entire Session
**DELETE** `/sessions/{session_id}`

Delete all files and data for a session.

**Response:**
```json
{
  "message": "Session uuid-here deleted successfully"
}
```

**Example:**
```bash
curl -X DELETE http://127.0.0.1:8000/sessions/your-session-id-here
```

---

## Usage Flow

### Typical Workflow:

1. **Upload First Document**
   ```
   POST /upload (file=doc1.pdf)
   → Returns session_id and file_id
   ```

2. **Upload More Documents to Same Session**
   ```
   POST /upload (file=doc2.pdf, session_id=from-step-1)
   POST /upload (file=doc3.docx, session_id=from-step-1)
   ```

3. **View All Files**
   ```
   GET /sessions/{session_id}/files
   ```

4. **Chat Across All Documents**
   ```
   POST /chat (question="...", session_id=from-step-1)
   ```

5. **Delete Specific File (if needed)**
   ```
   DELETE /files/{file_id}
   ```

6. **Delete Entire Session (when done)**
   ```
   DELETE /sessions/{session_id}
   ```

---

## Error Responses

All endpoints return standard HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found
- `500` - Internal Server Error

**Error Response Format:**
```json
{
  "detail": "Error message here"
}
```

---

## Interactive Documentation

Visit `http://127.0.0.1:8000/docs` for interactive Swagger UI documentation where you can test all endpoints directly in your browser.

