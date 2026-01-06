import React, { useState } from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ChatSidebar } from './ChatSidebar';
import { Message, ConversationThread } from '../types/chat';

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

  const handleSendMessage = (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(text);
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const generateBotResponse = (userMessage: string): Message => {
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

  const handleNewConversation = () => {
    const newConv: ConversationThread = {
      id: Date.now().toString(),
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
