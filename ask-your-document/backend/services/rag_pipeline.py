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

def generate_answer(question: str, retrieved_chunks: List[Dict], filename: str) -> tuple[str, float]:
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
        Tuple of (answer, source_coverage_percentage)
        - answer: Generated answer with citations
        - source_coverage: Percentage of answer grounded in document (0-100)
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
        
        answer = response.text
        
        # Calculate source coverage based on citations and content
        source_coverage = calculate_source_coverage(answer, retrieved_chunks)
        
        return answer, source_coverage
    
    except Exception as e:
        return f"Error generating answer: {str(e)}", 0.0

def calculate_source_coverage(answer: str, retrieved_chunks: List[Dict]) -> float:
    """
    Calculate what percentage of the answer is grounded in the document.
    
    Args:
        answer: The generated answer
        retrieved_chunks: The chunks that were provided as context
    
    Returns:
        Percentage (0-100) indicating document grounding vs inference
    """
    if not retrieved_chunks:
        return 0.0
    
    # Count citation markers [Chunk X]
    import re
    citation_count = len(re.findall(r'\[Chunk \d+\]', answer))
    
    # Check for phrases indicating document usage
    document_phrases = [
        'according to', 'based on', 'the document', 'states that', 
        'mentions', 'indicates', 'shows that', 'explains', 'describes',
        'chunk', 'source', 'text says'
    ]
    document_indicators = sum(1 for phrase in document_phrases if phrase.lower() in answer.lower())
    
    # Check for phrases indicating inference/conversation
    inference_phrases = [
        'i think', 'i believe', 'generally', 'typically', 'usually',
        'in my understanding', 'it seems', 'probably', 'might be',
        "i don't know", 'not sure', 'unclear'
    ]
    inference_indicators = sum(1 for phrase in inference_phrases if phrase.lower() in answer.lower())
    
    # Short conversational answers are 0% document grounded
    if len(answer.split()) < 15 and not citation_count:
        # Likely a greeting or simple response
        return 0.0
    
    # Calculate coverage score
    # Heavy weight on citations, moderate on document phrases
    coverage_score = 0.0
    
    # Citations are strong indicators (up to 60%)
    if citation_count > 0:
        coverage_score += min(60, citation_count * 20)
    
    # Document phrases add confidence (up to 30%)
    if document_indicators > 0:
        coverage_score += min(30, document_indicators * 10)
    
    # Inference phrases reduce confidence
    coverage_score -= (inference_indicators * 10)
    
    # If answer contains significant chunk content, boost score
    total_context_length = sum(len(chunk.get('content', '')) for chunk in retrieved_chunks)
    if total_context_length > 0:
        # Check if answer contains substantial portions of chunk text
        chunk_overlap = 0
        for chunk in retrieved_chunks:
            chunk_content = chunk.get('content', '').lower()
            if chunk_content:
                # Sample some phrases from the chunk
                chunk_words = chunk_content.split()
                if len(chunk_words) > 5:
                    for i in range(len(chunk_words) - 5):
                        phrase = ' '.join(chunk_words[i:i+5])
                        if phrase in answer.lower():
                            chunk_overlap += 1
        
        if chunk_overlap > 0:
            coverage_score += min(20, chunk_overlap * 5)
    
    # Clamp between 0 and 100
    coverage_score = max(0, min(100, coverage_score))
    
    return round(coverage_score, 1)

def extract_concepts_and_relationships(chunks: List[str]) -> Dict:
    """
    Extract key concepts and their relationships from document chunks using Cohere.
    
    Args:
        chunks: List of text chunks from the document
    
    Returns:
        Dictionary with nodes (concepts) and edges (relationships)
    """
    try:
        co = get_cohere_client()
        
        # Combine chunks into analysis text (limit to avoid token limits)
        combined_text = "\n\n".join(chunks[:10])  # Analyze first 10 chunks
        if len(combined_text) > 5000:
            combined_text = combined_text[:5000]
        
        # Ask Cohere to extract concepts with advanced metadata
        prompt = f"""Analyze this document and extract key concepts with detailed metadata.

Document:
{combined_text}

Extract 8-15 concepts with:
1. Label: The concept name
2. Description: Brief explanation (1-2 sentences)
3. Importance: Score 1-10 (10 = most critical to understanding the document)
4. Category: One of [Core Topic, Supporting Idea, Entity, Process, Outcome, Context]
5. Keywords: 2-4 related terms

Then identify relationships with specific types:
- "causes" - X leads to Y
- "requires" - X needs Y
- "part_of" - X is component of Y
- "influences" - X affects Y
- "produces" - X creates Y
- "related_to" - General connection
- "contrasts" - X differs from Y
- "supports" - X reinforces Y

Output format (strict JSON):
{{
  "concepts": [
    {{
      "id": "concept1",
      "label": "Main Concept Name",
      "description": "Detailed description here",
      "importance": 10,
      "category": "Core Topic",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }}
  ],
  "relationships": [
    {{
      "source": "concept1",
      "target": "concept2",
      "type": "causes",
      "strength": 0.9,
      "description": "Brief explanation of relationship"
    }}
  ]
}}

Focus on the MOST important concepts. Output ONLY valid JSON, no markdown or extra text."""

        response = co.chat(
            model="command-r-plus-08-2024",
            message=prompt,
            temperature=0.3,
            max_tokens=3000
        )
        
        # Parse JSON response
        import json
        import re
        
        response_text = response.text.strip()
        
        # Extract JSON from response (in case AI added extra text)
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(0)
        
        graph_data = json.loads(response_text)
        
        # Validate and ensure we have the right structure
        if "concepts" not in graph_data:
            graph_data["concepts"] = []
        if "relationships" not in graph_data:
            graph_data["relationships"] = []
        
        # Add IDs and default values if missing
        for i, concept in enumerate(graph_data["concepts"]):
            if "id" not in concept:
                concept["id"] = f"concept{i+1}"
            if "label" not in concept:
                concept["label"] = f"Concept {i+1}"
            if "description" not in concept:
                concept["description"] = "No description"
            if "importance" not in concept:
                concept["importance"] = 5
            if "category" not in concept:
                concept["category"] = "Core Topic"
            if "keywords" not in concept:
                concept["keywords"] = []
        
        # Add default values for relationships
        for rel in graph_data["relationships"]:
            if "strength" not in rel:
                rel["strength"] = 0.7
            if "description" not in rel:
                rel["description"] = ""
        
        return graph_data
    
    except Exception as e:
        print(f"Error extracting concepts: {e}")
        # Return default structure
        return {
            "concepts": [
                {"id": "main", "label": "Document Main Topic", "description": "Central theme of the document"}
            ],
            "relationships": []
        }

def format_sources(retrieved_chunks: List[Dict]) -> List[Dict]:
    """Format source chunks for frontend display with confidence scores"""
    return [
        {
            "chunk_index": chunk["chunk_index"],
            "content": chunk["content"][:200] + "..." if len(chunk["content"]) > 200 else chunk["content"],
            "full_content": chunk["content"],
            "confidence": round(chunk.get("certainty", 0.0) * 100, 1),  # Convert to percentage
            "similarity_score": chunk.get("certainty", 0.0)
        }
        for chunk in retrieved_chunks
    ]
