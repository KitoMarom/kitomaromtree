import React from 'react';

export default function NotFound({ onNavigate }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-main)',
      fontFamily: 'var(--font-family)',
      textAlign: 'center',
      padding: '20px'
    }}>
      <span style={{ fontSize: '80px', marginBottom: '20px' }}>🔍</span>
      <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary-dark)' }}>העמוד המבוקש לא נמצא</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginTop: '8px', maxWidth: '400px' }}>
        מצטערים, אך נראה שהכתובת שהזנתם אינה קיימת או שהעמוד הוסר.
      </p>
      
      <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
        <button 
          onClick={() => onNavigate('/')} 
          className="btn btn-primary"
          style={{ padding: '12px 24px', fontWeight: '700' }}
        >
          🏠 חזרה לעמוד הבית
        </button>
        <button 
          onClick={() => onNavigate('/admin/login')} 
          className="btn btn-outline"
          style={{ padding: '12px 24px', fontWeight: '700' }}
        >
          🔒 כניסת צוות
        </button>
      </div>
    </div>
  );
}
