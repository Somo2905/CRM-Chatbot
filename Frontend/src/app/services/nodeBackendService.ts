/**
 * Node.js Backend Service
 * Handles all interactions with the Express/MongoDB backend
 */

import { API_CONFIG, getAuthHeader, handleApiError } from './api.config';

const { BASE_URL, ENDPOINTS } = API_CONFIG.NODE_BACKEND;

// ============================================================================
// Types
// ============================================================================

export interface LoginRequest {
  phone: string;
  dlLast4: string;
}

export interface SignupRequest {
  name: string;
  phone: string;
  dlLast4: string;
}

export interface AuthResponse {
  token: string;
  customer: {
    id: string;
    name: string;
  };
}

export interface StartConversationResponse {
  conversationId: string;
}

export interface ChatRequest {
  conversationId: string;
  message: string;
}

export interface ChatResponse {
  type: 'RAG' | 'ACTION';
  reply: string;
  data?: {
    sources?: any[];
    appointmentId?: string;
  };
}

// ============================================================================
// Auth Service
// ============================================================================

export const authService = {
  /**
   * Login with phone and driver's license last 4 digits
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${BASE_URL}${ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      
      // Store token
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('customerId', data.customer.id);
        localStorage.setItem('customerName', data.customer.name);
      }

      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Sign up a new customer
   */
  async signup(userData: SignupRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${BASE_URL}${ENDPOINTS.AUTH.SIGNUP}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Signup failed');
      }

      const data = await response.json();
      
      // Store token
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('customerId', data.customer.id);
        localStorage.setItem('customerName', data.customer.name);
      }

      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('customerId');
    localStorage.removeItem('customerName');
    localStorage.removeItem('conversationId');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },

  /**
   * Get current customer info
   */
  getCustomerInfo(): { id: string; name: string } | null {
    const id = localStorage.getItem('customerId');
    const name = localStorage.getItem('customerName');
    if (id && name) {
      return { id, name };
    }
    return null;
  },
};

// ============================================================================
// Conversation Service
// ============================================================================

export const conversationService = {
  /**
   * Start a new conversation
   */
  async startConversation(): Promise<StartConversationResponse> {
    try {
      console.log('Starting conversation with backend...');
      const response = await fetch(`${BASE_URL}${ENDPOINTS.CONVERSATIONS.START}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start conversation');
      }

      const data = await response.json();
      console.log('Conversation started, received:', data);
      
      // Store conversation ID
      if (data.conversationId) {
        console.log('Storing conversationId in localStorage:', data.conversationId);
        localStorage.setItem('conversationId', data.conversationId);
      } else {
        console.error('No conversationId in response:', data);
      }

      return data;
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get current conversation ID
   */
  getCurrentConversationId(): string | null {
    const convId = localStorage.getItem('conversationId');
    console.log('Retrieved conversationId from localStorage:', convId);
    return convId;
  },
};

// ============================================================================
// Chat Service (Node.js Backend)
// ============================================================================

export const nodeChatService = {
  /**
   * Send a chat message (uses Node.js backend for action-based queries)
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${BASE_URL}${ENDPOINTS.CHAT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// ============================================================================
// Generic API Service for Management Pages
// ============================================================================

export const nodeBackendService = {
  /**
   * Generic GET request
   */
  async get(endpoint: string): Promise<any> {
    try {
      // Ensure endpoint starts with /api if not already present
      const url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
      const response = await fetch(`${BASE_URL}${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Generic POST request
   */
  async post(endpoint: string, data: any): Promise<any> {
    try {
      // Ensure endpoint starts with /api if not already present
      const url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
      const response = await fetch(`${BASE_URL}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Generic PUT request
   */
  async put(endpoint: string, data: any): Promise<any> {
    try {
      // Ensure endpoint starts with /api if not already present
      const url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
      const response = await fetch(`${BASE_URL}${url}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Generic DELETE request
   */
  async delete(endpoint: string): Promise<any> {
    try {
      // Ensure endpoint starts with /api if not already present
      const url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
      const response = await fetch(`${BASE_URL}${url}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
