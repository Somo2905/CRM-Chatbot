# CRM Chatbot - Complete Integration

A full-stack CRM chatbot application with dual-backend architecture, featuring AI-powered conversations using RAG (Retrieval Augmented Generation) and action-based functionality.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React + TypeScript)                │
│  - Intelligent dual-backend routing                             │
│  - Real-time chat interface                                     │
│  - Admin dashboard                                              │
│  - Session management                                           │
└─────────────────────────────────────────────────────────────────┘
                          │              │
                          │              │
            ┌─────────────┴──┐      ┌───┴──────────────┐
            │                │      │                   │
            ▼                │      ▼                   │
┌──────────────────────┐    │  ┌──────────────────────┐│
│  Node.js Backend     │    │  │  Python Backend      ││
│  (Express + MongoDB) │    │  │  (FastAPI + RAG)     ││
│                      │    │  │                      ││
│ • Authentication     │    │  │ • AI Chat (RAG)      ││
│ • Conversations      │    │  │ • Vector Store       ││
│ • Actions/Booking    │    │  │ • LLM Integration    ││
│ • Customer Data      │    │  │ • Session History    ││
└──────────────────────┘    │  └──────────────────────┘│
                            │                           │
                            ▼                           ▼
                    ┌──────────────┐         ┌──────────────────┐
                    │   MongoDB    │         │ Ollama/LLM + FAISS│
                    └──────────────┘         └──────────────────┘
```

## ✨ Features

### 🔐 Authentication
- Customer login with phone number and driver's license last 4 digits
- Secure JWT-based authentication
- Session management

### 💬 Intelligent Chat
- **Dual-backend routing**: Automatically routes queries to the appropriate backend
  - Action queries (booking, scheduling) → Node.js backend
  - Informational queries → Python RAG backend
- Context-aware conversations
- Suggestion chips for quick actions

### 🎯 Action Support
- Book service appointments
- Schedule test drives
- Check vehicle inventory
- View customer information

### 🧠 AI-Powered Responses
- RAG-based information retrieval
- Context from automotive knowledge base
- Semantic search with FAISS vector store
- Powered by Ollama/LLM

### 👨‍💼 Admin Dashboard
- System health monitoring
- RAG configuration viewing
- Document reloading for knowledge base updates
- Session history management

## 📦 Project Structure

```
CRM_ChatBot/
├── Frontend/                    # React + TypeScript frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/     # React components
│   │   │   │   ├── ChatbotContainer.tsx
│   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   ├── SessionHistoryViewer.tsx
│   │   │   │   ├── BackendStatus.tsx
│   │   │   │   └── ...
│   │   │   ├── services/       # API integration layer
│   │   │   │   ├── api.config.ts
│   │   │   │   ├── nodeBackendService.ts
│   │   │   │   ├── pythonBackendService.ts
│   │   │   │   └── index.ts
│   │   │   ├── pages/          # Page components
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── SignupPage.jsx
│   │   │   └── App.tsx
│   │   └── ...
│   ├── .env                    # Environment configuration
│   ├── INTEGRATION.md          # Detailed integration guide
│   └── SUMMARY.md              # Implementation summary
│
├── backend/                     # Node.js + Express backend
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   ├── conversationController.js
│   │   └── appointmentController.js
│   ├── models/
│   │   ├── Customer.js
│   │   ├── Conversation.js
│   │   ├── Message.js
│   │   └── ...
│   ├── routes/
│   ├── services/
│   └── server.js
│
└── python-backend/              # Python + FastAPI backend
    ├── main.py                 # FastAPI application
    ├── rag_system.py           # RAG implementation
    ├── security.py             # Input validation
    ├── config.py               # Configuration
    └── requirements.txt
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- MongoDB (local or cloud)
- Ollama (for local LLM) or OpenAI API key

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CRM_ChatBot
```

### 2. Set Up Node.js Backend

```bash
cd backend
npm install

# Create .env file
echo "MONGODB_URI=mongodb://localhost:27017/crm_chatbot" > .env
echo "JWT_SECRET=your-secret-key-here" >> .env

# Start the server
node server.js
```

The Node.js backend will run on `http://localhost:4000`

### 3. Set Up Python Backend

```bash
cd python-backend
pip install -r requirements.txt

# Create .env file (if using OpenAI instead of Ollama)
echo "LLM_PROVIDER=openai" > .env
echo "OPENAI_API_KEY=your-api-key" >> .env

# Or use Ollama (default - no API key needed)
# Make sure Ollama is running: ollama serve

# Start the server
python main.py
```

