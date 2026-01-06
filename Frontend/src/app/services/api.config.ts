/**
 * API Configuration
 * Centralized configuration for both Node.js and Python backends
 */

export const API_CONFIG = {
  // Node.js Backend (Express)
  NODE_BACKEND: {
    BASE_URL: import.meta.env.VITE_NODE_BACKEND_URL || 'http://localhost:4000',
    ENDPOINTS: {
      AUTH: {
        LOGIN: '/api/auth/login',
        SIGNUP: '/api/auth/signup',
      },
      CONVERSATIONS: {
        START: '/api/conversations/start',
      },
      CHAT: '/api/chat',
    },
  },

  // Python Backend (FastAPI - RAG System)
  PYTHON_BACKEND: {
    BASE_URL: import.meta.env.VITE_PYTHON_BACKEND_URL || 'http://localhost:8000',
    ENDPOINTS: {
      ROOT: '/',
      HEALTH: '/health',
      CHAT: '/api/v1/chat',
      UI: '/api/v1/ui',
      SESSION: {
        CLEAR: '/api/v1/session/clear',
        HISTORY: '/api/v1/session/:sessionId/history',
      },
      ADMIN: {
        RELOAD_DOCUMENTS: '/api/v1/reload-documents',
        INFO: '/api/v1/info',
      },
    },
  },
};

/**
 * Get authorization header with token
 */
export function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: any): string {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
