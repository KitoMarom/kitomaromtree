import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { AuthContext } from './authContext';

// Import Pages
import PublicPage from './pages/PublicPage';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Settings from './pages/admin/Settings';
import Cards from './pages/admin/Cards';
import Users from './pages/admin/Users';
import NotFound from './pages/NotFound';

// Import Guard
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Custom Router navigation function
  const navigate = (to) => {
    window.history.pushState({}, '', to);
    setPath(to);
  };

  // Sync state-based router with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  async function fetchProfile(currentUser) {
    if (!currentUser) {
      setRole(null);
      setIsActive(false);
      setAuthLoading(false);
      return;
    }

    setAuthLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, is_active')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        // If profile fetch fails but user exists, could be due to brand new registration
        // (the trigger should complete, but let's retry or fallback)
        setRole(null);
        setIsActive(false);
      } else if (data) {
        setRole(data.role);
        setIsActive(data.is_active);
      }
    } catch (err) {
      console.error('Failed to query user profile:', err);
    } finally {
      setAuthLoading(false);
    }
  }

  useEffect(() => {
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      fetchProfile(currentUser);
    });

    // 2. Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      fetchProfile(currentUser);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    setAuthLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setIsActive(false);
    setAuthLoading(false);
    navigate('/admin/login');
  };

  const refreshProfile = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    await fetchProfile(currentUser);
  };

  // Routing Handler
  const renderRoute = () => {
    if (path.startsWith('/registration/')) {
      const registrationId = decodeURIComponent(path.replace('/registration/', '').split('/')[0]);
      return <PublicPage registrationId={registrationId} onNavigate={navigate} />;
    }

    switch (path) {
      case '/':
        return <PublicPage onNavigate={navigate} />;
      
      case '/admin/login':
        return <Login onNavigate={navigate} />;
      
      case '/admin':
        return (
          <ProtectedRoute onNavigate={navigate}>
            <Dashboard onNavigate={navigate} />
          </ProtectedRoute>
        );
      
      case '/admin/settings':
        return (
          <ProtectedRoute onNavigate={navigate}>
            <Settings onNavigate={navigate} />
          </ProtectedRoute>
        );
      
      case '/admin/cards':
        return (
          <ProtectedRoute onNavigate={navigate}>
            <Cards onNavigate={navigate} />
          </ProtectedRoute>
        );
      
      case '/admin/users':
        return (
          <ProtectedRoute requiredRole="admin" onNavigate={navigate}>
            <Users onNavigate={navigate} />
          </ProtectedRoute>
        );
      
      default:
        return <NotFound onNavigate={navigate} />;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      isActive,
      loading: authLoading,
      logout,
      refreshProfile
    }}>
      {renderRoute()}
    </AuthContext.Provider>
  );
}

export default App;
