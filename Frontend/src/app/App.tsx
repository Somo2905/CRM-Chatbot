import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ChatbotContainer } from './components/ChatbotContainer';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AdminDashboard } from './components/AdminDashboard';
import { SessionHistoryViewer } from './components/SessionHistoryViewer';
import { BackendStatus } from './components/BackendStatus';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from './components/ui/toaster';
import CustomerManagement from './pages/CustomerManagement';
import VehicleManagement from './pages/VehicleManagement';
import ServiceSlotManagement from './pages/ServiceSlotManagement';
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
      <nav className="bg-white shadow-md border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-gray-900">CRM Chatbot</h1>
            {isAuthenticated && (
              <div className="flex gap-4">
                <Link to="/" className="text-sm font-medium text-gray-700 hover:text-blue-600 hover:underline">Chatbot</Link>
                <Link to="/admin" className="text-sm font-medium text-gray-700 hover:text-blue-600 hover:underline">Admin</Link>
                <Link to="/history" className="text-sm font-medium text-gray-700 hover:text-blue-600 hover:underline">History</Link>
                <Link to="/customers" className="text-sm font-medium text-gray-700 hover:text-blue-600 hover:underline">Customers</Link>
                <Link to="/vehicles" className="text-sm font-medium text-gray-700 hover:text-blue-600 hover:underline">Vehicles</Link>
                <Link to="/service-slots" className="text-sm font-medium text-gray-700 hover:text-blue-600 hover:underline">Service Slots</Link>
              </div>
            )}
          </div>
          <div className="flex gap-4 items-center">
            <BackendStatus />
            {isAuthenticated ? (
              <button 
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Logout
              </button>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50">Login</Link>
                <Link to="/signup" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">Sign up</Link>
              </div>
            )}
          </div>
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
        <Route 
          path="/customers" 
          element={
            <ProtectedRoute>
              <CustomerManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/vehicles" 
          element={
            <ProtectedRoute>
              <VehicleManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/service-slots" 
          element={
            <ProtectedRoute>
              <ServiceSlotManagement />
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
      <Toaster />
    </BrowserRouter>
  );
}
