export default function Footer({ settings }) {
  const footerText = settings?.footer_text || 'כל הזכויות שמורות לקיטו מרום © 2026';
  const companyName = settings?.company_name || 'קיטו מרום הדרכה טכנולוגית בע"מ';
  const officeAddress = settings?.office_address || 'מתחם INTRO, רחוב האורזים 2 נתניה.';
  const poBox = settings?.po_box || 'ת.ד. 2356, נתניה 42120';
  const contactPhone = settings?.contact_phone || '09-8344840';
  const contactFax = settings?.contact_fax || '09-8344841';

  return (
    <footer style={{
      backgroundColor: 'var(--primary-dark)',
      color: 'white',
      padding: '40px 0 20px',
      borderTop: '5px solid var(--accent-gold)',
      fontSize: '15px'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px',
          marginBottom: '30px',
          textAlign: 'right'
        }}>
          <div>
            <h3 style={{ color: 'white', marginBottom: '16px', fontSize: '20px' }}>קיטו מרום - צהרונים וקייטנות</h3>
            <p style={{ color: '#cbd5e1', fontSize: '14px', maxWidth: '350px' }}>
              מפעילים תוכניות חינוכיות, קייטנות וצהרונים ברחבי הארץ מזה שנים רבות.
              אנו מחויבים למצוינות, חינוך ערכי ובטיחות מקסימלית עבור ילדיכם.
            </p>
          </div>
          
          <div>
            <h3 style={{ color: 'white', marginBottom: '16px', fontSize: '20px' }}>פרטי התקשרות</h3>
            <ul style={{ listStyle: 'none', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px', padding: 0 }}>
              <li style={{ color: 'white', fontWeight: 'bold' }}>{companyName}</li>
              <li>{officeAddress}</li>
              <li>מען למכתבים: {poBox}</li>
              <li>טלפון: <a href={`tel:${contactPhone}`} style={{ color: 'var(--primary-light)' }}>{contactPhone}</a></li>
              <li>פקס: {contactFax}</li>
            </ul>
          </div>

          <div>
            <h3 style={{ color: 'white', marginBottom: '16px', fontSize: '20px' }}>מידע שימושי</h3>
            <ul style={{ listStyle: 'none', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>• קישורי ההרשמה בעמוד זה מתעדכנים ישירות על ידי מחלקת הרישום.</li>
              <li>• מומלץ לוודא שהאיזור שבחרתם תואם למוסד החינוכי של ילדכם.</li>
            </ul>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '20px 0' }} />
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          color: '#94a3b8',
          fontSize: '13px'
        }}>
          <span>{footerText}</span>
          <span style={{ direction: 'ltr' }}>Powered by Kito Marom Links © {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
