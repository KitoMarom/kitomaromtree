import { useContext, useState } from 'react';
import {
  Eye,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  Settings,
  Users,
  X
} from 'lucide-react';
import { AuthContext } from '../authContext';

const menuItems = [
  { path: '/admin', label: 'לוח בקרה', icon: LayoutDashboard, roles: ['admin', 'editor'] },
  { path: '/admin/settings', label: 'הגדרות עמוד', icon: Settings, roles: ['admin', 'editor'] },
  { path: '/admin/cards', label: 'פעילויות ואזורים', icon: Link2, roles: ['admin', 'editor'] },
  { path: '/admin/users', label: 'ניהול צוות', icon: Users, roles: ['admin'] }
];

function SidebarContent({ currentPath, filteredMenuItems, logout, onNavigate, role, user }) {
  return (
    <>
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
          <h2 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--primary-dark)', marginTop: '4px' }}>
            מערכת ניהול רישום
          </h2>
        </div>

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

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
          {filteredMenuItems.map((item) => {
            const isActive = currentPath === item.path;
            const Icon = item.icon;

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
                <Icon size={18} style={{ marginLeft: '10px' }} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <button
            onClick={() => window.open('/', '_blank')}
            className="btn btn-outline btn-sm"
            style={{ width: '100%', fontWeight: '700', fontSize: '13px', padding: '10px 14px' }}
          >
            <Eye size={15} />
            צפייה בעמוד הציבורי
          </button>

          <button
            onClick={logout}
            className="btn btn-danger btn-sm"
            style={{ width: '100%', fontWeight: '700', fontSize: '13px', padding: '10px 14px' }}
          >
            <LogOut size={15} />
            יציאה מהמערכת
          </button>
        </div>
      </>
  );
}

export default function AdminLayout({ children, currentPath, onNavigate }) {
  const { user, role, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(role || ''));

  function handleNavigate(path) {
    onNavigate(path);
    setMobileMenuOpen(false);
  }

  return (
    <div
      className="admin-layout-shell"
      style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)', fontFamily: 'var(--font-family)' }}
    >
      <button
        className="hamburger-btn"
        onClick={() => setMobileMenuOpen(true)}
        aria-label="תפריט ניווט"
      >
        <Menu size={24} color="var(--primary-purple)" />
      </button>

      <aside className="admin-sidebar" style={{
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
        <SidebarContent
          currentPath={currentPath}
          filteredMenuItems={filteredMenuItems}
          logout={logout}
          onNavigate={handleNavigate}
          role={role}
          user={user}
        />
      </aside>

      <div className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <aside className="admin-sidebar admin-mobile-sidebar" style={{
          width: '100%',
          borderLeft: 'none',
          padding: '30px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          backgroundColor: '#ffffff',
          minHeight: '100vh'
        }}>
          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-label="סגירת תפריט"
            className="btn btn-text"
            style={{ alignSelf: 'flex-start', padding: '8px', width: 'auto' }}
          >
            <X size={22} />
          </button>
          <SidebarContent
            currentPath={currentPath}
            filteredMenuItems={filteredMenuItems}
            logout={logout}
            onNavigate={handleNavigate}
            role={role}
            user={user}
          />
        </aside>
      </div>

      <main className="admin-main" style={{
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
