import cohere
import os
from typing import List, Dict

# Lazy initialization of Cohere client
_cohere_client = None

def get_cohere_client():
    """Get or initialize Cohere client"""
    global _cohere_client
    if _cohere_client is None:
        api_key = os.getenv("COHERE_API_KEY")
        if not api_key:
            raise ValueError(
                "COHERE_API_KEY not found in environment variables. "
                "Please set it in your .env file or environment."
            )
        _cohere_client = cohere.Client(api_key=api_key)
    return _cohere_client

def get_embeddings(texts: List[str]) -> List[List[float]]:
    """Generate embeddings using Cohere with multilingual support"""
    co = get_cohere_client()
    response = co.embed(
        texts=texts,
        model="embed-multilingual-v3.0",  # Supports 100+ languages including English, French, Arabic
        input_type="search_document"
    )
    return response.embeddings

def get_query_embedding(query: str) -> List[float]:
    """Generate embedding for search query with multilingual support"""
    co = get_cohere_client()
    response = co.embed(
        texts=[query],
        model="embed-multilingual-v3.0",  # Supports 100+ languages including English, French, Arabic
        input_type="search_query"
    )
    return response.embeddings[0]

def generate_answer(question: str, retrieved_chunks: List[Dict], filename: str) -> str:
    """
    Generate answer using RAG pipeline with retrieved chunks and Cohere.
    Supports multilingual questions and documents (English, French, Arabic, etc.)
    Can handle both conversational queries and document-specific questions.
    Cohere's Chat API naturally handles greetings, small talk, and document questions.
    
    Args:
        question: User's question (in any supported language)
        retrieved_chunks: List of dicts with 'content' and 'chunk_index'
        filename: Name of the source document
    
    Returns:
        Generated answer with citations (in the same language as the question)
    """
    # Build context from retrieved chunks
    if retrieved_chunks:
        context = "\n\n".join([
            f"[Chunk {chunk['chunk_index'] + 1}]: {chunk['content']}" 
            for chunk in retrieved_chunks
        ])
        context_section = f"""

Document Context Available:
The user has uploaded a document: "{filename}"

Here are relevant sections from the document:
{context}
"""
    else:
        context_section = f"""

Document Context:
The user has uploaded a document: "{filename}"
(No specific sections were retrieved for this query)
"""
    
    # Unified prompt - let Cohere handle everything naturally
    prompt = f"""You are a friendly, helpful multilingual AI assistant with access to a user's document.

YOUR CAPABILITIES:
- You speak multiple languages: English, French, Arabic, and 100+ more
- You can chat naturally about anything (greetings, small talk, questions about yourself, etc.)
- You have access to the user's document and can answer questions about it
- ALWAYS respond in the SAME LANGUAGE the user is using

YOUR BEHAVIOR:
- Be warm, natural, and conversational
- For greetings (hi, hello, bonjour, etc.): Greet back warmly
- For acknowledgments (ok, nice, thanks, etc.): Respond naturally and positively
- For document questions: Use the document context provided below and cite sources [Chunk X]
- For general questions: Answer naturally without requiring the document
- For questions about yourself: Explain you're an AI assistant that can help with documents and chat

IMPORTANT RULES:
- When answering from the document, ALWAYS cite sources: [Chunk X]
- If a document question can't be answered from the context, say you don't find that information in the document
- For casual conversation (not about the document), chat freely without mentioning the document
{context_section}

User: {question}"""
    
    try:
        co = get_cohere_client()
        response = co.chat(
            model="command-r-plus-08-2024",
            message=prompt,
            temperature=0.5,  # Balanced temperature for both conversation and accuracy
            max_tokens=500
        )
        
        return response.text
    
    except Exception as e:
        return f"Error generating answer: {str(e)}"

def format_sources(retrieved_chunks: List[Dict]) -> List[Dict]:
    """Format source chunks for frontend display"""
    return [
        {
            "chunk_index": chunk["chunk_index"],
            "content": chunk["content"][:200] + "..." if len(chunk["content"]) > 200 else chunk["content"],
            "full_content": chunk["content"]
        }
        for chunk in retrieved_chunks
    ]
