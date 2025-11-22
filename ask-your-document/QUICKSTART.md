# Quick Start Guide

## 🚀 Fastest Way to Run (5 minutes)

### 1. Backend Setup

```powershell
# Navigate to backend
cd ask-your-document/backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys (see below)

# Start backend
uvicorn main:app --reload
```

### 2. Frontend Setup (New Terminal)

```powershell
# Navigate to frontend
cd ask-your-document/frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

### 3. Get Your API Keys

**Weaviate Cloud (Free):**

1. Visit: https://console.weaviate.cloud
2. Sign up → Create cluster
3. Copy Cluster URL & API Key

**OpenAI:**

1. Visit: https://platform.openai.com/api-keys
2. Create new API key
3. Copy key (starts with `sk-`)

**Alternative: Local Weaviate (No account needed)**

```powershell
docker run -d -p 8080:8080 cr.weaviate.io/semitechnologies/weaviate:latest
```

Then use: `WEAVIATE_URL=http://localhost:8080` (leave API key empty)

### 4. Configure .env

Edit `backend/.env`:

```env
# Weaviate Cloud
WEAVIATE_URL=https://your-cluster-xyz.weaviate.network
WEAVIATE_API_KEY=your-key-here

# OR Local Weaviate
# WEAVIATE_URL=http://localhost:8080
# WEAVIATE_API_KEY=

# OpenAI
OPENAI_API_KEY=sk-your-openai-key-here
```

### 5. Test It!

1. Open browser: http://localhost:5173
2. Upload a `.txt` file
3. Ask: "What is this document about?"
4. See answer with citations!

---

## 🐛 Quick Fixes

**Backend won't start:**

```powershell
# Check Python version (need 3.10+)
python --version

# Reinstall packages
pip install -r requirements.txt --force-reinstall
```

**Frontend won't start:**

```powershell
# Clear and reinstall
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json
npm install
```

**Can't connect to Weaviate:**

- Check your `.env` file has correct URL
- For Weaviate Cloud: Verify API key is correct
- For Local: Make sure Docker container is running

**OpenAI errors:**

- Verify API key is valid
- Check you have credits: https://platform.openai.com/usage

---

## 📁 Project Structure

```
ask-your-document/
├── backend/
│   ├── services/          # Core logic
│   ├── main.py           # FastAPI app
│   ├── requirements.txt  # Dependencies
│   └── .env             # Your API keys (create this)
│
├── frontend/
│   ├── src/             # React components
│   ├── package.json     # Dependencies
│   └── vite.config.ts   # Build config
│
└── README.md            # Full documentation
```

---

## 🎯 Competition Checklist

- [x] Document upload (.txt) ✅
- [x] Chat interface ✅
- [x] Text chunking ✅
- [x] Embeddings (OpenAI) ✅
- [x] Vector search (Weaviate) ✅
- [x] RAG pipeline ✅
- [x] Answer display ✅
- [x] Minimize hallucinations ✅
- [x] Source citations ✅ (optional feature)
- [x] PDF support ✅ (optional feature - ready to use)

---

## 💡 Tips

**Improve accuracy:**

- Use larger chunks (edit `document_processor.py`, line 5: `chunk_size=1000`)
- Retrieve more chunks (edit `main.py`, line 140: `limit=6`)
- Use GPT-4 instead of GPT-4o-mini (edit `rag_pipeline.py`, line 42: `model="gpt-4"`)

**Reduce costs:**

- Use local embeddings (Sentence Transformers)
- Use smaller chunk sizes
- Reduce retrieval limit

**Add features:**

- Multi-document: Store multiple session IDs per user
- Chat history: Save previous Q&A pairs
- Export conversation: Add download button

---

## 🆘 Need Help?

1. Check `README.md` for full documentation
2. API docs: http://localhost:8000/docs
3. Test API health: http://localhost:8000/health

**Common URLs:**

- Backend: http://localhost:8000
- Frontend: http://localhost:5173
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

---

**Good luck with your competition! 🚀**
