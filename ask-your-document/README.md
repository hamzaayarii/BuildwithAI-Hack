# Ask Your Document - RAG Chat Application

A full-stack document question-answering application using **Retrieval-Augmented Generation (RAG)** with **Weaviate** vector database, **OpenAI** embeddings/LLM, **FastAPI** backend, and **React + TypeScript** frontend.

![Tech Stack](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Tech Stack](https://img.shields.io/badge/Weaviate-00C9A7?style=flat&logo=weaviate&logoColor=white)
![Tech Stack](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white)
![Tech Stack](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Tech Stack](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tech Stack](https://img.shields.io/badge/TailwindCSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

## 🚀 Features

### ✅ Required Features

- **Document Upload**: Upload `.txt` files (with PDF support ready)
- **Chat Interface**: Interactive Q&A with your documents
- **RAG Pipeline**:
  - Smart text chunking with overlap
  - OpenAI embeddings (`text-embedding-3-small`)
  - Weaviate vector search
  - Context-aware answer generation with GPT-4o-mini
- **Hallucination Minimization**:
  - Low temperature (0.1) for deterministic answers
  - Strict prompt instructions to ground answers in retrieved text
  - "I don't know" responses when answer not found

### 🎯 Optional Features (Implemented)

- **Source Citations**: Every answer includes chunk references `[Chunk X]`
- **Expandable Sources**: Click to view full source text snippets
- **PDF Support**: Ready to parse `.pdf` files (install `pypdf`)
- **Beautiful UI**: Modern, responsive design with Tailwind CSS
- **Drag & Drop Upload**: Intuitive file upload experience

---

## 📁 Project Structure

```
ask-your-document/
├── backend/                    # FastAPI backend
│   ├── services/
│   │   ├── weaviate_client.py  # Weaviate connection & setup
│   │   ├── document_processor.py # Text parsing & chunking
│   │   └── rag_pipeline.py     # RAG logic & OpenAI integration
│   ├── main.py                 # FastAPI app & endpoints
│   ├── requirements.txt        # Python dependencies
│   └── .env.example            # Environment variables template
│
└── frontend/                   # React + TypeScript frontend
    ├── src/
    │   ├── components/
    │   │   ├── FileUpload.tsx  # Document upload UI
    │   │   ├── ChatWindow.tsx  # Message display
    │   │   └── ChatInput.tsx   # Question input
    │   ├── services/
    │   │   └── api.ts          # API client
    │   ├── App.tsx             # Main app component
    │   └── main.tsx            # Entry point
    ├── package.json
    ├── vite.config.ts
    └── tailwind.config.js
```

---

## 🛠️ Setup Instructions

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** and **npm**
- **Weaviate Cloud** account (free) OR **Docker** (for local Weaviate)
- **OpenAI API key**

---

### 1️⃣ Backend Setup

#### Step 1: Navigate to backend folder

```powershell
cd ask-your-document/backend
```

#### Step 2: Create virtual environment

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

#### Step 3: Install dependencies

```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

#### Step 4: Set up Weaviate

**Option A: Weaviate Cloud (Recommended for competition)**

1. Go to https://console.weaviate.cloud
2. Create a free cluster
3. Copy your **Cluster URL** and **API Key**

**Option B: Local Weaviate with Docker**

```powershell
docker run -d -p 8080:8080 -p 50051:50051 cr.weaviate.io/semitechnologies/weaviate:latest
```

#### Step 5: Configure environment variables

```powershell
# Copy template
cp .env.example .env

# Edit .env and add your credentials:
```

**.env file:**

```env
# For Weaviate Cloud:
WEAVIATE_URL=https://your-cluster.weaviate.network
WEAVIATE_API_KEY=your-api-key

# For Local Weaviate:
# WEAVIATE_URL=http://localhost:8080
# WEAVIATE_API_KEY=

# OpenAI:
OPENAI_API_KEY=sk-your-openai-api-key
```

#### Step 6: Run the backend

```powershell
uvicorn main:app --reload
```

Backend will run at: **http://localhost:8000**

API docs available at: **http://localhost:8000/docs**

---

### 2️⃣ Frontend Setup

#### Step 1: Navigate to frontend folder (new terminal)

```powershell
cd ask-your-document/frontend
```

#### Step 2: Install dependencies

```powershell
npm install
```

#### Step 3: Run the frontend

```powershell
npm run dev
```

Frontend will run at: **http://localhost:5173**

---

## 🎮 Usage

1. **Open your browser** to http://localhost:5173
2. **Upload a document** (`.txt` or `.pdf`)
3. **Wait for processing** (you'll see chunk count)
4. **Ask questions** about the document
5. **View answers with citations** - click "Chunk X" to see source text

---

## 🧪 Testing

### Test with sample document

Create `backend/test_document.txt`:

```txt
The Python programming language was created by Guido van Rossum and first released in 1991.
Python is known for its simple syntax and readability.
It is widely used in web development, data science, and artificial intelligence.
The name "Python" comes from the British comedy group Monty Python.
```

**Sample questions:**

- "Who created Python?"
- "When was Python released?"
- "What is Python used for?"
- "Why is it called Python?"

---

## 🔧 API Endpoints

### `POST /upload`

Upload and process a document.

**Request:**

- `file`: File upload (`.txt` or `.pdf`)

**Response:**

```json
{
  "message": "Document uploaded and processed successfully",
  "session_id": "uuid-here",
  "filename": "document.txt",
  "total_chunks": 15,
  "document_length": 5420
}
```

### `POST /chat`

Ask a question about the uploaded document.

**Request:**

- `question`: User question (form data)
- `session_id`: Session ID from upload (form data)

**Response:**

```json
{
  "answer": "Python was created by Guido van Rossum [Chunk 1].",
  "sources": [
    {
      "chunk_index": 0,
      "content": "The Python programming language was created...",
      "full_content": "..."
    }
  ],
  "retrieved_chunks": 4
}
```

### `GET /health`

Health check endpoint.

---

## 🎨 Architecture

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   React     │─────▶│   FastAPI    │─────▶│   Weaviate   │─────▶│   OpenAI     │
│  Frontend   │      │   Backend    │      │ Vector Store │      │   GPT-4o     │
└─────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
      │                      │                      │                      │
      │  1. Upload Doc       │                      │                      │
      ├─────────────────────▶│  2. Chunk Text       │                      │
      │                      ├─────────────────────▶│  3. Embed & Store    │
      │                      │                      ├─────────────────────▶│
      │                      │                      │                      │
      │  4. Ask Question     │                      │                      │
      ├─────────────────────▶│  5. Vector Search    │                      │
      │                      ├─────────────────────▶│  6. Retrieve Chunks  │
      │                      │◀─────────────────────┤                      │
      │                      │  7. RAG Prompt       │                      │
      │                      ├──────────────────────────────────────────────▶│
      │  8. Answer + Cites   │◀─────────────────────────────────────────────┤
      │◀─────────────────────┤                      │                      │
```

---

## 🚨 Troubleshooting

### Backend Issues

**1. Weaviate connection error**

```
Solution: Check your WEAVIATE_URL and WEAVIATE_API_KEY in .env
For local: Make sure Docker container is running
```

**2. OpenAI API error**

```
Solution: Verify OPENAI_API_KEY is valid and has credits
```

**3. Import errors**

```powershell
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Frontend Issues

**1. API connection error**

```
Solution: Ensure backend is running on http://localhost:8000
Check CORS settings in backend/main.py
```

**2. Build errors**

```powershell
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🎯 Competition Tips

### Minimizing Hallucinations

1. ✅ **Low temperature (0.1)** - Already configured
2. ✅ **Explicit grounding instructions** - In prompt template
3. ✅ **"I don't know" fallback** - Implemented
4. ✅ **Source citations** - Chunk references included
5. 🔧 **Optional**: Add answer verification step (re-query retrieved chunks)

### Performance Optimization

- Adjust chunk size in `document_processor.py` (default: 800 chars, 100 overlap)
- Increase `limit=4` in `main.py` for more context (may increase latency)
- Use `gpt-4o` instead of `gpt-4o-mini` for better accuracy (higher cost)

### Adding More Features

- **Multi-document support**: Store multiple session IDs
- **Conversation history**: Track previous Q&A pairs
- **Custom embeddings**: Switch to Cohere or HuggingFace models
- **Image support**: Add OCR with `pytesseract`

---

## 📦 Deployment

### Backend (Railway / Render)

```powershell
# Add Procfile
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Frontend (Vercel / Netlify)

```powershell
npm run build
# Upload dist/ folder
```

### Environment Variables (Production)

- `WEAVIATE_URL`
- `WEAVIATE_API_KEY`
- `OPENAI_API_KEY`

---

## 📚 Tech Stack Details

| Component  | Technology                    | Purpose                     |
| ---------- | ----------------------------- | --------------------------- |
| Backend    | FastAPI                       | REST API server             |
| Vector DB  | Weaviate                      | Embeddings storage & search |
| Embeddings | OpenAI text-embedding-3-small | Text vectorization          |
| LLM        | OpenAI GPT-4o-mini            | Answer generation           |
| Frontend   | React + TypeScript            | UI framework                |
| Styling    | TailwindCSS                   | Modern styling              |
| Icons      | Lucide React                  | UI icons                    |
| Build Tool | Vite                          | Fast dev server             |

---

## 📝 License

This project is open source and available for use in competitions and personal projects.

---

## 🎉 Credits

Built for the **BuildWithAI** competition using modern RAG techniques.

**Happy Hacking! 🚀**
