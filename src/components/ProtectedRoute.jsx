import { useContext, useEffect } from 'react';
import { AuthContext } from '../authContext';

export default function ProtectedRoute({ children, requiredRole, onNavigate }) {
  const { user, role, isActive, loading } = useContext(AuthContext);
  const hasAccess = Boolean(user && isActive && (!requiredRole || role === requiredRole));

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

  if (loading && !hasAccess) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <span>בודק הרשאות גישה...</span>
      </div>
    );
  }

  // Only render children if verified
  if (hasAccess) {
    return <>{children}</>;
  }

  return null;
}
