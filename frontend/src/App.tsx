import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StartupDashboard from './pages/StartupDashboard';
import InvestorDashboard from './pages/InvestorDashboard';
import StartupProfileCreate from './pages/StartupProfileCreate';
import InvestorProfileCreate from './pages/InvestorProfileCreate';
import StartupProfileEdit from './pages/StartupProfileEdit';
import InvestorProfileEdit from './pages/InvestorProfileEdit';
import ProtectedRoute from './components/ProtectedRoute';
import { isAuthenticated } from './utils/auth';

const App: React.FC = () => {
  return (
    <div className="App">
      <Navbar />
      <div className="pt-20">
        <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        
        {/* Authentication routes - redirect if already authenticated */}
        <Route 
          path="/login" 
          element={isAuthenticated() ? <Navigate to="/" replace /> : <Login />} 
        />
        <Route 
          path="/signup" 
          element={isAuthenticated() ? <Navigate to="/" replace /> : <Signup />} 
        />
        
        {/* Protected routes */}
        <Route 
          path="/startup-dashboard" 
          element={
            <ProtectedRoute requiredRole="startup">
              <StartupDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/investor-dashboard" 
          element={
            <ProtectedRoute requiredRole="investor">
              <InvestorDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/startup-profile-create" 
          element={
            <ProtectedRoute requiredRole="startup">
              <StartupProfileCreate />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/investor-profile-create" 
          element={
            <ProtectedRoute requiredRole="investor">
              <InvestorProfileCreate />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/startup-profile-edit" 
          element={
            <ProtectedRoute requiredRole="startup">
              <StartupProfileEdit />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/investor-profile-edit" 
          element={
            <ProtectedRoute requiredRole="investor">
              <InvestorProfileEdit />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </div>
    </div>
  );
};

export default App;
