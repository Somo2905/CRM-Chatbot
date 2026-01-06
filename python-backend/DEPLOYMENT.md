# Deployment Guide

This guide covers deploying the Tekion RAG Chatbot to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Deployment Options](#deployment-options)
4. [Security Considerations](#security-considerations)
5. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

- Python 3.8+
- OpenAI API key
- 2GB+ RAM
- SSL certificate (for HTTPS)

## Environment Setup

### 1. Create Production Environment File

```bash
cp .env.example .env
```

Edit `.env` with production values:

```bash
# Required
OPENAI_API_KEY=your_production_api_key

# Production Settings
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=500

# Security
ENABLE_SECURITY_CHECK=True
MAX_QUERY_LENGTH=500
```

### 2. Install Dependencies

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Deployment Options

### Option 1: Docker Deployment (Recommended)

Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create necessary directories
RUN mkdir -p chroma_db logs

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  rag-chatbot:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
      - ./prompts:/app/prompts
      - ./chroma_db:/app/chroma_db
      - ./logs:/app/logs
    env_file:
      - .env
    restart: unless-stopped
```

Deploy:

```bash
docker-compose up -d
```

### Option 2: Systemd Service (Linux)

Create `/etc/systemd/system/rag-chatbot.service`:

```ini
[Unit]
Description=Tekion RAG Chatbot
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/rag-chatbot
Environment="PATH=/opt/rag-chatbot/venv/bin"
ExecStart=/opt/rag-chatbot/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable rag-chatbot
sudo systemctl start rag-chatbot
```

### Option 3: Cloud Platform Deployment

#### AWS Elastic Beanstalk

1. Install EB CLI: `pip install awsebcli`
2. Initialize: `eb init`
3. Create environment: `eb create production`
4. Deploy: `eb deploy`

#### Google Cloud Run

1. Install gcloud CLI
2. Build container: `gcloud builds submit --tag gcr.io/PROJECT-ID/rag-chatbot`
3. Deploy: `gcloud run deploy --image gcr.io/PROJECT-ID/rag-chatbot`

#### Azure App Service

1. Install Azure CLI
2. Create App Service: `az webapp create`
3. Deploy: `az webapp up`

## Security Considerations

### 1. HTTPS/TLS

Use a reverse proxy like Nginx:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. API Authentication

Add authentication middleware to `main.py`:

```python
from fastapi import Security, HTTPException
from fastapi.security.api_key import APIKeyHeader

API_KEY = "your-secure-api-key"
api_key_header = APIKeyHeader(name="X-API-Key")

async def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return api_key

# Add to endpoints:
@app.post("/api/v1/chat", dependencies=[Depends(verify_api_key)])
```

### 3. Rate Limiting

Install slowapi:

```bash
pip install slowapi
```

Add to `main.py`:

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(429, _rate_limit_exceeded_handler)

@app.post("/api/v1/chat")
@limiter.limit("10/minute")
async def chat(request: Request, chat_request: ChatRequest):
    # ... existing code
```

### 4. CORS Configuration

**IMPORTANT**: The default CORS configuration only allows `http://localhost:5173` (frontend). You MUST update this before production deployment.

Update CORS in production `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],  # Specific origins
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

### 5. Environment Variables

Never commit `.env` file. Use:
- AWS Secrets Manager
- Azure Key Vault
- Google Cloud Secret Manager
- HashiCorp Vault

## Monitoring and Maintenance

### 1. Logging

Add structured logging to `main.py`:

```python
import logging
from logging.handlers import RotatingFileHandler

# Configure logging
handler = RotatingFileHandler(
    'logs/app.log', 
    maxBytes=10000000, 
    backupCount=5
)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[handler]
)
```

### 2. Health Monitoring

Set up monitoring for:
- `/health` endpoint
- Response times
- Error rates
- API key usage

Use tools like:
- Prometheus + Grafana
- Datadog
- New Relic
- AWS CloudWatch

### 3. Backup Strategy

Backup important data:

```bash
# Backup vector database
tar -czf chroma_db_backup_$(date +%Y%m%d).tar.gz chroma_db/

# Backup documents
tar -czf data_backup_$(date +%Y%m%d).tar.gz data/

# Backup prompts
tar -czf prompts_backup_$(date +%Y%m%d).tar.gz prompts/
```

### 4. Update Strategy

1. Test in staging environment
2. Create backup
3. Deploy new version
4. Monitor for errors
5. Rollback if needed

### 5. Performance Optimization

- Use Redis for caching frequent queries
- Implement connection pooling
- Use async operations
- Scale horizontally with load balancer
- Monitor vector database size and optimize

## Troubleshooting

### Issue: High Memory Usage

**Solution**: Reduce embedding model size or use API-based embeddings

```python
# In config.py
embedding_model: str = "all-MiniLM-L6-v2"  # Smaller model
```

### Issue: Slow Response Times

**Solutions**:
1. Cache frequent queries
2. Reduce `top_k_results`
3. Optimize chunk size
4. Use faster LLM model

### Issue: Vector Store Corruption

**Solution**: Rebuild vector store

```bash
curl -X POST http://your-domain/api/v1/reload-documents
```

## Maintenance Checklist

- [ ] Daily: Check logs for errors
- [ ] Weekly: Review API usage and costs
- [ ] Monthly: Update dependencies
- [ ] Monthly: Backup all data
- [ ] Quarterly: Security audit
- [ ] Quarterly: Performance optimization review

## Support

For deployment issues:
1. Check logs: `tail -f logs/app.log`
2. Verify environment variables
3. Test endpoints: `curl http://localhost:8000/health`
4. Review GitHub issues

## Additional Resources

- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Let's Encrypt SSL](https://letsencrypt.org/)
