# CRM Chatbot - Frontend Integration Guide

## Overview

This frontend application integrates with **two backend systems**:
1. **Node.js Backend** (Express + MongoDB) - Handles authentication, conversations, and actions
2. **Python Backend** (FastAPI + RAG) - Handles AI-powered chat responses using RAG (Retrieval Augmented Generation)

## Backend Endpoints

### Node.js Backend (Port 3000)

#### Authentication Endpoints
- **POST** `/api/auth/login`
  - Login with phone and driver's license last 4 digits
  - Request: `{ phone: string, dlLast4: string }`
  - Response: `{ token: string, customer: { id: string, name: string } }`

- **POST** `/api/auth/signup`
  - Create new customer account
  - Request: `{ name: string, phone: string, dlLast4: string }`
  - Response: `{ token: string, customer: { id: string, name: string } }`

#### Conversation Endpoints
- **POST** `/api/conversations/start` (requires auth)
  - Start a new conversation and close any active ones
  - Response: `{ conversationId: string }`

#### Chat Endpoints
- **POST** `/api/chat` (requires auth)
  - Send message for action-based queries (booking, scheduling)
  - Request: `{ conversationId: string, message: string }`
  - Response: `{ type: 'RAG'|'ACTION', reply: string, data?: any }`

---

### Python Backend (Port 8000)

#### Root & Health Endpoints
- **GET** `/`
  - Welcome message and API information

- **GET** `/health`
  - Health check endpoint
  - Response: `{ status: string, app_name: string, version: string }`

#### Chat Endpoints (RAG)
- **POST** `/api/v1/chat`
  - Main RAG chat endpoint for informational queries
  - Request:
    ```json
    {
      "query": "string",
      "session_id": "string (optional)",
      "user_data": { "customer_id": "string", ... } (optional),
      "additional_context": "string (optional)"
    }
    ```
  - Response:
    ```json
    {
      "response": "string",
      "session_id": "string",
      "context_used": number,
      "memory_size": number,
      "status": "string"
    }
    ```

#### Session Endpoints
- **POST** `/api/v1/session/clear`
  - Clear conversation history for a session
  - Request: `{ session_id: string }`
  - Response: `{ status: string, message: string }`

- **GET** `/api/v1/session/{session_id}/history`
  - Get conversation history for a session
  - Response:
    ```json
    {
      "session_id": "string",
      "history": [{ "role": "string", "content": "string" }],
      "message_count": number,
      "status": "string"
    }
    ```

#### Admin Endpoints
- **POST** `/api/v1/reload-documents`
  - Reload RAG documents and rebuild vector store
  - Response: `{ status: string, message: string }`

- **GET** `/api/v1/info`
  - Get RAG system configuration information
  - Response:
    ```json
    {
      "app_name": "string",
      "version": "string",
      "model": "string",
      "embedding_model": "string",
      "top_k_results": number,
      "security_enabled": boolean
    }
    ```

## Frontend Architecture

### Services Layer

#### `api.config.ts`
Central configuration for both backends with endpoint definitions and utility functions.

#### `nodeBackendService.ts`
Handles all Node.js backend interactions:
- `authService` - Authentication (login, signup, logout)
- `conversationService` - Conversation management
- `nodeChatService` - Action-based chat queries

#### `pythonBackendService.ts`
Handles all Python backend interactions:
- `pythonChatService` - RAG chat queries
- `sessionService` - Session management and history
- `healthService` - Health checks and system info
- `adminService` - Document reloading

### Components

#### Chat Components
- `ChatbotContainer.tsx` - Main chat interface with dual-backend integration
- `ChatHeader.tsx` - Chat header with controls
- `ChatMessages.tsx` - Message display
- `ChatInput.tsx` - Message input
- `ChatSidebar.tsx` - Conversation list sidebar

#### Admin Components
- `AdminDashboard.tsx` - Admin panel for Python RAG backend
  - System health monitoring
  - Configuration viewing
  - Document reloading

