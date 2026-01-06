import React, { useState, useEffect } from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ChatSidebar } from './ChatSidebar';
import { Message, ConversationThread } from '../types/chat';
import { 
  authService, 
  conversationService, 
  nodeChatService,
  pythonChatService 
} from '../services';

export function ChatbotContainer() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your Automotive Assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
      suggestions: [
        'Search for vehicles',
        'Schedule a service',
        'Check inventory',
        'Customer information'
      ]
    }
  ]);

  const [conversations, setConversations] = useState<ConversationThread[]>([
    {
      id: '1',
      title: 'Current Conversation',
      lastMessage: 'Hello! How can I help you today?',
      timestamp: new Date(),
      isActive: true
    }
  ]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Initialize conversation on mount if user is authenticated
  useEffect(() => {
    const initConversation = async () => {
      if (authService.isAuthenticated()) {
        try {
          const existingConvId = conversationService.getCurrentConversationId();
          if (existingConvId) {
            setConversationId(existingConvId);
          } else {
            const response = await conversationService.startConversation();
            setConversationId(response.conversationId);
          }
        } catch (error) {
          console.error('Failed to initialize conversation:', error);
        }
      }
    };
    initConversation();
  }, []);

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Determine which backend to use based on query type and authentication
      const isAuthenticated = authService.isAuthenticated();
      const lowerText = text.toLowerCase();
      
      // Check if this is an action query (book, schedule, appointment)
      const isActionQuery = lowerText.includes('book') || 
                           lowerText.includes('schedule') || 
                           lowerText.includes('appointment');

      let botResponse: Message;

      if (isAuthenticated && isActionQuery && conversationId) {
        // Use Node.js backend for action-based queries
        const response = await nodeChatService.sendMessage({
          conversationId,
          message: text
        });

        botResponse = {
          id: Date.now().toString(),
          text: response.reply,
          sender: 'bot',
          timestamp: new Date(),
          data: response.data
        };
      } else {
        // Use Python RAG backend for informational queries
        const customerInfo = authService.getCustomerInfo();
        const sessionId = pythonChatService.getSessionId();
        
        console.log('Sending to Python RAG with session ID:', sessionId);
        
        const response = await pythonChatService.sendMessage({
          query: text,
          session_id: sessionId,
          user_data: customerInfo ? {
            customer_id: customerInfo.id,
            name: customerInfo.name
          } : undefined
        });

        console.log('Response from Python RAG:', {
          session_id: response.session_id,
          memory_size: response.memory_size,
          context_used: response.context_used
        });

        botResponse = {
          id: Date.now().toString(),
          text: response.response,
          sender: 'bot',
          timestamp: new Date(),
          suggestions: generateSuggestions(text),
          metadata: {
            session_id: response.session_id,
            memory_size: response.memory_size,
            context_used: response.context_used
          }
        };
      }

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestions = (userMessage: string): string[] => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('vehicle') || lowerMessage.includes('car')) {
      return ['Get vehicle details', 'Schedule test drive', 'Compare vehicles'];
    } else if (lowerMessage.includes('service') || lowerMessage.includes('appointment')) {
      return ['Book appointment', 'View service history', 'Contact service center'];
    } else if (lowerMessage.includes('customer') || lowerMessage.includes('profile')) {
      return ['View purchase history', 'Update contact info', 'Loyalty rewards'];
    }
    return ['Search vehicles', 'Book service', 'View my profile', 'Contact sales'];
  };

  const generateBotResponse = (userMessage: string): Message => {
    // This function is now deprecated but kept for fallback
    const lowerMessage = userMessage.toLowerCase();
    
    let responseText = '';
    let suggestions: string[] = [];
    let data = null;

    if (lowerMessage.includes('vehicle') || lowerMessage.includes('car') || lowerMessage.includes('inventory')) {
      responseText = "I found several vehicles that match your criteria. Here are some available options:";
      data = {
        type: 'vehicle-list',
        vehicles: [
          {
            id: 'v1',
            make: 'Toyota',
            model: 'Camry',
            year: 2024,
            price: '$28,500',
            stock: 'In Stock',
            vin: '4T1B11HK5KU123456'
          },
          {
            id: 'v2',
            make: 'Honda',
            model: 'Accord',
            year: 2024,
            price: '$30,200',
            stock: 'In Stock',
            vin: '1HGCV1F36LA123456'
          },
          {
            id: 'v3',
            make: 'Ford',
            model: 'F-150',
            year: 2024,
            price: '$42,800',
            stock: 'Low Stock',
            vin: '1FTFW1E84NKE12345'
          }
        ]
      };
      suggestions = ['Get vehicle details', 'Schedule test drive', 'Compare vehicles'];
    } else if (lowerMessage.includes('service') || lowerMessage.includes('appointment') || lowerMessage.includes('schedule')) {
      responseText = "I can help you schedule a service appointment. Please select a service type:";
      data = {
        type: 'service-options',
        services: [
          { id: 's1', name: 'Oil Change', duration: '30 min', price: '$49.99' },
          { id: 's2', name: 'Tire Rotation', duration: '45 min', price: '$35.00' },
          { id: 's3', name: 'Brake Inspection', duration: '1 hour', price: '$75.00' },
          { id: 's4', name: 'Full Service', duration: '2 hours', price: '$149.99' }
        ]
      };
      suggestions = ['Book appointment', 'View service history', 'Contact service center'];
    } else if (lowerMessage.includes('customer') || lowerMessage.includes('profile')) {
      responseText = "Here's the customer information you requested:";
      data = {
        type: 'customer-info',
        customer: {
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '(555) 123-4567',
          vehicles: 2,
          lastVisit: '2024-12-15',
          loyaltyPoints: 1250
        }
      };
      suggestions = ['View purchase history', 'Update contact info', 'Loyalty rewards'];
    } else if (lowerMessage.includes('test drive')) {
      responseText = "Great! Let me help you schedule a test drive. Available time slots:";
      data = {
        type: 'time-slots',
        slots: [
          { id: 't1', date: '2026-01-07', time: '10:00 AM' },
          { id: 't2', date: '2026-01-07', time: '2:00 PM' },
          { id: 't3', date: '2026-01-08', time: '11:00 AM' },
          { id: 't4', date: '2026-01-08', time: '3:00 PM' }
        ]
      };
      suggestions = ['Confirm appointment', 'Choose different date', 'Call dealership'];
    } else {
      responseText = "I understand you're looking for assistance. I can help you with:\n\n• Vehicle search and inventory\n• Service appointments\n• Customer information\n• Test drive scheduling\n• Sales inquiries\n\nWhat would you like to explore?";
      suggestions = ['Search vehicles', 'Book service', 'View my profile', 'Contact sales'];
    }

    return {
      id: Date.now().toString(),
      text: responseText,
      sender: 'bot',
      timestamp: new Date(),
      suggestions,
      data
    };
  };

  const handleNewConversation = async () => {
    try {
      let newConvId: string;
      
      if (authService.isAuthenticated()) {
        // Start new conversation in Node.js backend
        const response = await conversationService.startConversation();
        newConvId = response.conversationId;
        setConversationId(newConvId);
      } else {
        // Clear Python session for non-authenticated users
        pythonChatService.clearCurrentSession();
        newConvId = Date.now().toString();
      }

      const newConv: ConversationThread = {
        id: newConvId,
        title: 'New Conversation',
        lastMessage: 'Started new conversation',
        timestamp: new Date(),
        isActive: true
      };

      setConversations(prev => [
        newConv,
        ...prev.map(c => ({ ...c, isActive: false }))
      ]);

      setMessages([
        {
          id: Date.now().toString(),
          text: "Hello! I'm your Automotive Assistant. How can I help you today?",
          sender: 'bot',
          timestamp: new Date(),
          suggestions: [
            'Search for vehicles',
            'Schedule a service',
            'Check inventory',
            'Customer information'
          ]
        }
      ]);
    } catch (error) {
      console.error('Failed to start new conversation:', error);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setConversations(prev =>
      prev.map(c => ({ ...c, isActive: c.id === conversationId }))
    );
    // In a real app, load messages for this conversation
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen">
      <ChatSidebar
        conversations={conversations}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewConversation={handleNewConversation}
        onSelectConversation={handleSelectConversation}
      />
      
      <div className="flex-1 flex flex-col">
        <ChatHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <ChatMessages messages={messages} />
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
