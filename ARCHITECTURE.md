# Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                           USER INTERFACE                                │
│                      React + TypeScript + Vite                         │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │
│  │  Chat Interface  │  │ Admin Dashboard  │  │ Session History  │    │
│  │                  │  │                  │  │                  │    │
│  │ • Message Input  │  │ • Health Status  │  │ • View History   │    │
│  │ • Response View  │  │ • System Info    │  │ • Clear Session  │    │
│  │ • Suggestions    │  │ • Reload Docs    │  │ • Export Data    │    │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘    │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                    SMART ROUTING LAYER                           │ │
│  │                                                                  │ │
│  │  if (query.includes('book|schedule|appointment') && auth) {     │ │
│  │    → Node.js Backend (Actions)                                  │ │
│  │  } else {                                                        │ │
│  │    → Python Backend (RAG)                                       │ │
│  │  }                                                               │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                              │                    │
                              │                    │
                    ┌─────────┴─────┐    ┌────────┴─────────┐
                    │               │    │                  │
                    ▼               │    ▼                  │
┌──────────────────────────────┐   │  ┌─────────────────────────────┐
│                              │   │  │                             │
│    NODE.JS BACKEND           │   │  │     PYTHON BACKEND          │
│    Express + MongoDB         │   │  │     FastAPI + RAG           │
│    Port: 4000                │   │  │     Port: 8000              │
│                              │   │  │                             │
│  ┌────────────────────────┐  │   │  │  ┌───────────────────────┐  │
│  │  Authentication        │  │   │  │  │   RAG System          │  │
│  │  • JWT Tokens          │  │   │  │  │   • Query Processing  │  │
│  │  • User Sessions       │  │   │  │  │   • Vector Search     │  │
│  └────────────────────────┘  │   │  │  │   • LLM Generation    │  │
│                              │   │  │  └───────────────────────┘  │
│  ┌────────────────────────┐  │   │  │                             │
│  │  Conversations         │  │   │  │  ┌───────────────────────┐  │
│  │  • Start/End           │  │   │  │  │   Session Manager     │  │
│  │  • Message History     │  │   │  │  │   • History Storage   │  │
│  └────────────────────────┘  │   │  │  │   • Context Window    │  │
│                              │   │  │  └───────────────────────┘  │
│  ┌────────────────────────┐  │   │  │                             │
│  │  Actions               │  │   │  │  ┌───────────────────────┐  │
│  │  • Book Appointments   │  │   │  │  │   Security            │  │
│  │  • Schedule Services   │  │   │  │  │   • Input Validation  │  │
│  │  • Check Availability  │  │   │  │  │   • Output Sanitize   │  │
│  └────────────────────────┘  │   │  │  └───────────────────────┘  │
│                              │   │  │                             │
└──────────────────────────────┘   │  └─────────────────────────────┘
                │                  │                  │
                │                  │                  │
                ▼                  │                  ▼
        ┌──────────────┐           │          ┌─────────────────┐
        │   MongoDB    │           │          │  Vector Store   │
        │              │           │          │    (FAISS)      │
        │ • Customers  │           │          │                 │
        │ • Messages   │           │          │ • Embeddings    │
        │ • Vehicles   │           │          │ • Documents     │
        │ • Appts      │           │          │ • Chunks        │
        └──────────────┘           │          └─────────────────┘
                                   │                  │
                                   │                  ▼
                                   │          ┌─────────────────┐
                                   │          │   Ollama/LLM    │
                                   │          │                 │
                                   │          │ • qwen2.5:3b    │
                                   │          │ • Generation    │
                                   │          │ • Embedding     │
                                   │          └─────────────────┘
                                   │
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
            ┌───────▼────────┐           ┌────────▼────────┐
            │ Backend Status │           │  Error Handler  │
            │   Monitoring   │           │   & Fallback    │
            └────────────────┘           └─────────────────┘
```

## Data Flow

### 1. User Authentication Flow
```
User → Login Page → POST /api/auth/login → Node.js Backend
                                          ↓
                                    Validate Credentials
                                          ↓
                                    Generate JWT Token
                                          ↓
                                    Store in LocalStorage
                                          ↓
                                    Redirect to Chat
