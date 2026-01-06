# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies (2 mins)

```bash
# Terminal 1 - Node.js Backend
cd backend
npm install

# Terminal 2 - Python Backend  
cd python-backend
pip install -r requirements.txt

# Terminal 3 - Frontend
cd Frontend
npm install
```

### Step 2: Configure Environment (1 min)

**Backend/.env:**
```bash
cd backend
echo "MONGODB_URI=mongodb://localhost:27017/crm_chatbot" > .env
echo "JWT_SECRET=my-secret-key-123" >> .env
```

**Frontend/.env:**
```bash
cd Frontend
cp .env.example .env
# Use default values for local development
```

### Step 3: Start Services (2 mins)

```bash
# Terminal 1 - MongoDB (if not running)
mongod

# Terminal 2 - Node.js Backend
cd backend
node server.js
# ✅ Running on http://localhost:4000

# Terminal 3 - Python Backend
cd python-backend
python main.py
# ✅ Running on http://localhost:8000

# Terminal 4 - Frontend
cd Frontend
npm run dev
# ✅ Running on http://localhost:5173
```

## 🎯 Test It Out

### 1. Open Browser
Navigate to: `http://localhost:5173`

### 2. Create Account
1. Click "Sign up"
2. Enter:
   - Name: "Test User"
   - Phone: "5551234567"
   - DL Last 4: "1234"
3. Click "Create Account"

### 3. Try Chat
**Test Action Query:**
```
Book a service appointment
```
➡️ Routes to Node.js backend

**Test Info Query:**
```
What maintenance does my car need?
```
➡️ Routes to Python RAG backend

### 4. Check Admin Dashboard
1. Navigate to `/admin`
2. View system health
3. See RAG configuration

## 📊 Backend Status Check

Look for the status indicator in the top-right corner of the navigation bar:
- 🟢 Green = Both backends online
- 🟡 Yellow = One backend offline  
- 🔴 Red = Both backends offline

## 🔧 Common Issues & Fixes

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
mongod
# Or use MongoDB Atlas connection string
```

### Python Backend Won't Start
```bash
# Install Ollama first
brew install ollama  # macOS
# or download from https://ollama.ai

# Start Ollama
ollama serve

# Pull the model
ollama pull qwen2.5:3b
```

### Frontend Can't Connect
```bash
# Check .env has correct URLs
cat Frontend/.env

# Should see:
# VITE_NODE_BACKEND_URL=http://localhost:4000
# VITE_PYTHON_BACKEND_URL=http://localhost:8000
```

### CORS Errors
Both backends are configured for `localhost:4000` and `localhost:5173` by default.
If using different ports, update CORS settings in:
- `backend/app.js`
- `python-backend/main.py`

## 📱 What to Test

### ✅ Authentication
- [x] Sign up new user
- [x] Login with credentials
- [x] Logout

### ✅ Chat
- [x] Send informational query
- [x] Send action query (booking)
- [x] View suggestions
- [x] Check conversation history

### ✅ Admin
- [x] View system health
- [x] Check RAG configuration
- [x] Reload documents
- [x] View session history

## 🎨 Features Overview

### Intelligent Routing
The frontend automatically detects query type:
- **"book"**, **"schedule"**, **"appointment"** → Node.js
- Everything else → Python RAG

### Dual Backend Integration
```typescript
// Action queries (authenticated)
nodeChatService.sendMessage({
  conversationId: 'abc123',
  message: 'Book a service'
});

// Info queries (anyone)
pythonChatService.sendMessage({
  query: 'What oil does my car need?',
  session_id: 'session_xyz'
});
```

## 📖 Next Steps

1. **Read Full Docs**: See [README.md](./README.md)
2. **API Details**: Check [Frontend/INTEGRATION.md](Frontend/INTEGRATION.md)
3. **Customize**: Modify components in `Frontend/src/app/components/`
4. **Add Data**: Put documents in `python-backend/data/` and reload

## 💡 Pro Tips

1. **Keep Ollama Running**: Background service for RAG responses
2. **Use Admin Dashboard**: Monitor health and reload documents
3. **Check Browser Console**: See API calls and responses
4. **Review Backend Logs**: Troubleshoot issues quickly

## 🆘 Still Stuck?

1. Check all services are running (4 terminals)
2. Verify environment variables are set
3. Look at browser console for errors
4. Check backend terminal output
5. Ensure MongoDB and Ollama are running

---

**Ready to build something awesome! 🚀**
