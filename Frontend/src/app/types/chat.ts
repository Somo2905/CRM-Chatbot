export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
  data?: any;
  metadata?: {
    session_id?: string;
    memory_size?: number;
    context_used?: number;
  };
}

export interface ConversationThread {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  isActive: boolean;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: string;
  stock: string;
  vin: string;
}

export interface Service {
  id: string;
  name: string;
  duration: string;
  price: string;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  vehicles: number;
  lastVisit: string;
  loyaltyPoints: number;
}
