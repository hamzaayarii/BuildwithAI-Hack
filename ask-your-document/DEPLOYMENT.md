# Deployment Guide

## 🚀 Production Deployment Options

### Option 1: All-in-One (Fastest)

**Streamlit Cloud (Free)**

- Convert to single Streamlit app
- Deploy in 2 clicks
- No server management

### Option 2: Separated Backend + Frontend (Recommended)

**Backend: Railway / Render**
**Frontend: Vercel / Netlify**

---

## 📦 Backend Deployment

### Railway (Recommended - Free Tier)

1. **Install Railway CLI**

```powershell
npm i -g @railway/cli
```

2. **Login & Deploy**

```powershell
cd backend
railway login
railway init
railway add
```

3. **Set Environment Variables** (Railway Dashboard)

```
WEAVIATE_URL=https://your-cluster.weaviate.network
WEAVIATE_API_KEY=your-key
OPENAI_API_KEY=sk-your-key
```

4. **Add Procfile**

```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

5. **Deploy**

```powershell
railway up
```

Your API: `https://your-app.railway.app`

---

### Render (Alternative)

1. **Create `render.yaml`**

```yaml
services:
  - type: web
    name: ask-your-document-api
    env: python
    buildCommand: "pip install -r requirements.txt"
    startCommand: "uvicorn main:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: WEAVIATE_URL
        value: https://your-cluster.weaviate.network
      - key: WEAVIATE_API_KEY
        sync: false
      - key: OPENAI_API_KEY
        sync: false
```

2. **Push to GitHub**
3. **Connect to Render**: https://render.com
4. **Deploy**

---

## 🎨 Frontend Deployment

### Vercel (Recommended - Free)

1. **Update API URL in `src/services/api.ts`**

```typescript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
```

2. **Create `.env.production`**

```
VITE_API_URL=https://your-backend.railway.app
```

3. **Build**

```powershell
cd frontend
npm run build
```

4. **Deploy to Vercel**

```powershell
npm i -g vercel
vercel login
vercel --prod
```

Your app: `https://your-app.vercel.app`

---

### Netlify (Alternative)

1. **Create `netlify.toml`**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. **Deploy**

```powershell
npm i -g netlify-cli
netlify login
netlify deploy --prod
```

---

## 🐳 Docker Deployment

### Dockerize Backend

**Create `backend/Dockerfile`**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Create `backend/docker-compose.yml`**

```yaml
version: "3.8"

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - WEAVIATE_URL=${WEAVIATE_URL}
      - WEAVIATE_API_KEY=${WEAVIATE_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    env_file:
      - .env
```

**Run**

```powershell
docker-compose up -d
```

---

### Dockerize Frontend

**Create `frontend/Dockerfile`**

```dockerfile
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

**Create `frontend/nginx.conf`**

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
    }
}
```

---

## ☸️ Kubernetes Deployment

### Backend Deployment

**`k8s/backend-deployment.yaml`**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ask-doc-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ask-doc-backend
  template:
    metadata:
      labels:
        app: ask-doc-backend
    spec:
      containers:
        - name: api
          image: your-registry/ask-doc-backend:latest
          ports:
            - containerPort: 8000
          env:
            - name: WEAVIATE_URL
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: weaviate-url
            - name: WEAVIATE_API_KEY
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: weaviate-key
            - name: OPENAI_API_KEY
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: openai-key
---
apiVersion: v1
kind: Service
metadata:
  name: ask-doc-backend
spec:
  selector:
    app: ask-doc-backend
  ports:
    - port: 80
      targetPort: 8000
  type: LoadBalancer
```

---

## 🌐 CORS Configuration (Production)

Update `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app.vercel.app",
        "https://your-custom-domain.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔒 Security Checklist

### Backend

- [ ] Use HTTPS only
- [ ] Set strong API keys
- [ ] Rate limit endpoints
- [ ] Input validation
- [ ] File size limits
- [ ] Sanitize uploads

