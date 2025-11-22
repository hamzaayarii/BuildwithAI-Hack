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
## 🎯 Architechture
<img width="1568" height="723" alt="image" src="https://github.com/user-attachments/assets/42207d29-46ec-4888-bae2-0d5b59876fb9" />

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

#### 4. **Advanced Interactive Concept Graph** 🌐
- **AI-Powered Extraction**: Automatically identifies 8-15 key concepts
- **Intelligent Metadata**: Importance scoring (1-10), categories, keywords
- **8 Relationship Types**: causes, requires, part_of, influences, produces, related_to, contrasts, supports
- **3 Layout Algorithms**: Force-directed, circular, hierarchical
- **Visual Intelligence**: Node size by importance, color by category
- **Interactive Exploration**: Click nodes to ask questions, search/filter concepts
- **Rich Details Panel**: Full metadata, keywords, category badges
- **MiniMap & Controls**: Navigate large graphs easily
- **Animated Interactions**: Pulse, flash, edge highlighting
- **Export Capability**: Save graph visualizations

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
| **D3-Force** | 3.0.0 | Physics-based layouts |
| **D3-Hierarchy** | 3.1.2 | Hierarchical layouts |
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
├── ADVANCED_CONCEPT_GRAPH.md         # Concept graph documentation
├── API_DOCUMENTATION.md              # API reference
├── COMPLETE_SETUP.md                 # Setup guide
├── CONFIDENCE_METRICS.md             # Metrics documentation
├── DEPLOYMENT.md                     # Deployment guide
└── README.md                         # This file (you are here)
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

### 4. Explore Advanced Concept Graph

```
1. Click 🌐 Network icon in chat header
2. Wait for AI to analyze (5-15 seconds)
3. Interactive graph with 8-15 concepts appears
4. Nodes sized by importance, colored by category

Interactions:
✨ Click nodes → Auto-ask questions
🔍 Search bar → Filter by keywords
📁 Category dropdown → Filter by type
🎨 Layout buttons → Switch algorithms
🗺️ MiniMap → Navigate large graphs
📊 Node details → View full metadata
💾 Export → Save visualization
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

### 2. Advanced Interactive Concept Graph

**AI Extraction Features:**
- 8-15 key concepts with metadata
- Importance scoring (1-10)
- 6 categories: Core Topic, Supporting Idea, Entity, Process, Outcome, Context
- 2-4 keywords per concept
- 8 relationship types with strength scoring
- Detailed descriptions for each relationship

**Visual Intelligence:**
- **Node Sizing**: Larger = more important
- **Color Coding**: Purple (Core), Blue (Supporting), Green (Entity), Orange (Process), Red (Outcome), Gray (Context)
- **Edge Styling**: Width = relationship strength, color = relationship type
- **Animations**: Click = pulse & highlight, strong connections = animated edges

**Layout Algorithms:**
1. **Force-Directed**: Physics-based natural clustering (D3-force simulation)
2. **Circular**: Radial layout with importance-based positioning
3. **Hierarchical**: 3-tier structure by importance levels

**Interactive Features:**
- **Search**: Find concepts by label, description, or keywords
- **Filter**: Show/hide by category
- **Details Panel**: Full metadata on click
- **MiniMap**: Overview and quick navigation
- **Export**: Save current view
- **Pan & Zoom**: Explore large graphs
- **Auto-Questions**: Click → instant question generation

**Usage:**
```
1. Click 🌐 icon in chat
2. AI extracts concepts (5-15 sec)
3. Choose layout (force/circular/hierarchical)
4. Search or filter as needed
5. Click nodes to explore
6. View details panel
7. Follow relationship chains
8. Export when done
```

**[📘 Full Documentation](./ADVANCED_CONCEPT_GRAPH.md)**

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

### Advanced Concept Graph Pipeline

```
1. User clicks graph button
   ↓
2. Backend retrieves all document chunks
   ↓
3. Chunks combined (up to 15,000 chars)
   ↓
4. Sent to Cohere with specialized prompt
   ↓
5. AI extracts (3000 token response):
   - 8-15 concepts with metadata
   - Importance scores (1-10)
   - Categories (6 types)
   - Keywords (2-4 per concept)
   - Relationships (8 types)
   - Strength scores (0-1)
   - Descriptions
   ↓
6. Parse & validate JSON
   ↓
7. Return to frontend
   ↓
8. Calculate layout (D3-force, circular, or hierarchical)
   ↓
9. Render with React Flow
   ↓
10. User interactions:
    - Search/filter
    - Click nodes
    - Switch layouts
    - View details
    - Export graph
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
- **Pulse**: Node highlights (clicked concepts)
- **Scale**: Hover effects, importance-based sizing
- **Flow**: Edge animations (strong relationships)
- **Flash**: Connected edge highlighting
- **Transform**: Layout transitions (0.3s ease)

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
Using AI to identify key topics, importance scores, categories, and relationships in text.

**Knowledge Graphs:**
Visual networks representing concepts (nodes) and their relationships (edges).

**Force-Directed Layout:**
Physics-based algorithm where nodes repel and links attract for natural clustering.

**Semantic Relationships:**
Typed connections (causes, requires, influences, etc.) that capture meaning between concepts.

