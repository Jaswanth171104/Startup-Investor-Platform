import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, isTokenExpired } from '../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check if token is expired
  if (isTokenExpired()) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (requiredRole) {
    const userRole = localStorage.getItem('user_role');
    if (userRole !== requiredRole) {
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute; 