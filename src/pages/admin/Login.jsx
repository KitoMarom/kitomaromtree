import { useState, useContext, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { AuthContext } from '../../authContext';

export default function Login({ onNavigate }) {
  const { user, loading, refreshProfile } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [opLoading, setOpLoading] = useState(false);
  const [error, setError] = useState(null);

  // If already logged in, redirect to admin dashboard
  useEffect(() => {
    if (!loading && user) {
      onNavigate('/admin');
    }
  }, [user, loading, onNavigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setOpLoading(true);

    try {
      // Login Flow
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;
      
      // Success
      await refreshProfile();
      onNavigate('/admin');
    } catch (err) {
      console.error('Auth operation failed:', err);
      setError(err.message || 'אירעה שגיאה בתהליך ההתחברות. ודאו שהפרטים נכונים.');
    } finally {
      setOpLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <span>טוען הגדרות אימות...</span>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-main)',
      fontFamily: 'var(--font-family)',
      padding: '20px'
    }}>
      <div className="card glass" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '40px 30px',
        boxShadow: 'var(--shadow-lg)',
        borderTop: '6px solid var(--primary-purple)',
        backgroundColor: '#ffffff'
      }}>
        {/* Logo / Title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
          <img 
            src="https://www.kitomarom.co.il/assets/images/logo.png" 
            alt="קיטו מרום" 
            style={{ height: '55px', objectFit: 'contain', cursor: 'pointer' }}
            onClick={() => onNavigate('/')}
          />
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary-dark)', textAlign: 'center' }}>
            כניסת צוות קיטו מרום
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
            התחברו לניהול קישורי ההרשמה והגדרות העמוד
          </p>
        </div>

        {/* Error banners */}
        {error && (
          <div style={{ 
            padding: '12px 16px', 
            backgroundColor: '#fee2e2', 
            color: '#991b1b', 
            borderRadius: 'var(--radius-sm)', 
            marginBottom: '20px', 
            fontSize: '14px', 
            fontWeight: '600',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="form-group">
            <label className="form-label">אימייל</label>
            <input 
              type="email" 
              required 
              className="form-control" 
              placeholder="office@kitomarom.co.il"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">סיסמה</label>
            <input 
              type="password" 
              required 
              className="form-control" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={opLoading}
            className="btn btn-primary w-full"
            style={{ padding: '14px', fontSize: '16px', fontWeight: '700', marginTop: '10px' }}
          >
            {opLoading ? 'מבצע פעולה...' : 'התחברות למערכת'}
          </button>
        </form>

        <button
          onClick={() => onNavigate('/')}
          className="btn btn-text w-full btn-sm"
          style={{ 
            marginTop: '24px', 
            fontSize: '13px', 
            borderTop: '1px solid var(--border-color)', 
            paddingTop: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '6px' }}>
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          חזרה לעמוד הציבורי
        </button>
      </div>
    </div>
  );
}
