import React, { useContext } from 'react';
import { AuthContext } from '../App';

export default function AdminLayout({ children, currentPath, onNavigate }) {
  const { user, role, logout } = useContext(AuthContext);

  const menuItems = [
    { path: '/admin', label: 'לוח בקרה', icon: 'dashboard', roles: ['admin', 'editor'] },
    { path: '/admin/settings', label: 'הגדרות עמוד', icon: 'settings', roles: ['admin', 'editor'] },
    { path: '/admin/cards', label: 'קישורי הרשמה', icon: 'links', roles: ['admin', 'editor'] },
    { path: '/admin/users', label: 'ניהול צוות', icon: 'users', roles: ['admin'] }
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(role || ''));

  function renderIcon(iconName, isActive) {
    const strokeColor = isActive ? 'white' : 'var(--primary-purple)';
    const props = {
      width: '18',
      height: '18',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: strokeColor,
      strokeWidth: '2.5',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      style: { marginLeft: '10px', transition: 'var(--transition)' }
    };

    switch (iconName) {
      case 'dashboard':
        return (
          <svg {...props}>
            <rect x="3" y="3" width="7" height="9" />
            <rect x="14" y="3" width="7" height="5" />
            <rect x="14" y="12" width="7" height="9" />
            <rect x="3" y="16" width="7" height="5" />
          </svg>
        );
      case 'settings':
        return (
          <svg {...props}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        );
      case 'links':
        return (
          <svg {...props}>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        );
      case 'users':
        return (
          <svg {...props}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
      default:
        return null;
    }
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-main)',
      fontFamily: 'var(--font-family)'
    }}>
      {/* Sidebar - Desktop */}
      <aside className="glass" style={{
        width: '260px',
        borderLeft: '1px solid var(--border-color)',
        padding: '30px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxShadow: 'var(--shadow-sm)',
        backgroundColor: '#ffffff',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Header Branding */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '20px'
        }}>
          <img 
            src="https://www.kitomarom.co.il/assets/images/logo.png" 
            alt="קיטו מרום" 
            style={{ height: '45px', objectFit: 'contain' }}
          />
          <h2 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--primary-dark)', letterSpacing: '0.3px', marginTop: '4px' }}>מערכת ניהול רישום</h2>
        </div>

        {/* User Card */}
        <div style={{
          padding: '14px 16px',
          backgroundColor: 'var(--primary-light)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          border: '1px solid rgba(72, 57, 112, 0.1)'
        }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>מחובר/ת כעת:</span>
          <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary-purple)', wordBreak: 'break-all' }}>
            {user?.email}
          </span>
          <span className="badge badge-primary" style={{
            alignSelf: 'flex-start',
            fontSize: '11px',
            marginTop: '6px',
            backgroundColor: role === 'admin' ? '#d1fae5' : '#ebd5ff',
            color: role === 'admin' ? '#065f46' : 'var(--primary-purple)',
            border: role === 'admin' ? '1px solid #a7f3d0' : '1px solid #e9d5ff'
          }}>
            {role === 'admin' ? 'מנהל מערכת' : 'עורך תוכן'}
          </span>
        </div>

        {/* Navigation List */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
          {filteredMenuItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`btn ${isActive ? 'btn-primary' : 'btn-text'}`}
                style={{
                  justifyContent: 'flex-start',
                  padding: '12px 16px',
                  width: '100%',
                  fontSize: '15px',
                  fontWeight: isActive ? '700' : '600',
                  color: isActive ? 'white' : 'var(--text-dark)',
                  textAlign: 'right'
                }}
              >
                {renderIcon(item.icon, isActive)}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <button
            onClick={() => window.open('/', '_blank')}
            className="btn btn-outline btn-sm"
            style={{ 
              width: '100%', 
              fontWeight: '700', 
              fontSize: '13px', 
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '6px' }}>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            צפייה בעמוד הציבורי
          </button>
          
          <button
            onClick={logout}
            className="btn btn-danger btn-sm"
            style={{ 
              width: '100%', 
              fontWeight: '700', 
              fontSize: '13px', 
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '6px' }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            יציאה מהמערכת
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main style={{
        flexGrow: 1,
        padding: '40px 30px',
        overflowY: 'auto',
        maxHeight: '100vh',
        boxSizing: 'border-box'
      }}>
        {children}
      </main>
    </div>
  );
}