- `SessionHistoryViewer.tsx` - View and manage session history
  - Load session history
  - Clear sessions

#### Pages
- `LoginPage.jsx` - Customer login (phone + DL last 4)
- `SignupPage.jsx` - Customer registration
- `App.tsx` - Main app with routing

### Chat Flow Logic

The frontend intelligently routes queries to the appropriate backend:

1. **Action Queries** (authenticated users)
   - Queries containing: "book", "schedule", "appointment"
   - Routed to: Node.js backend
   - Uses: Conversation ID + Auth Token
   - Returns: Structured action responses

2. **Informational Queries**
   - All other queries
   - Routed to: Python RAG backend
   - Uses: Session ID (auto-generated)
   - Returns: AI-generated responses with RAG context

## Environment Configuration

Create a `.env` file in the Frontend directory:

```env
# Node.js Backend (Express/MongoDB)
VITE_NODE_BACKEND_URL=http://localhost:4000

# Python Backend (FastAPI RAG System)
VITE_PYTHON_BACKEND_URL=http://localhost:8000
```

## Running the Application

### 1. Start Node.js Backend
```bash
cd backend
npm install
node server.js
```

### 2. Start Python Backend
```bash
cd python-backend
pip install -r requirements.txt
python main.py
```

### 3. Start Frontend
```bash
cd Frontend
npm install
npm run dev
```

## Features

### User Features
- ✅ Customer authentication (login/signup)
- ✅ Dual-backend chat integration
- ✅ Intelligent query routing
- ✅ Action-based queries (booking, scheduling)
- ✅ Informational queries (RAG-powered)
- ✅ Conversation history
- ✅ Session management

### Admin Features
- ✅ System health monitoring
- ✅ RAG configuration viewing
- ✅ Document reloading
- ✅ Session history viewing
- ✅ Session clearing

## API Integration Examples

### Login Example
```typescript
import { authService } from './services';

const handleLogin = async () => {
  try {
    const response = await authService.login({
      phone: '5551234567',
      dlLast4: '1234'
    });
    console.log('Logged in:', response.customer.name);
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Chat Example
```typescript
import { pythonChatService } from './services';

const handleChat = async () => {
  try {
    const response = await pythonChatService.sendMessage({
      query: 'What are the maintenance requirements for my vehicle?',
      session_id: pythonChatService.getSessionId()
    });
    console.log('AI Response:', response.response);
  } catch (error) {
    console.error('Chat failed:', error);
  }
};
```

### Admin Actions Example
```typescript
import { adminService, healthService } from './services';

const checkSystemHealth = async () => {
  const health = await healthService.checkHealth();
  console.log('Health:', health.status);
  
  const info = await healthService.getInfo();
  console.log('Model:', info.model);
};

const reloadDocuments = async () => {
  const response = await adminService.reloadDocuments();
  console.log('Success:', response.message);
};
```

## Deployment Notes

### Environment Variables (Production)
Update `.env` with production URLs:
```env
VITE_NODE_BACKEND_URL=https://your-node-backend.com
VITE_PYTHON_BACKEND_URL=https://your-python-backend.com
```

### CORS Configuration
Ensure both backends allow your frontend origin:

**Node.js Backend:**
```javascript
app.use(cors({
  origin: 'https://your-frontend.com'
}));
```

**Python Backend:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS settings allow your frontend origin
   - Check that credentials are being sent correctly

2. **Authentication Fails**
   - Verify token is stored in localStorage
   - Check token expiration (1 hour default)

3. **Chat Not Working**
   - Verify both backends are running
   - Check network tab for failed requests
   - Ensure environment variables are set

4. **Python Backend Connection Failed**
   - Check if Python backend is running on port 8000
   - Verify Ollama/LLM service is available
   - Check Python backend logs

## Tech Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Node.js Backend**: Express + MongoDB + JWT
- **Python Backend**: FastAPI + LangChain + FAISS + Ollama
- **UI Components**: shadcn/ui

## License

MIT
