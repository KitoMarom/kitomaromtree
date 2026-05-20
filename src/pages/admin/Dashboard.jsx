import { useState, useEffect, useContext } from 'react';
import { supabase } from '../../supabaseClient';
import { AuthContext } from '../../authContext';
import AdminLayout from '../../components/AdminLayout';

export default function Dashboard({ onNavigate }) {
  const { role } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalCards: 0,
    activeCards: 0,
    settingsTitle: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        // Get total cards and active cards counts
        const { data: cards, error: cardsError } = await supabase
          .from('registration_cards')
          .select('is_active');
        
        if (cardsError) throw cardsError;

        const total = cards?.length || 0;
        const active = cards?.filter(c => c.is_active).length || 0;

        // Get page settings title
        const { data: settings, error: settingsError } = await supabase
          .from('page_settings')
          .select('page_title')
          .eq('id', '00000000-0000-0000-0000-000000000000')
          .single();

        if (settingsError) throw settingsError;

        setStats({
          totalCards: total,
          activeCards: active,
          settingsTitle: settings?.page_title || ''
        });

      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <AdminLayout currentPath="/admin" onNavigate={onNavigate}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Welcome Header */}
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary-dark)' }}>שלום וברוך הבא ללוח הבקרה</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginTop: '6px' }}>
            כאן תוכלו לעדכן ולנהל את קישורי ההרשמה של קיטו מרום לצהרונים וקייטנות.
          </p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div>טוען נתונים סטטיסטיים...</div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderRight: '4px solid var(--primary-purple)' }}>
              <span style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: '600' }}>כותרת עמוד ציבורי</span>
              <h2 style={{ fontSize: '20px', color: 'var(--primary-purple)', fontWeight: '800' }}>
                {stats.settingsTitle || 'לא הוגדרה'}
              </h2>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                הכותרת המופיעה בראש עמוד ההרשמה הראשי של ההורים.
              </span>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderRight: '4px solid var(--success-text)' }}>
              <span style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: '600' }}>קישורי הרשמה פעילים</span>
              <h2 style={{ fontSize: '32px', color: 'var(--success-text)', fontWeight: '800' }}>
                {stats.activeCards} <span style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-muted)' }}>מתוך {stats.totalCards} סה"כ</span>
              </h2>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                אזורים וקישורים המוצגים להורים כעת בעמוד ההרשמה.
              </span>
            </div>
          </div>
        )}

        {/* Quick Navigation Cards */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-dark)', marginBottom: '16px' }}>קישורים מהירים לניהול</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px'
          }}>
            <div 
              className="card card-hover" 
              onClick={() => onNavigate('/admin/settings')}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-purple)'
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--primary-dark)' }}>הגדרות עמוד הרשמה</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>עריכת כותרת העמוד והלוגו שמוצגים להורים.</p>
            </div>

            <div 
              className="card card-hover" 
              onClick={() => onNavigate('/admin/cards')}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-purple)'
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--primary-dark)' }}>ניהול פרויקטים ואזורים</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>הוספה, עריכה, סידור והפעלה/כיבוי של פרויקטים וקישורי הרשמה לפי אזורים.</p>
            </div>

            {role === 'admin' && (
              <div 
                className="card card-hover" 
                onClick={() => onNavigate('/admin/users')}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <div style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-purple)'
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h4 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--primary-dark)' }}>ניהול הרשאות וצוות</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>הוספת משתמשים חדשים, שינוי תפקידים (עורך/מנהל) והשעיית הרשאות גישה.</p>
              </div>
            )}
          </div>
        </div>

        {/* Informational Guidance Alert */}
        <div className="card glass" style={{
          padding: '24px',
          borderRight: '5px solid var(--accent-gold)',
          backgroundColor: '#fffbeb',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#92400e' }}>הנחיות עבודה קצרות:</h4>
          </div>
          <ul style={{ paddingRight: '20px', fontSize: '14px', color: '#78350f', display: 'flex', flexDirection: 'column', gap: '6px', listStyleType: 'disc' }}>
            <li>שינויים שתבצעו בקישורים או בהגדרות העמוד יתעדכנו <strong>מיד</strong> בעמוד הציבורי של ההורים.</li>
            <li>מומלץ לסמן קישורי הרשמה שפג תוקפם כ-<strong>לא פעיל</strong> במקום למחוק אותם, למקרה שתצטרכו להפעילם שוב בשנה הבאה.</li>
            <li>אם ברצונכם להוסיף תמונות לכרטיסי האזורים, תוכלו להזין קישור תמונה ישיר (למשל ממאגר תמונות או משרת אחסון) בטופס עריכת הכרטיס.</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
