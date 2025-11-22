import weaviate
import os
from weaviate.classes.config import Configure, Property, DataType

def get_weaviate_client():
    """Connect to Weaviate Cloud or local instance"""
    weaviate_url = os.getenv("WEAVIATE_URL", "http://localhost:8080")
    weaviate_key = os.getenv("WEAVIATE_API_KEY")
    cohere_key = os.getenv("COHERE_API_KEY")
    
    # Build additional headers only if Cohere key exists
    additional_headers = {}
    if cohere_key:
        additional_headers["X-Cohere-Api-Key"] = cohere_key
    
    if weaviate_key:
        # Weaviate Cloud
        client = weaviate.Client(
            url=weaviate_url,
            auth_client_secret=weaviate.AuthApiKey(api_key=weaviate_key),
            additional_headers=additional_headers if additional_headers else None
        )
        return client
    else:
        # Local Weaviate
        client = weaviate.Client(
            url=weaviate_url,
            additional_headers=additional_headers if additional_headers else None
        )
        return client

def create_document_collection(client):
    """Create Documents collection with manual vectorization (Cohere embeddings)"""
    collection_name = "Documents"
    
    # Check if collection exists
    try:
        client.schema.get(collection_name)
        print(f"Collection '{collection_name}' already exists")
        return
    except:
        pass
    
    # Create collection without automatic vectorizer (we'll provide vectors manually)
    class_obj = {
        "class": collection_name,
        "vectorizer": "none",  # Manual vectorization with Cohere
        "properties": [
            {
                "name": "content",
                "dataType": ["text"],
                "description": "The text content of the document chunk",
            },
            {
                "name": "chunk_index",
                "dataType": ["int"],
                "description": "The index of this chunk in the document",
            },
            {
                "name": "filename",
                "dataType": ["text"],
                "description": "The name of the source document",
            },
            {
                "name": "session_id",
                "dataType": ["text"],
                "description": "The session ID for this upload",
            },
        ]
    }
    
    client.schema.create_class(class_obj)
    print(f"Collection '{collection_name}' created successfully with manual vectorization")

def delete_session_documents(client, session_id: str):
    """Delete all documents for a given session"""
    client.batch.delete_objects(
        class_name="Documents",
        where={
            "path": ["session_id"],
            "operator": "Equal",
            "valueText": session_id
        }
    )
