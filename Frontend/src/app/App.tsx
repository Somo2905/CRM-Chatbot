import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ChatbotContainer } from './components/ChatbotContainer';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow p-3 flex gap-4">
        <Link to="/" className="text-sm font-medium text-gray-700 hover:text-gray-900">Chatbot</Link>
        <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">Login</Link>
        <Link to="/signup" className="text-sm font-medium text-gray-700 hover:text-gray-900">Sign up</Link>
      </nav>

      <Routes>
        <Route path="/" element={<ChatbotContainer />} />
        <Route path="/login" element={<LoginPage onLogin={() => navigate('/')} />} />
        <Route path="/signup" element={<SignupPage onSignup={() => navigate('/')} />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
