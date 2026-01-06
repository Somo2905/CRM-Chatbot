# Automotive CRM Chatbot - Tekion Style

## 📁 Complete Folder & File Structure

```
/src/
├── app/
│   ├── App.jsx                              # Main app with routing & authentication
│   │
│   ├── pages/                               # Authentication Pages
│   │   ├── LoginPage.jsx                    # Professional login interface
│   │   └── SignupPage.jsx                   # Complete signup form
│   │
│   ├── components/                          # Main Components
│   │   ├── ChatbotContainer.jsx             # Chat container with state management
│   │   ├── ChatHeader.jsx                   # Header with logo, settings & logout
│   │   ├── ChatMessages.jsx                 # Messages display area with auto-scroll
│   │   ├── MessageBubble.jsx                # Individual message component
│   │   ├── ChatInput.jsx                    # Message input with file/voice support
│   │   ├── ChatSidebar.jsx                  # Conversation history sidebar
│   │   │
│   │   ├── data-displays/                   # Rich Data Display Components
│   │   │   ├── VehicleList.jsx             # Vehicle inventory display cards
│   │   │   ├── ServiceOptions.jsx          # Service appointment cards
│   │   │   ├── CustomerInfo.jsx            # Customer profile card
│   │   │   └── TimeSlots.jsx               # Interactive time slot selector
│   │   │
│   │   ├── figma/                           # System Components (Protected)
│   │   │   └── ImageWithFallback.tsx       # Image component with fallback
│   │   │
│   │   └── ui/                              # Reusable UI Components
│   │       ├── button.tsx                   # Button component
│   │       ├── input.tsx                    # Input component
│   │       ├── label.tsx                    # Label component
│   │       ├── textarea.tsx                 # Textarea component
│   │       └── ... (other Radix UI components)
│   │
│   └── types/
│       └── chat.ts                          # TypeScript type definitions
│
├── styles/                                  # Global Styles
│   ├── index.css                           # Main styles
│   ├── tailwind.css                        # Tailwind imports
│   ├── theme.css                           # Theme variables
│   └── fonts.css                           # Font imports
│
├── package.json                             # Dependencies (includes react-router-dom)
└── vite.config.ts                          # Vite configuration
```

## ✨ Key Features Implemented

### 🔐 **Authentication System**
- **LoginPage.jsx** - Beautiful split-screen login
  - Email & password fields with validation
  - Remember me checkbox
  - "Forgot password" link
  - Social login buttons (Google, Microsoft)
  - Responsive mobile design
  - Animated gradient background
  - Statistics display (98% satisfaction, 24/7 support, 500+ dealerships)

- **SignupPage.jsx** - Comprehensive registration form
  - Multi-field form (name, email, phone, dealership, password)
  - Password confirmation
  - Terms & conditions checkbox
  - Show/hide password toggle
  - Feature highlights (no credit card, 24/7 support, easy integration)
  - Mobile-responsive layout

### 💬 **Chat Interface**
- **ChatbotContainer.jsx** - Main chat logic
  - Smart bot response system
  - Context-aware suggestions
  - Multiple conversation types (vehicles, service, customer info, test drives)
  - Conversation state management

- **ChatHeader.jsx** - Professional header
  - Tek ion branding
  - Mobile hamburger menu
  - Help & settings icons
  - Logout button

- **ChatMessages.jsx** - Message display
  - Auto-scroll to latest message
  - Message history
  - Smooth scrolling animation

- **MessageBubble.jsx** - Rich message display
  - Bot/user differentiation
  - Timestamp display
  - Quick suggestion chips
  - Rich data card integration

- **ChatInput.jsx** - Input interface
  - Multi-line text input
  - File attachment button (UI)
  - Voice input button (UI)
  - Send button with validation
  - Keyboard shortcuts (Enter to send, Shift+Enter for new line)

- **ChatSidebar.jsx** - Conversation management
  - Conversation history
  - New conversation button
  - Active conversation highlighting
  - Quick actions menu
  - Mobile overlay

### 🚗 **Rich Data Components**
- **VehicleList.jsx** - Vehicle inventory cards
  - Make, model, year display
  - Price & stock status
  - VIN number
  - "View Details" button

- **ServiceOptions.jsx** - Service selection cards
  - Service name & icon
  - Duration & pricing
  - Interactive selection
  - Grid layout (responsive)

