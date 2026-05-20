import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../App';

export default function ProtectedRoute({ children, requiredRole, onNavigate }) {
  const { user, role, isActive, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        onNavigate('/admin/login');
      } else if (!isActive) {
        // If logged in but account deactivated
        onNavigate('/admin/login');
      } else if (requiredRole && role !== requiredRole) {
        // If trying to access admin-only page but is editor
        onNavigate('/admin');
      }
    }
  }, [user, role, isActive, loading, requiredRole, onNavigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <span>בודק הרשאות גישה...</span>
      </div>
    );
  }

  // Only render children if verified
  if (user && isActive && (!requiredRole || role === requiredRole)) {
    return <>{children}</>;
  }

  return null;
}
