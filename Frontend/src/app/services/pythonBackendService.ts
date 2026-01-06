/**
 * Python Backend Service (FastAPI RAG System)
 * Handles all interactions with the Python FastAPI backend for RAG chat
 */

import { API_CONFIG, handleApiError } from './api.config';

const { BASE_URL, ENDPOINTS } = API_CONFIG.PYTHON_BACKEND;

// ============================================================================
// Types
// ============================================================================

export interface PythonChatRequest {
  query: string;
  session_id?: string;
  user_data?: {
    customer_id?: string;
    name?: string;
    [key: string]: any;
  };
  additional_context?: string;
}

export interface PythonChatResponse {
  response: string;
  session_id: string;
  context_used: number;
  memory_size: number;
  status: string;
}

export interface SessionHistoryResponse {
  session_id: string;
  history: Array<{
    role: string;
    content: string;
  }>;
  message_count: number;
  status: string;
}

export interface ClearSessionRequest {
  session_id: string;
}

export interface ClearSessionResponse {
  status: string;
  message: string;
}

export interface SystemInfoResponse {
  app_name: string;
  version: string;
  model: string;
  embedding_model: string;
  top_k_results: number;
  security_enabled: boolean;
}

export interface HealthResponse {
  status: string;
  app_name: string;
  version: string;
}

export interface ReloadDocumentsResponse {
  status: string;
  message: string;
}

// ============================================================================
// Python Chat Service (RAG)
// ============================================================================

export const pythonChatService = {
  /**
   * Send a chat message to the RAG system
   */
  async sendMessage(request: PythonChatRequest): Promise<PythonChatResponse> {
    try {
      const response = await fetch(`${BASE_URL}${ENDPOINTS.CHAT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to send message to RAG system');
      }

      const data: PythonChatResponse = await response.json();
      
      // Store the session_id returned by the backend for future requests
      if (data.session_id) {
        localStorage.setItem('pythonSessionId', data.session_id);
      }
      
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get or create session ID for Python backend
   */
  getSessionId(): string {
    let sessionId = localStorage.getItem('pythonSessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('pythonSessionId', sessionId);
    }
    return sessionId;
  },

  /**
   * Clear current session
   */
  clearCurrentSession(): void {
    localStorage.removeItem('pythonSessionId');
  },
};

// ============================================================================
// Session Service
// ============================================================================

export const sessionService = {
  /**
   * Clear a specific session's history
   */
  async clearSession(sessionId: string): Promise<ClearSessionResponse> {
    try {
      const response = await fetch(`${BASE_URL}${ENDPOINTS.SESSION.CLEAR}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to clear session');
      }

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get conversation history for a session
   */
  async getHistory(sessionId: string): Promise<SessionHistoryResponse> {
    try {
      const url = `${BASE_URL}${ENDPOINTS.SESSION.HISTORY.replace(':sessionId', sessionId)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get session history');
      }

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// ============================================================================
// Health & Info Service
// ============================================================================

export const healthService = {
  /**
   * Check Python backend health
   */
  async checkHealth(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${BASE_URL}${ENDPOINTS.HEALTH}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Health check failed');
      }

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get system information
   */
  async getInfo(): Promise<SystemInfoResponse> {
    try {
      const response = await fetch(`${BASE_URL}${ENDPOINTS.ADMIN.INFO}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get system info');
      }

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// ============================================================================
// Admin Service
// ============================================================================

export const adminService = {
  /**
   * Reload RAG documents (admin only)
   */
  async reloadDocuments(): Promise<ReloadDocumentsResponse> {
    try {
      const response = await fetch(`${BASE_URL}${ENDPOINTS.ADMIN.RELOAD_DOCUMENTS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to reload documents');
      }

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
