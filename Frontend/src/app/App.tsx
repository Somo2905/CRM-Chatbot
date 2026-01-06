import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ChatbotContainer } from './components/ChatbotContainer';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AdminDashboard } from './components/AdminDashboard';
import { SessionHistoryViewer } from './components/SessionHistoryViewer';
import { BackendStatus } from './components/BackendStatus';
import { ProtectedRoute } from './components/ProtectedRoute';
import { authService } from './services';

function AppRoutes() {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow p-3 flex gap-4 items-center justify-between">
        <div className="flex gap-4">
          {isAuthenticated && (
            <>
              <Link to="/" className="text-sm font-medium text-gray-700 hover:text-gray-900">Chatbot</Link>
              <Link to="/admin" className="text-sm font-medium text-gray-700 hover:text-gray-900">Admin</Link>
              <Link to="/history" className="text-sm font-medium text-gray-700 hover:text-gray-900">History</Link>
            </>
          )}
        </div>
        <div className="flex gap-4 items-center">
          <BackendStatus />
          {isAuthenticated ? (
            <button 
              onClick={handleLogout}
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">Login</Link>
              <Link to="/signup" className="text-sm font-medium text-gray-700 hover:text-gray-900">Sign up</Link>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/login" element={<LoginPage onLogin={() => navigate('/')} />} />
        <Route path="/signup" element={<SignupPage onSignup={() => navigate('/')} />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <ChatbotContainer />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/history" 
          element={
            <ProtectedRoute>
              <SessionHistoryViewer />
            </ProtectedRoute>
          } 
        />
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
