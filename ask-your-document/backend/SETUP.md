# Backend Setup Guide

## Prerequisites
- Python 3.8+
- Weaviate instance (local or cloud)
- Cohere API key

## Installation Steps

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory with the following content:

```env
# Cohere API Key (Required)
# Get your API key from: https://dashboard.cohere.com/api-keys
COHERE_API_KEY=your_cohere_api_key_here

# Weaviate Configuration (Optional - defaults to local instance)
WEAVIATE_URL=http://localhost:8080
# WEAVIATE_API_KEY=your_weaviate_api_key_here  # Only needed for Weaviate Cloud
```

### 3. Get Your Cohere API Key

1. Go to [Cohere Dashboard](https://dashboard.cohere.com/api-keys)
2. Sign up or log in
3. Copy your API key
4. Paste it in the `.env` file

### 4. Set Up Weaviate

#### Option A: Local Weaviate with Docker
```bash
docker run -d \
  -p 8080:8080 \
  -p 50051:50051 \
  weaviate/weaviate:latest
```

#### Option B: Weaviate Cloud
1. Go to [Weaviate Cloud Console](https://console.weaviate.cloud/)
2. Create a cluster
3. Get your cluster URL and API key
4. Update `.env` with your Weaviate credentials

### 5. Run the Application

```bash
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`

## Testing the API

Visit `http://127.0.0.1:8000/docs` for interactive API documentation.

## Troubleshooting

### Error: "No API key provided"
- Make sure you've created a `.env` file in the backend directory
- Verify the `COHERE_API_KEY` is set correctly
- Restart the server after updating the `.env` file

### Error: "Failed to connect to Weaviate"
- Make sure Weaviate is running (check with `docker ps` for local instance)
- Verify the `WEAVIATE_URL` in your `.env` file is correct

