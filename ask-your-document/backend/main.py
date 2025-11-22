from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.weaviate_client import get_weaviate_client, create_document_collection, delete_session_documents
from services.document_processor import process_document
from services.rag_pipeline import generate_answer, format_sources, get_embeddings, get_query_embedding
import uuid
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager

# Load environment variables
load_dotenv()

# Global Weaviate client
weaviate_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown"""
    global weaviate_client
    # Startup
    try:
        weaviate_client = get_weaviate_client()
        create_document_collection(weaviate_client)
        print("✅ Connected to Weaviate successfully")
    except Exception as e:
        print(f"❌ Failed to connect to Weaviate: {e}")
        raise
    
    yield
    
    # Shutdown
    if weaviate_client:
        weaviate_client = None

app = FastAPI(
    title="Ask Your Document API",
    description="RAG-based document Q&A system with Weaviate",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite and CRA default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Ask Your Document API is running",
        "status": "healthy",
        "weaviate_connected": weaviate_client is not None
    }

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload and process a document.
    
    - Parses .txt or .pdf files
    - Chunks the text
    - Stores embeddings in Weaviate
    - Returns session_id for subsequent queries
    """
    try:
        # Validate file type
        if not file.filename.lower().endswith(('.txt', '.pdf', '.docx')):
            raise HTTPException(
                status_code=400, 
                detail="Only .txt, .pdf, and .docx files are supported"
            )
        
        # Read file content
        content = await file.read()
        
        # Process document (parse and chunk)
        full_text, chunks = process_document(content, file.filename)
        
        if not chunks:
            raise HTTPException(
                status_code=400,
                detail="Document is empty or could not be parsed"
            )
        
        # Generate unique session ID
        session_id = str(uuid.uuid4())
        
        # Generate embeddings for all chunks using Cohere
        print(f"Generating embeddings for {len(chunks)} chunks...")
        chunk_embeddings = get_embeddings(chunks)
        
        # Store chunks in Weaviate using batch with manual vectors
        weaviate_client.batch.configure(batch_size=100)
        with weaviate_client.batch as batch:
            for i, (chunk, embedding) in enumerate(zip(chunks, chunk_embeddings)):
                batch.add_data_object(
                    data_object={
                        "content": chunk,
                        "chunk_index": i,
                        "filename": file.filename,
                        "session_id": session_id
                    },
                    class_name="Documents",
                    vector=embedding  # Manually provide Cohere embedding
                )
        
        return {
            "message": "Document uploaded and processed successfully",
            "session_id": session_id,
            "filename": file.filename,
            "total_chunks": len(chunks),
            "document_length": len(full_text)
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

@app.post("/chat")
async def chat(question: str = Form(...), session_id: str = Form(...)):
    """
    Answer a question about the uploaded document.
    
    - Embeds the question
    - Retrieves relevant chunks from Weaviate
    - Generates answer using OpenAI with retrieved context
    """
    try:
        if not question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        # Generate embedding for the question
        question_embedding = get_query_embedding(question)
        
        # Query Weaviate for relevant chunks using manual vector
        response = (
            weaviate_client.query
            .get("Documents", ["content", "chunk_index", "filename"])
            .with_near_vector({"vector": question_embedding})
            .with_where({
                "path": ["session_id"],
                "operator": "Equal",
                "valueText": session_id
            })
            .with_limit(4)
            .do()
        )
        
        results = response.get("data", {}).get("Get", {}).get("Documents", [])
        
        if not results:
            return {
                "answer": "No relevant information found in the document for this question.",
                "sources": [],
                "retrieved_chunks": 0
            }
        
        # Extract retrieved chunks
        retrieved_chunks = [
            {
                "content": obj["content"],
                "chunk_index": obj["chunk_index"],
                "filename": obj.get("filename", "unknown")
            }
            for obj in results
        ]
        
        filename = retrieved_chunks[0]["filename"] if retrieved_chunks else "document"
        
        # Generate answer using RAG pipeline
        answer = generate_answer(question, retrieved_chunks, filename)
        
        # Format sources for frontend
        sources = format_sources(retrieved_chunks)
        
        return {
            "answer": answer,
            "sources": sources,
            "retrieved_chunks": len(retrieved_chunks)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")

@app.delete("/session/{session_id}")
async def delete_session(session_id: str):
    """Delete all documents for a session"""
    try:
        delete_session_documents(weaviate_client, session_id)
        return {"message": f"Session {session_id} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting session: {str(e)}")

@app.get("/health")
async def health():
    """Detailed health check"""
    return {
        "status": "ok",
        "weaviate": "connected" if weaviate_client else "disconnected",
        "openai_key": "configured" if os.getenv("OPENAI_API_KEY") else "missing"
    }
