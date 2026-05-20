export default function Header({ settings }) {
  let logoUrl = settings?.logo_url || 'https://www.kitomarom.co.il/assets/images/logo.png';
  
  // Fallback override in case the database still holds the legacy atarix URL
  if (logoUrl.includes('atarix')) {
    logoUrl = 'https://www.kitomarom.co.il/assets/images/logo.png';
  }

  return (
    <header style={{
      zIndex: 100,
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      padding: '14px 0'
    }}>
      <div className="container justify-between items-center flex" style={{ width: '100%', justifyContent: 'center' }}>
        <div className="logo-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src={logoUrl} 
            alt="לוגו קיטו מרום" 
            style={{ 
              height: '55px', 
              objectFit: 'contain'
            }} 
            onError={(e) => {
              e.target.src = 'https://www.kitomarom.co.il/assets/images/logo.png';
            }}
          />
        </div>
      </div>
    </header>
  );
}