The Python backend will run on `http://localhost:8000`

### 4. Set Up Frontend

```bash
cd Frontend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your backend URLs (defaults are fine for local dev)
# VITE_NODE_BACKEND_URL=http://localhost:4000
# VITE_PYTHON_BACKEND_URL=http://localhost:8000

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📚 API Documentation

### Node.js Backend Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Customer login |
| POST | `/api/auth/signup` | No | Customer registration |
| POST | `/api/conversations/start` | Yes | Start new conversation |
| POST | `/api/chat` | Yes | Send chat message (actions) |

### Python Backend Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |
| POST | `/api/v1/chat` | No | RAG chat query |
| POST | `/api/v1/session/clear` | No | Clear session history |
| GET | `/api/v1/session/{id}/history` | No | Get session history |
| POST | `/api/v1/reload-documents` | No | Reload RAG documents |
| GET | `/api/v1/info` | No | System information |

For detailed API documentation, see [Frontend/INTEGRATION.md](Frontend/INTEGRATION.md)

## 🎨 Frontend Features

### Components

1. **ChatbotContainer** - Main chat interface with intelligent routing
2. **AdminDashboard** - System monitoring and management
3. **SessionHistoryViewer** - View and manage conversation history
4. **BackendStatus** - Real-time backend connection status
5. **LoginPage/SignupPage** - Authentication pages

### Service Layer

The frontend includes a comprehensive service layer for both backends:

```typescript
import { 
  authService,           // Authentication
  conversationService,   // Conversation management
  nodeChatService,       // Node.js chat
  pythonChatService,     // Python RAG chat
  sessionService,        // Session management
  healthService,         // Health checks
  adminService          // Admin functions
} from './services';
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env):**
```env
VITE_NODE_BACKEND_URL=http://localhost:4000
VITE_PYTHON_BACKEND_URL=http://localhost:8000
```

**Node.js Backend (.env):**
```env
MONGODB_URI=mongodb://localhost:27017/crm_chatbot
JWT_SECRET=your-secret-key-here
PORT=3000
```

**Python Backend (.env):**
```env
LLM_PROVIDER=ollama
OLLAMA_MODEL=qwen2.5:3b
OLLAMA_BASE_URL=http://localhost:11434
# OR for OpenAI:
# LLM_PROVIDER=openai
# OPENAI_API_KEY=your-key-here
```

## 🧪 Testing

### Test Authentication
```bash
# Sign up a new customer
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","phone":"5551234567","dlLast4":"1234"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"5551234567","dlLast4":"1234"}'
```

### Test RAG Chat
```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"What maintenance does my car need?"}'
```

## 📖 Usage Examples

### Login Flow
1. Navigate to `/login`
2. Enter phone number and driver's license last 4 digits
3. Click "Sign In"
4. Redirected to chat interface

### Chat Flow
1. Type message in chat input
2. **Action queries** (e.g., "Book a service") → Node.js backend
3. **Info queries** (e.g., "What oil does my car need?") → Python RAG
4. View response with suggestions

### Admin Flow
1. Navigate to `/admin`
2. View system health and configuration
3. Click "Reload Documents" to update RAG knowledge base
4. Monitor backend status in header

## 🚢 Deployment

### Frontend
```bash
cd Frontend
npm run build
# Deploy dist/ folder to your hosting service
```

### Backend (Node.js)
```bash
cd backend
# Set production environment variables
# Deploy to your Node.js hosting service (Heroku, Railway, etc.)
```

### Backend (Python)
```bash
cd python-backend
# Set production environment variables
# Deploy to your Python hosting service (Railway, Render, etc.)
```

### CORS Configuration
Update CORS settings in both backends to allow your production frontend URL.

## 🐛 Troubleshooting

### Backend not connecting
- Check if both backends are running
- Verify environment variables are set
- Check CORS configuration
- Look at backend logs for errors

### Chat not working
- Ensure you're logged in for action queries
- Check browser console for errors
- Verify backend endpoints in network tab
- Check backend status indicator in header

### RAG responses poor quality
- Reload documents in admin dashboard
- Check Ollama is running (for local setup)
- Verify embedding model is downloaded
- Review Python backend logs

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For detailed integration documentation, see:
- [Frontend/INTEGRATION.md](Frontend/INTEGRATION.md) - Complete API guide
- [Frontend/SUMMARY.md](Frontend/SUMMARY.md) - Implementation summary

---

**Built with ❤️ using React, Node.js, Python, FastAPI, and LangChain**
