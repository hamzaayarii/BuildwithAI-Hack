# Ask Your Documents - AI-Powered Document Chat System 📄

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.8+-blue)
![React](https://img.shields.io/badge/react-18.3-61dafb)
![FastAPI](https://img.shields.io/badge/fastapi-0.104-009688)

**A production-ready RAG system with advanced features including confidence metrics, multi-file support, and interactive concept graphs**

[Features](#-features) • [Demo](#-demo) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Tech Stack](#-tech-stack)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Advanced Features](#-advanced-features)
- [Architecture](#-architecture)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Ask Your Documents** is an enterprise-grade, AI-powered document question-answering system that allows users to upload documents and interact with them through natural language. Built with cutting-edge RAG (Retrieval-Augmented Generation) technology, it provides accurate, cited answers with confidence metrics and visual concept mapping.

### Key Highlights

- 🌍 **100+ Languages**: Full multilingual support (English, French, Arabic, and more)
- 📊 **Confidence Metrics**: Know how reliable each answer is
- 🌐 **Interactive Graphs**: Visualize document concepts as explorable networks
- 📁 **Multi-File Support**: Upload and query across multiple documents
- 💬 **Natural Conversation**: Chat naturally, not just document Q&A
- 🎨 **Beautiful UI**: Modern, gradient-based design with smooth animations

---

## ✨ Features

### Core Functionality

#### 1. **Document Upload & Processing**
- ✅ Support for `.txt`, `.pdf`, and `.docx` files
- ✅ Multi-file upload with drag & drop
- ✅ Automatic text extraction and chunking
- ✅ Vector embeddings generation using Cohere
- ✅ Storage in Weaviate vector database

#### 2. **Intelligent Chat System**
- ✅ Natural language question answering
- ✅ Conversational AI (handles greetings, small talk)
- ✅ Cross-document search and retrieval
- ✅ Source citations with chunk references
- ✅ Multilingual support (100+ languages)
- ✅ Context-aware responses

#### 3. **Advanced Metrics**

##### Confidence Score (Match Quality)
- Measures how well retrieved chunks match your question
- Based on vector similarity (0-100%)
- Visual badges on each response
- Per-source confidence scores

##### Source Coverage (Grounding)
- Shows what % of answer comes from document vs. inference
- Smart algorithm analyzes citations and content
- Range: 0-100%
- Helps assess answer reliability

#### 4. **Interactive Concept Graph** 🌐
- Auto-extracts key concepts from documents
- Visualizes relationships as interactive nodes
- Click nodes to instantly ask questions
- Animated interactions (pulse, flash, highlight)
- Built with React Flow

#### 5. **File Management**
- Upload multiple documents per session
- View all uploaded files with metadata
- Delete individual files
- Clear entire sessions
- File size and upload date tracking

---

## 🛠 Tech Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.11+ | Core backend language |
| **FastAPI** | 0.104.1 | Modern web framework |
| **Uvicorn** | 0.24.0 | ASGI server |
| **Weaviate** | 4.4.0 | Vector database |
| **Cohere** | 4.37 | AI embeddings & chat |
| **PyPDF** | 3.17.4 | PDF processing |
| **python-docx** | 1.1.0 | DOCX processing |
| **python-dotenv** | 1.0.0 | Environment management |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.9.3 | Type safety |
| **Vite** | 5.4.21 | Build tool |
| **Tailwind CSS** | 3.4.18 | Styling |
| **React Flow** | 11.11.4 | Graph visualization |
| **Axios** | 1.13.2 | HTTP client |
| **Lucide React** | 0.294.0 | Icon library |

### AI & ML

- **Cohere Command R Plus**: Text generation (command-r-plus-08-2024)
- **Cohere Embed Multilingual**: Vector embeddings (embed-multilingual-v3.0)
- **Weaviate**: Vector search and storage
- **RAG Pipeline**: Custom retrieval-augmented generation

### DevOps & Tools

- **pnpm**: Package management (frontend)
- **pip**: Package management (backend)
- **Git**: Version control
- **Docker**: Weaviate containerization

---

## 📁 Project Structure

```
ask-your-document/
│
├── backend/                          # FastAPI Backend
│   ├── services/
│   │   ├── __init__.py
│   │   ├── document_processor.py    # Document parsing & chunking
│   │   ├── rag_pipeline.py          # RAG logic, concept extraction
│   │   └── weaviate_client.py       # Vector DB operations
│   ├── main.py                       # FastAPI app & endpoints
│   ├── requirements.txt              # Python dependencies
│   ├── .env                          # Environment variables (API keys)
│   └── .venv/                        # Virtual environment
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInput.tsx        # Message input
│   │   │   ├── ChatWindow.tsx       # Message display
│   │   │   ├── ConceptGraph.tsx     # Interactive graph
│   │   │   ├── FileManager.tsx      # File list & management
│   │   │   ├── FileUpload.tsx       # Multi-file upload
│   │   │   └── MetricsInfo.tsx      # Confidence metrics modal
│   │   ├── services/
│   │   │   └── api.ts               # API client
│   │   ├── App.tsx                  # Main application
│   │   ├── index.css                # Global styles
│   │   └── main.tsx                 # Entry point
│   ├── package.json                  # Dependencies
│   ├── tailwind.config.cjs          # Tailwind configuration
│   ├── tsconfig.json                # TypeScript config
│   └── vite.config.ts               # Vite configuration
│
├── docs/                             # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── COMPLETE_SETUP.md
│   ├── CONCEPT_GRAPH_FEATURE.md
│   ├── CONFIDENCE_METRICS.md
│   ├── DEPLOYMENT.md
│   ├── METRICS_IMPLEMENTATION.md
│   ├── PROJECT_STRUCTURE.md
│   ├── QUICKSTART.md
│   ├── START_HERE.md
│   └── UI_DESIGN.md
│
└── README.md                         # This file
```

---

## 🚀 Installation

### Prerequisites

- **Python 3.8+**
- **Node.js 16+** or **pnpm**
- **Docker** (for Weaviate)
- **Cohere API Key** (free tier available)

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd ask-your-document
```

### Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.\.venv\Scripts\Activate.ps1
# Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
COHERE_API_KEY=your_cohere_api_key_here
WEAVIATE_URL=http://localhost:8080
EOF
```

**Get Cohere API Key:**
1. Visit https://dashboard.cohere.com/api-keys
2. Sign up (free tier available)
3. Copy your API key
4. Paste in `.env` file

### Step 3: Start Weaviate

```bash
# Using Docker
docker run -d \
  -p 8080:8080 \
  -p 50051:50051 \
  weaviate/weaviate:latest
```

### Step 4: Start Backend

```bash
# From backend directory
uvicorn main:app --reload
```

Backend runs at: `http://localhost:8000` ✅

### Step 5: Frontend Setup

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
pnpm install
# or: npm install

# Start development server
pnpm dev
# or: npm run dev
```

Frontend runs at: `http://localhost:5173` ✅

---

## 💻 Usage

### 1. Upload Documents

```
1. Open http://localhost:5173
2. Drag & drop or click to upload files
3. Supported formats: .txt, .pdf, .docx
4. Upload multiple files to same session
5. Wait for processing (embeddings generation)
```

### 2. Ask Questions

```
# Natural Questions
"What is the main topic of the document?"
"Tell me about revenue growth"
"Summarize the key points"

# Casual Conversation
"Hi!"
"Thanks!"
"Can you help me?"

# Multilingual
"Quel est le sujet principal?" (French)
"ما هو الموضوع الرئيسي؟" (Arabic)
```

### 3. View Confidence Metrics

Every AI response shows:
- **Blue Badge**: Match score (how relevant chunks are)
- **Purple Badge**: Grounding score (how much is from document)
- **Source Citations**: Clickable chunks with confidence

### 4. Explore Concept Graph

```
1. Click 🌐 Network icon in chat header
2. Wait for AI to extract concepts
3. Interactive graph appears
4. Click any node to ask about that concept
5. Watch animations as you explore
```

### 5. Manage Files

```
- View all uploaded files in sidebar
- See file size and upload date
- Delete individual files
- Add more documents anytime
- Clear entire session
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000
```

### Endpoints

#### **Upload Document**
```http
POST /upload
Content-Type: multipart/form-data

Parameters:
  file: File (required) - .txt, .pdf, or .docx
  session_id: string (optional) - Existing session to add to

Response:
{
  "session_id": "uuid",
  "file_id": "uuid",
  "filename": "document.pdf",
  "total_chunks": 28,
  "document_length": 5420,
  "file_size": 125840,
  "upload_date": "2024-01-15T10:30:00"
}
```

#### **Chat / Ask Question**
```http
POST /chat
Content-Type: multipart/form-data

Parameters:
  question: string (required)
  session_id: string (required)

Response:
{
  "answer": "The revenue was $5.2M [Chunk 1]",
  "sources": [
    {
      "chunk_index": 0,
      "content": "Preview...",
      "full_content": "Full text...",
      "confidence": 92.3,
      "similarity_score": 0.923
    }
  ],
  "retrieved_chunks": 2,
  "confidence_score": 87.5,
  "source_coverage": 90.0,
  "metrics": {
    "avg_chunk_similarity": 87.5,
    "document_grounding": 90.0,
    "chunks_used": 2
  }
}
```

#### **Get Concept Graph**
```http
GET /sessions/{session_id}/concepts

Response:
{
  "concepts": [
    {
      "id": "concept1",
      "label": "Revenue Growth",
      "description": "Company's revenue trajectory"
    }
  ],
  "relationships": [
    {
      "source": "concept1",
      "target": "concept2",
      "type": "drives"
    }
  ],
  "total_chunks_analyzed": 25
}
```

#### **List Files**
```http
GET /sessions/{session_id}/files

Response:
{
  "session_id": "uuid",
  "files": [
    {
      "file_id": "uuid",
      "filename": "document.pdf",
      "upload_date": "2024-01-15T10:30:00",
      "file_size": 125840
    }
  ],
  "total_files": 2
}
```

#### **Delete File**
```http
DELETE /files/{file_id}

Response:
{
  "message": "File deleted successfully"
}
```

#### **Delete Session**
```http
DELETE /sessions/{session_id}

Response:
{
  "message": "Session deleted successfully"
}
```

#### **Health Check**
```http
GET /health

Response:
{
  "status": "ok",
  "weaviate": "connected",
  "cohere_key": "configured",
  "features": {
    "multiple_files": true,
    "supported_formats": [".txt", ".pdf", ".docx"],
    "multilingual": true,
    "languages": ["English", "French", "Arabic", "100+ more"],
    "concept_graph": true
  }
}
```

### Interactive API Docs
Visit `http://localhost:8000/docs` for Swagger UI

---

## 🔥 Advanced Features

### 1. Confidence Metrics

#### Match Score (0-100%)
- Measures chunk relevance to question
- Based on vector similarity
- Higher = better match

**Interpretation:**
- 90-100%: Excellent match
- 75-89%: Good match
- 60-74%: Fair match
- <60%: Weak match

#### Source Coverage (0-100%)
- Measures answer grounding
- Analyzes citations, document phrases, inference
- Higher = more document-based

**Interpretation:**
- 80-100%: Highly grounded
- 50-79%: Moderately grounded
- 20-49%: Lightly grounded
- 0-19%: Conversational

### 2. Interactive Concept Graph

**Features:**
- Auto-extracts 5-10 key concepts
- Visualizes relationships
- Click nodes → auto-asks questions
- Animated interactions
- Circular layout

**Usage:**
```
1. Click 🌐 icon
2. AI analyzes documents
3. Graph displays concepts
4. Click any node
5. Question auto-generated
6. Watch animations
```

### 3. Multi-File Management

**Capabilities:**
- Upload multiple documents
- Cross-document search
- Individual file deletion
- Metadata tracking
- Session management

### 4. Multilingual Support

**Supported:**
- English
- French
- Arabic
- Spanish
- German
- Chinese
- Japanese
- And 100+ more languages

**How it works:**
- Multilingual embeddings (Cohere)
- Language-aware model
- Auto-detects question language
- Responds in same language

---

## 🏗 Architecture

### System Flow

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  React Frontend     │
│  - Upload UI        │
│  - Chat Interface   │
│  - Concept Graph    │
│  - File Manager     │
└──────┬──────────────┘
       │ HTTP/REST
       ▼
┌─────────────────────┐
│  FastAPI Backend    │
│  - Document Parser  │
│  - RAG Pipeline     │
│  - Concept Extract  │
└──────┬──────┬───────┘
       │      │
       │      ▼
       │  ┌───────────┐
       │  │ Cohere AI │
       │  │ - Embed   │
       │  │ - Chat    │
       │  └───────────┘
       │
       ▼
┌─────────────────┐
│   Weaviate      │
│  Vector Database│
│  - Store vectors│
│  - Similarity   │
└─────────────────┘
```

### RAG Pipeline

```
1. Document Upload
   ↓
2. Text Extraction (PyPDF, python-docx)
   ↓
3. Chunking (800 chars, 100 overlap)
   ↓
4. Embedding Generation (Cohere)
   ↓
5. Vector Storage (Weaviate)
   ↓
6. Query Time:
   - Embed question
   - Search similar chunks
   - Retrieve top K
   - Generate answer (Cohere)
   - Calculate metrics
   ↓
7. Response with citations
```

### Concept Graph Pipeline

```
1. User clicks graph button
   ↓
2. Backend retrieves all chunks
   ↓
3. Cohere analyzes text
   ↓
4. Extracts:
   - Key concepts
   - Relationships
   - Descriptions
   ↓
5. Returns structured JSON
   ↓
6. React Flow visualizes
   ↓
7. User interacts with graph
```

---

## 🎨 UI/UX Features

### Design System

**Colors:**
- Primary: Indigo (#6366f1) → Purple (#8b5cf6)
- Success: Emerald (#10b981)
- Error: Red (#ef4444)
- Background: Soft blue → indigo gradient

**Typography:**
- Font: System fonts (Apple, Segoe UI, Roboto)
- Headers: Bold, gradient text
- Body: Regular, high contrast

**Components:**
- Gradient buttons with hover effects
- Smooth animations (0.3s ease)
- Custom scrollbars
- Glass morphism effects
- Responsive layout

### Animations

- **Fade In**: Messages, uploads
- **Slide In**: File cards
- **Pulse**: Node highlights
- **Scale**: Hover effects
- **Flow**: Edge animations

### Accessibility

- High contrast text
- Keyboard navigation
- Screen reader support
- Clear focus states
- Semantic HTML

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
pnpm test
```

### Manual Testing

**Upload Flow:**
1. Upload various file types
2. Check processing success
3. Verify chunk generation

**Chat Flow:**
1. Ask factual questions
2. Try conversational queries
3. Test multilingual
4. Verify citations

**Graph Flow:**
1. Generate concept graph
2. Click nodes
3. Verify auto-questions
4. Check animations

---

## 📊 Performance

### Metrics

- **Upload**: ~2-5 seconds per document
- **Embedding**: ~1-3 seconds per document
- **Query**: <1 second response time
- **Graph Generation**: 5-15 seconds
- **Chunk Size**: 800 characters
- **Chunk Overlap**: 100 characters

### Optimization

- Batch embedding generation
- Vector similarity caching
- Lazy loading components
- Optimized chunk retrieval
- Efficient re-renders

---

## 🔐 Security

### Environment Variables
- API keys stored in `.env`
- `.env` in `.gitignore`
- Never commit secrets

### CORS
- Configured origins
- Credentials handling
- Header restrictions

### Input Validation
- File type checking
- Size limits
- Content sanitization

---

## 🚢 Deployment

### Backend (Production)

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export COHERE_API_KEY=your_key
export WEAVIATE_URL=your_weaviate_url

# Run with Gunicorn
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend (Production)

```bash
# Build
pnpm build

# Serve with nginx or similar
# Files in: dist/
```

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

### Code Style

**Backend:**
- PEP 8 style guide
- Type hints
- Docstrings

**Frontend:**
- ESLint configuration
- Prettier formatting
- TypeScript strict mode

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **Cohere** - AI embeddings and chat
- **Weaviate** - Vector database
- **FastAPI** - Modern Python framework
- **React Flow** - Graph visualization
- **Tailwind CSS** - Styling system

---

## 📞 Support

- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues
- **API Docs**: `http://localhost:8000/docs`

---

## 🎓 Learn More

### Key Concepts

**RAG (Retrieval-Augmented Generation):**
Combines document retrieval with AI generation for accurate, cited answers.

**Vector Embeddings:**
Numerical representations of text that capture semantic meaning.

**Semantic Search:**
Finding information by meaning, not just keywords.

**Concept Extraction:**
Using AI to identify key topics and relationships in text.

---

## 🎯 Roadmap

### Planned Features

- [ ] Dark mode
- [ ] Export chat history
- [ ] Document preview
- [ ] Voice input
- [ ] Mobile app
- [ ] PDF annotations
- [ ] Collaborative sessions
- [ ] Admin dashboard
- [ ] Analytics tracking
- [ ] Custom embedding models

---

## ⭐ Star History

If you find this project useful, please give it a star! ⭐

---

<div align="center">

**Built with ❤️ using FastAPI, React, Cohere & Weaviate**

[⬆ Back to Top](#ask-your-documents---ai-powered-document-chat-system-)

</div>
