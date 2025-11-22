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

def is_conversational_query(question: str) -> bool:
    """Check if the query is conversational rather than document-specific"""
    conversational_patterns = [
        'hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening',
        'bonjour', 'salut', 'bonsoir', 
        'مرحبا', 'السلام عليكم', 'أهلا',
        'how are you', 'comment allez-vous', 'كيف حالك',
        'thank', 'thanks', 'merci', 'شكرا',
        'who are you', 'what are you', 'qui es-tu', 'من أنت'
    ]
    question_lower = question.lower().strip()
    return any(pattern in question_lower for pattern in conversational_patterns)

def generate_answer(question: str, retrieved_chunks: List[Dict], filename: str) -> str:
    """
    Generate answer using RAG pipeline with retrieved chunks and Cohere.
    Supports multilingual questions and documents (English, French, Arabic, etc.)
    Can handle both conversational queries and document-specific questions.
    
    Args:
        question: User's question (in any supported language)
        retrieved_chunks: List of dicts with 'content' and 'chunk_index'
        filename: Name of the source document
    
    Returns:
        Generated answer with citations (in the same language as the question)
    """
    # Check if this is a conversational query
    is_casual = is_conversational_query(question)
    
    # Build context from retrieved chunks
    if retrieved_chunks:
        context = "\n\n".join([
            f"[Chunk {chunk['chunk_index'] + 1}]: {chunk['content']}" 
            for chunk in retrieved_chunks
        ])
        context_info = f"""
Document: {filename}

Retrieved context from document:
{context}
"""
    else:
        context_info = f"\nDocument: {filename}\n(No specific chunks retrieved for this query)"
    
    # Construct prompt based on query type
    if is_casual or not retrieved_chunks:
        # More conversational, friendly prompt
        prompt = f"""You are a friendly, helpful multilingual AI assistant that helps users understand their documents.

YOUR PERSONALITY:
- Warm, professional, and conversational
- Answer in the SAME LANGUAGE as the user's question (English, French, Arabic, etc.)
- Be helpful and engaging

YOUR CAPABILITIES:
- I can help you understand and analyze the document: "{filename}"
- I can answer questions about the content
- I can summarize, explain, and clarify information
- I speak multiple languages (English, French, Arabic, and more)

WHEN ANSWERING:
- If the user greets you or asks casual questions, respond naturally and warmly
- If they ask about the document, use the context provided
- If information isn't in the document, be honest about it
- Always be helpful and suggest what you CAN help with
{context_info}

User: {question}

Assistant (continue naturally in the same language):"""
    else:
        # Document-focused prompt with strict grounding
        prompt = f"""You are a precise multilingual document assistant.

IMPORTANT RULES:
1. Answer ONLY based on the provided document chunks
2. Answer in the SAME LANGUAGE as the question (English, French, Arabic, etc.)
3. If the answer is not in the chunks, say "I don't know based on the provided document" in the appropriate language
4. Always cite which chunk you used: [Chunk X]
5. Be concise and accurate
{context_info}

Question: {question}

Answer (with citations):"""
    
    try:
        co = get_cohere_client()
        response = co.chat(
            model="command-r-plus-08-2024",
            message=prompt,
            temperature=0.3 if is_casual else 0.1,
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
