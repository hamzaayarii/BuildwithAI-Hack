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
                "name": "file_id",
                "dataType": ["text"],
                "description": "Unique identifier for the file",
            },
            {
                "name": "session_id",
                "dataType": ["text"],
                "description": "The session ID for this upload",
            },
            {
                "name": "upload_date",
                "dataType": ["text"],
                "description": "Upload timestamp",
            },
            {
                "name": "file_size",
                "dataType": ["int"],
                "description": "Size of the original file in bytes",
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

def delete_file_documents(client, file_id: str):
    """Delete all chunks for a specific file"""
    client.batch.delete_objects(
        class_name="Documents",
        where={
            "path": ["file_id"],
            "operator": "Equal",
            "valueText": file_id
        }
    )

def get_session_files(client, session_id: str):
    """Get all unique files in a session"""
    response = (
        client.query
        .get("Documents", ["filename", "file_id", "upload_date", "file_size"])
        .with_where({
            "path": ["session_id"],
            "operator": "Equal",
            "valueText": session_id
        })
        .with_limit(1000)
        .do()
    )
    
    results = response.get("data", {}).get("Get", {}).get("Documents", [])
    
    # Get unique files
    files_dict = {}
    for doc in results:
        file_id = doc.get("file_id")
        if file_id and file_id not in files_dict:
            files_dict[file_id] = {
                "file_id": file_id,
                "filename": doc.get("filename"),
                "upload_date": doc.get("upload_date"),
                "file_size": doc.get("file_size", 0)
            }
    
    return list(files_dict.values())
