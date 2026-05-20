import React from 'react';

export default function Header({ settings }) {
  const logoUrl = settings?.logo_url || 'https://www.atarix.kitomarom.co.il/images/logo.png';
  const pageTitle = settings?.page_title || 'צהרונים וקייטנות קיטו מרום';

  return (
    <header className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid var(--border-color)',
      padding: '16px 0',
      transition: 'var(--transition)'
    }}>
      <div className="container justify-between items-center flex" style={{ width: '100%' }}>
        <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={logoUrl} 
            alt="לוגו קיטו מרום" 
            style={{ 
              height: '50px', 
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))' 
            }} 
            onError={(e) => {
              e.target.src = 'https://placehold.co/150x50/5c1f9c/ffffff?text=קיטו+מרום';
            }}
          />
        </div>
        
        <div className="header-info flex items-center gap-4">
          {settings?.contact_phone && (
            <a 
              href={`tel:${settings.contact_phone}`} 
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '14px', whiteSpace: 'nowrap' }}
            >
              📞 {settings.contact_phone}
            </a>
          )}
          <a 
            href="/admin/login" 
            className="btn btn-text btn-sm"
            style={{ fontWeight: '600' }}
          >
            כניסת צוות 🔒
          </a>
        </div>
      </div>
    </header>
  );
}
