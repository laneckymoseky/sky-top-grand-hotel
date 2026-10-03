import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, isCustomer, isStaff, isAdmin } = useAuthStore();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole === 'customer' && !isCustomer) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole === 'staff' && !isStaff) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
