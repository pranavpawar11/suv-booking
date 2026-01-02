import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/common/Loader';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loader while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to appropriate login
  if (!isAuthenticated) {
    return <Navigate to={adminOnly ? "/admin/login" : "/login"} replace />;
  }

  // Admin only route - check if user is admin
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  // User route - check if user is customer (not admin)
  if (!adminOnly && user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Authorized - render children
  return children;
};

export default ProtectedRoute;