- **CustomerInfo.jsx** - Customer profile
  - Name & status badge
  - Contact information (email, phone)
  - Stats (vehicles owned, last visit, loyalty points)
  - Gradient header design

- **TimeSlots.jsx** - Appointment booking
  - Interactive slot selection
  - Date & time display
  - Selected state highlighting
  - "Confirm Appointment" button

## 🎨 **Design System**

### Colors
- **Primary Blue**: #2563EB (blue-600)
- **Dark Blue**: #1E40AF (blue-700)
- **Light Blue**: #DBEAFE (blue-100)
- **Backgrounds**: White, Gray-50, Gray-100
- **Text**: Gray-900 (primary), Gray-600 (secondary), Gray-400 (tertiary)

### Typography
- **Headings**: Font-semibold, Font-bold
- **Body**: Default font (system)
- **Sizes**: text-xs to text-4xl

### Spacing
- **Padding**: Consistent p-4, p-8, px-4 py-3
- **Gaps**: gap-2, gap-3, gap-4
- **Rounded**: rounded-lg, rounded-full, rounded-2xl

## 🔄 **Routing Structure**

```
/ (root)
  ├── /login      → LoginPage (if not authenticated)
  ├── /signup     → SignupPage (if not authenticated)
  └── /chat       → ChatbotContainer (if authenticated)

Auto-redirects:
- / → /login (if not authenticated)
- / → /chat (if authenticated)
- /login → /chat (if authenticated)
- /signup → /chat (if authenticated)
- /chat → /login (if not authenticated)
```

## 🚀 **State Management**

### App Level (App.jsx)
- `isAuthenticated` - Global auth state
- Route protection logic

### Chat Level (ChatbotContainer.jsx)
- `messages` - Array of message objects
- `conversations` - Array of conversation threads
- `isSidebarOpen` - Sidebar visibility state

### Component Level
- Form inputs (LoginPage, SignupPage)
- Selected slots (TimeSlots)
- Password visibility toggles

## 📝 **How It Works**

1. **User Journey**:
   - User lands on `/` → Redirected to `/login`
   - User enters credentials → Authenticated
   - Redirected to `/chat` → Chatbot interface loads
   - User can chat, view data, manage conversations
   - User clicks logout → Redirected to `/login`

2. **Chat Interaction**:
   - User types message → Message sent
   - Bot analyzes message keywords
   - Bot responds with text + rich data cards
   - Suggestions displayed for quick actions
   - Data cards show: vehicles, services, customer info, time slots

3. **Conversation Management**:
   - New conversation button creates fresh chat
   - Sidebar shows conversation history
   - Click conversation to switch between them
   - Mobile: Sidebar slides in/out

## 🎯 **Automotive CRM Features**

- **Vehicle Search**: Browse inventory with detailed specs
- **Service Scheduling**: Book appointments with time/date selection
- **Customer Profiles**: View customer data & loyalty info
- **Test Drive Booking**: Schedule test drives
- **Intelligent Responses**: Context-aware bot conversations
- **Multi-conversation**: Handle multiple customer interactions

## 💡 **Technical Highlights**

- **React 18.3.1** - Latest stable React
- **React Router DOM 7.11.0** - Client-side routing
- **Lucide Icons** - Beautiful icon library
- **Tailwind CSS v4** - Utility-first styling
- **Radix UI** - Accessible component library
- **JSX Format** - JavaScript with JSX (as requested)
- **Responsive Design** - Mobile-first approach
- **Protected Routes** - Authentication-based navigation

## 📦 **Dependencies Installed**

- react-router-dom (v7.11.0) - For routing functionality
- All existing dependencies (lucide-react, tailwind, radix-ui, etc.)

## 🔥 **Quick Start**

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## 🎨 **Preview Description**

The application features:
- **Professional Authentication**: Split-screen login/signup with branded left panel showing company info and stats
- **Modern Chat Interface**: Clean, iMessage-style chat with bot/user differentiation
- **Rich Data Display**: Beautiful cards for vehicles, services, customers, and appointments
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Transitions, hover effects, and auto-scroll
- **Intuitive UX**: Clear navigation, helpful suggestions, and quick actions

All components are built with JSX (not TypeScript) as requested, providing a production-ready automotive CRM chatbot frontend! 🚗💬
