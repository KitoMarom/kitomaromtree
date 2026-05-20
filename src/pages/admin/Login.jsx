import React, { useState, useContext, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { AuthContext } from '../../App';

export default function Login({ onNavigate }) {
  const { user, loading, refreshProfile } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // Toggle to allow first-admin sign up
  const [opLoading, setOpLoading] = useState(false);
  const [message, setMessage] = useState(null);
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
    setMessage(null);
    setOpLoading(true);

    try {
      if (isSignUp) {
        // Sign Up Flow
        if (!fullName.trim()) {
          throw new Error('אנא הכניסו שם מלא');
        }
        
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        });

        if (signUpError) throw signUpError;
        
        setMessage('ההרשמה בוצעה בהצלחה! אנא בדקו את תיבת הדוא"ל לאישור המשתמש (או נסו להתחבר כעת אם האישור אוטומטי).');
        setIsSignUp(false);
      } else {
        // Login Flow
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;
        
        // Success
        await refreshProfile();
        onNavigate('/admin');
      }
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
            {isSignUp ? 'רישום משתמש צוות חדש' : 'כניסת צוות קיטו מרום'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
            {isSignUp ? 'המשתמש הראשון שיירשם במערכת יוגדר אוטומטית כמנהל (Admin)' : 'התחברו לניהול קישורי ההרשמה והגדרות העמוד'}
          </p>
        </div>

        {/* Message / Error banners */}
        {message && (
          <div style={{ padding: '12px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>
            {message}
          </div>
        )}
        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {isSignUp && (
            <div className="form-group">
              <label className="form-label">שם מלא</label>
              <input 
                type="text" 
                required 
                className="form-control" 
                placeholder="שיר כהן"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
            </div>
          )}

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
            {opLoading ? 'מבצע פעולה...' : (isSignUp ? 'הרשמה והגדרת מנהל' : 'התחברות למערכת')}
          </button>
        </form>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '24px',
          fontSize: '14px',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '16px'
        }}>
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="btn btn-text btn-sm"
            style={{ color: 'var(--primary-purple)', fontWeight: '700' }}
          >
            {isSignUp ? 'יש לכם משתמש? התחברו כאן' : 'הרשמת המנהל הראשון / משתמש חדש'}
          </button>
        </div>

        <button
          onClick={() => onNavigate('/')}
          className="btn btn-text w-full btn-sm"
          style={{ marginTop: '8px', fontSize: '13px' }}
        >
          ⬅️ חזרה לעמוד הציבורי
        </button>
      </div>
    </div>
  );
}
