# Complete Setup Guide 🚀

## Quick Start

### Backend Setup

1. **Navigate to backend:**
```bash
cd ask-your-document/backend
```

2. **Create virtual environment:**
```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # Windows
# or
source .venv/bin/activate      # Mac/Linux
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Create `.env` file:**
```bash
# Create .env file in backend directory
COHERE_API_KEY=your_cohere_api_key_here
WEAVIATE_URL=http://localhost:8080
```

5. **Get Cohere API Key:**
- Go to https://dashboard.cohere.com/api-keys
- Sign up/login (free tier available)
- Copy your API key
- Paste it in `.env` file

6. **Start Weaviate (Docker):**
```bash
docker run -d -p 8080:8080 -p 50051:50051 weaviate/weaviate:latest
```

7. **Run backend:**
```bash
uvicorn main:app --reload
```

Backend running at: `http://localhost:8000` ✅

---

### Frontend Setup

1. **Navigate to frontend:**
```bash
cd ask-your-document/frontend
```

2. **Install dependencies:**
```bash
npm install
# or
pnpm install
# or
yarn install
```

3. **Start development server:**
```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Frontend running at: `http://localhost:5173` ✅

---

## Access the Application

1. **Open browser:** `http://localhost:5173`
2. **Upload documents** (.txt, .pdf, or .docx)
3. **Start chatting!** Ask questions in any language

---

## Features Overview

### ✨ What You Can Do:

#### 📁 File Management
- Upload multiple documents
- View all uploaded files
- Delete individual files
- Clear entire session

#### 💬 Smart Chat
- Ask questions across all documents
- Natural conversation (greetings, small talk)
- Get answers with source citations
- Multilingual (100+ languages)

#### 🎨 Beautiful UI
- Modern gradient design
- Smooth animations
- Responsive layout
- Drag & drop upload

---

## API Endpoints

### Upload
```bash
POST /upload
Form: file, session_id (optional)
```

### Chat
```bash
POST /chat
Form: question, session_id
```

### List Files
```bash
GET /sessions/{session_id}/files
```

### Delete File
```bash
DELETE /files/{file_id}
```

### Delete Session
```bash
DELETE /sessions/{session_id}
```

---

## Troubleshooting

### Backend Issues

**Error: "No API key provided"**
- Check `.env` file exists in backend folder
- Verify `COHERE_API_KEY` is set correctly
- Restart the server after updating `.env`

**Error: "Failed to connect to Weaviate"**
- Check if Docker is running: `docker ps`
- Verify Weaviate container is up: `docker ps | grep weaviate`
- Check port 8080 is not in use

**Error: "Module not found"**
- Make sure virtual environment is activated
- Run `pip install -r requirements.txt` again

### Frontend Issues

**Error: "Cannot connect to backend"**
- Check backend is running on port 8000
- Verify `API_URL` in `src/services/api.ts`

**Error: "Module not found"**
- Delete `node_modules` folder
- Run `npm install` again

**Port already in use:**
- Frontend: Change port in `vite.config.ts`
- Backend: Run with `uvicorn main:app --reload --port 8001`

---

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Weaviate** - Vector database
- **Cohere** - AI embeddings & chat
- **Python-DOCX** - DOCX file processing
- **PyPDF** - PDF file processing

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Axios** - HTTP client
- **Lucide React** - Icons

---

## Development

### Backend Development
```bash
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### View API Documentation
Open: `http://localhost:8000/docs`

---

## Production Deployment

### Backend
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
npm run build
# Serve dist folder with nginx or similar
```

---

## Support

For issues or questions:
1. Check API docs: `http://localhost:8000/docs`
2. Check backend logs in terminal
3. Check browser console (F12)

---

## What's Next?

### Try These:
1. Upload a PDF document
2. Ask: "What is this document about?"
3. Upload more documents
4. Ask questions across all files
5. Try different languages!

### Examples:
- **English**: "Summarize the main points"
- **French**: "Quel est le sujet principal?"
- **Arabic**: "ما هو الموضوع الرئيسي؟"
- **Casual**: "Hi!", "Thanks!", "Cool!"

---

## Enjoy! 🎉

You now have a fully functional, beautiful, multilingual document chat application! 🚀