```

### 2. Informational Query Flow (RAG)
```
User Types Query → ChatbotContainer
                        ↓
              Check Query Type: INFO
                        ↓
              pythonChatService.sendMessage()
                        ↓
        POST /api/v1/chat → Python Backend
                        ↓
              Security Validation
                        ↓
         Retrieve Context from Vector Store
                        ↓
            Generate Response with LLM
                        ↓
              Sanitize Output
                        ↓
         Return Response + Session Info
                        ↓
        Display in Chat Interface
```

### 3. Action Query Flow (Booking)
```
User Types "Book appointment" → ChatbotContainer
                        ↓
              Check Query Type: ACTION
                        ↓
           Check Authentication: REQUIRED
                        ↓
              nodeChatService.sendMessage()
                        ↓
        POST /api/chat → Node.js Backend
                        ↓
              Validate Conversation
                        ↓
              Detect Intent: BOOK_SERVICE
                        ↓
         Execute Action: bookService()
                        ↓
         Update Database & Slots
                        ↓
         Return Confirmation
                        ↓
        Display in Chat Interface
```

## Component Hierarchy

```
App
├── BrowserRouter
│   └── AppRoutes
│       ├── Navigation Bar
│       │   ├── Links (Chatbot, Admin, History)
│       │   ├── BackendStatus Component
│       │   └── Auth Controls (Login/Logout)
│       │
│       └── Routes
│           ├── / → ChatbotContainer
│           │   ├── ChatHeader
│           │   ├── ChatMessages
│           │   │   └── MessageBubble[]
│           │   ├── ChatInput
│           │   └── ChatSidebar
│           │
│           ├── /login → LoginPage
│           ├── /signup → SignupPage
│           │
│           ├── /admin → AdminDashboard
│           │   ├── Health Status Card
│           │   ├── System Info Card
│           │   └── Document Management Card
│           │
│           └── /history → SessionHistoryViewer
│               ├── Load Session Form
│               └── History Display
```

## Service Layer Architecture

```
Frontend Components
        ↓
┌───────────────────────────────────┐
│     Service Layer (index.ts)      │
│                                   │
│  ┌─────────────────────────────┐ │
│  │   API Configuration         │ │
│  │   • Backend URLs            │ │
│  │   • Endpoints Map           │ │
│  │   • Auth Headers            │ │
│  └─────────────────────────────┘ │
│                                   │
│  ┌────────────────────────────┐  │
│  │  Node Backend Service      │  │
│  │  • authService             │  │
│  │  • conversationService     │  │
│  │  • nodeChatService         │  │
│  └────────────────────────────┘  │
│                                   │
│  ┌────────────────────────────┐  │
│  │  Python Backend Service    │  │
│  │  • pythonChatService       │  │
│  │  • sessionService          │  │
│  │  • healthService           │  │
│  │  • adminService            │  │
│  └────────────────────────────┘  │
└───────────────────────────────────┘
        ↓
    fetch() API
        ↓
Backend Endpoints
```

## Deployment Architecture

```
                    ┌──────────────────────┐
                    │   CDN / Edge Cache   │
                    │   (Static Assets)    │
                    └──────────────────────┘
                              ↓
                    ┌──────────────────────┐
                    │   Frontend Hosting   │
                    │   (Vercel/Netlify)   │
                    └──────────────────────┘
                              ↓
                    ┌──────────────────────┐
                    │   Load Balancer      │
                    └──────────────────────┘
                         ↓          ↓
        ┌────────────────┴───┐    ┌┴──────────────────┐
        │                    │    │                   │
┌───────▼──────────┐  ┌──────▼────────┐  ┌───────────▼────┐
│  Node.js Server  │  │  Node.js Srvr │  │  Python Server │
│  (Instance 1)    │  │  (Instance 2) │  │  (Container)   │
└──────────────────┘  └───────────────┘  └────────────────┘
        │                     │                    │
        └─────────┬───────────┘                    │
                  │                                │
        ┌─────────▼──────────┐          ┌─────────▼────────┐
        │  MongoDB Atlas     │          │  Vector Store    │
        │  (Managed DB)      │          │  + Ollama/GPT    │
        └────────────────────┘          └──────────────────┘
```

---

This architecture ensures:
✅ Scalability - Independent backend scaling
✅ Reliability - Health monitoring & fallbacks
✅ Performance - Smart routing & caching
✅ Security - JWT auth & input validation
✅ Maintainability - Clear separation of concerns
