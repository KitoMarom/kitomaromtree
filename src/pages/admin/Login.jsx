import React, { useState, useContext, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { AuthContext } from '../../App';

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
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
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
      backgroundColor: '#f1f5f9',
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
            src="https://www.atarix.kitomarom.co.il/images/logo.png" 
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
          <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>
            ❌ {error}
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
          style={{ marginTop: '24px', fontSize: '13px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}
        >
          ⬅️ חזרה לעמוד הציבורי
        </button>
      </div>
    </div>
  );
}
