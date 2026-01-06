/**
 * Central API Services Export
 * Import all backend services from a single location
 */

// Configuration
export { API_CONFIG, getAuthHeader, handleApiError } from './api.config';

// Node.js Backend Services
export {
  authService,
  conversationService,
  nodeChatService,
  type LoginRequest,
  type SignupRequest,
  type AuthResponse,
  type StartConversationResponse,
  type ChatRequest,
  type ChatResponse,
} from './nodeBackendService';

// Python Backend Services
export {
  pythonChatService,
  sessionService,
  healthService,
  adminService,
  type PythonChatRequest,
  type PythonChatResponse,
  type SessionHistoryResponse,
  type ClearSessionRequest,
  type ClearSessionResponse,
  type SystemInfoResponse,
  type HealthResponse,
  type ReloadDocumentsResponse,
} from './pythonBackendService';