### Frontend

- [ ] Environment variables for API URL
- [ ] HTTPS only
- [ ] Content Security Policy
- [ ] XSS prevention

### Weaviate

- [ ] Use Weaviate Cloud (managed)
- [ ] Rotate API keys regularly
- [ ] Restrict network access

### OpenAI

- [ ] Set usage limits
- [ ] Monitor API usage
- [ ] Rotate keys monthly

---

## 📊 Monitoring

### Backend Health Checks

**Uptime Robot** (Free)

- Monitor: `https://your-api.com/health`
- Alert on downtime

**Better Stack** (Free tier)

- Real-time logs
- Error tracking

### Performance Monitoring

**Sentry** (Free tier)

```powershell
pip install sentry-sdk
```

**In `main.py`:**

```python
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    traces_sample_rate=0.1,
)
```

---

## 💰 Cost Estimates

### Free Tier (Hobby Project)

| Service                  | Cost                |
| ------------------------ | ------------------- |
| Weaviate Cloud (Sandbox) | Free                |
| OpenAI (Pay-as-you-go)   | ~$0.10/1K questions |
| Railway (Backend)        | Free 500 hrs/month  |
| Vercel (Frontend)        | Free                |
| **Total**                | **~$5-10/month**    |

### Production Tier

| Service                   | Cost                   |
| ------------------------- | ---------------------- |
| Weaviate Cloud (Standard) | $25/month              |
| OpenAI (GPT-4o-mini)      | ~$20/month (1M tokens) |
| Railway Pro               | $5/month               |
| Vercel Pro                | $20/month              |
| **Total**                 | **~$70/month**         |

---

## 🚀 Quick Deploy Script

**`deploy.sh`** (Linux/Mac)

```bash
#!/bin/bash

echo "🚀 Deploying Ask Your Document..."

# Backend
cd backend
railway up
echo "✅ Backend deployed"

# Frontend
cd ../frontend
npm run build
vercel --prod
echo "✅ Frontend deployed"

echo "🎉 Deployment complete!"
```

**`deploy.ps1`** (Windows)

```powershell
Write-Host "🚀 Deploying Ask Your Document..." -ForegroundColor Green

# Backend
Set-Location backend
railway up
Write-Host "✅ Backend deployed" -ForegroundColor Green

# Frontend
Set-Location ../frontend
npm run build
vercel --prod
Write-Host "✅ Frontend deployed" -ForegroundColor Green

Write-Host "🎉 Deployment complete!" -ForegroundColor Green
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

**`.github/workflows/deploy.yml`**

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          cd backend
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          cd frontend
          npm install
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 📝 Post-Deployment

### Test Production

1. **Health Check**

```powershell
curl https://your-api.com/health
```

2. **Upload Test**

```powershell
curl -X POST https://your-api.com/upload -F "file=@test.txt"
```

3. **Load Test** (Optional)

```powershell
npm i -g artillery
artillery quick --count 10 --num 100 https://your-api.com/health
```

---

## 🆘 Troubleshooting

**Build Fails:**

- Check Node/Python versions
- Verify dependencies installed
- Check environment variables

**CORS Errors:**

- Update `allow_origins` in `main.py`
- Verify frontend URL is correct

**Weaviate Connection:**

- Check API key is valid
- Verify cluster is running
- Test connection: `curl https://your-cluster.weaviate.network/v1/meta`

**High Costs:**

- Use GPT-4o-mini instead of GPT-4
- Reduce chunk retrieval limit
- Cache common queries
- Set OpenAI usage limits

---

## 🎯 Production Optimizations

1. **Add Redis caching** for repeated questions
2. **Implement rate limiting** (10 requests/min/user)
3. **Add logging** with Sentry or LogRocket
4. **Use CDN** for static assets
5. **Enable gzip compression**
6. **Lazy load components**
7. **Add request queuing** for high load
8. **Monitor costs** with alerts

---

**Ready to deploy! 🚀**
