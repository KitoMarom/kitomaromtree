import React, { useContext } from 'react';
import { AuthContext } from '../App';

export default function AdminLayout({ children, currentPath, onNavigate }) {
  const { user, role, logout } = useContext(AuthContext);

  const menuItems = [
    { path: '/admin', label: '📊 לוח בקרה', roles: ['admin', 'editor'] },
    { path: '/admin/settings', label: '⚙️ הגדרות עמוד', roles: ['admin', 'editor'] },
    { path: '/admin/cards', label: '🔗 קישורי הרשמה', roles: ['admin', 'editor'] },
    { path: '/admin/users', label: '👥 ניהול צוות', roles: ['admin'] }
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(role || ''));

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
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
        backgroundColor: '#ffffff'
      }}>
        {/* Header Branding */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '2px solid #f1f5f9',
          paddingBottom: '20px'
        }}>
          <img 
            src="https://www.atarix.kitomarom.co.il/images/logo.png" 
            alt="קיטו מרום" 
            style={{ height: '40px', objectFit: 'contain' }}
          />
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary-dark)' }}>מערכת ניהול רישום</h2>
        </div>

        {/* User Card */}
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'var(--primary-light)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>מחובר/ת כעת:</span>
          <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary-purple)', wordBreak: 'break-all' }}>
            {user?.email}
          </span>
          <span className="badge badge-primary" style={{
            alignSelf: 'flex-start',
            fontSize: '11px',
            marginTop: '4px',
            backgroundColor: role === 'admin' ? '#d1fae5' : '#ebd5ff',
            color: role === 'admin' ? '#065f46' : 'var(--primary-purple)'
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
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? 'white' : 'var(--text-dark)',
                  textAlign: 'right'
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => window.open('/', '_blank')}
            className="btn btn-outline btn-sm"
            style={{ width: '100%' }}
          >
            👁️ צפייה בעמוד הציבורי
          </button>
          
          <button
            onClick={logout}
            className="btn btn-danger btn-sm"
            style={{ width: '100%' }}
          >
            יציאה מהמערכת 🚪
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
