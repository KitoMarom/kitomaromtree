import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../../supabaseClient';
import { AuthContext } from '../../App';
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
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary-dark)' }}>שלום וברוך הבא ללוח הבקרה 👋</h1>
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
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: '600' }}>כותרת עמוד ציבורי</span>
              <h2 style={{ fontSize: '20px', color: 'var(--primary-purple)', fontWeight: '800' }}>
                {stats.settingsTitle || 'לא הוגדרה'}
              </h2>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                הכותרת המופיעה בראש עמוד ההרשמה הראשי של ההורים.
              </span>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: '600' }}>קישורי הרשמה פעילים</span>
              <h2 style={{ fontSize: '32px', color: 'var(--success)', fontWeight: '800' }}>
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
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              <span style={{ fontSize: '24px' }}>⚙️</span>
              <h4 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--primary-dark)' }}>הגדרות עמוד הרשמה</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>עריכת כותרות, פרטי לוגו, טלפון ואימייל ליצירת קשר עם המשרד.</p>
            </div>

            <div 
              className="card card-hover" 
              onClick={() => onNavigate('/admin/cards')}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              <span style={{ fontSize: '24px' }}>🔗</span>
              <h4 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--primary-dark)' }}>ניהול קישורי אזורים</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>הוספה, עריכה, סידור והפעלה/כיבוי של קישורי ההרשמה לפי ערים ואזורים.</p>
            </div>

            {role === 'admin' && (
              <div 
                className="card card-hover" 
                onClick={() => onNavigate('/admin/users')}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px' }}
              >
                <span style={{ fontSize: '24px' }}>👥</span>
                <h4 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--primary-dark)' }}>ניהול הרשאות וצוות</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>הוספת משתמשים חדשים, שינוי תפקידים (עורך/מנהל) והשעיית הרשאות גישה.</p>
              </div>
            )}
          </div>
        </div>

        {/* Informational Guidance Alert */}
        <div className="card glass" style={{
          padding: '20px 24px',
          borderRight: '5px solid var(--accent-gold)',
          backgroundColor: '#fffbeb'
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#92400e', marginBottom: '4px' }}>💡 הנחיות עבודה קצרות:</h4>
          <ul style={{ paddingRight: '20px', fontSize: '14px', color: '#78350f', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>שינויים שתבצעו בקישורים או בהגדרות העמוד יתעדכנו <strong>מיד</strong> בעמוד הציבורי של ההורים.</li>
            <li>מומלץ לסמן קישורי הרשמה שפג תוקפם כ-<strong>לא פעיל</strong> במקום למחוק אותם, למקרה שתצטרכו להפעילם שוב בשנה הבאה.</li>
            <li>אם ברצונכם להוסיף תמונות לכרטיסי האזורים, תוכלו להזין קישור תמונה ישיר (למשל ממאגר תמונות או משרת אחסון) בטופס עריכת הכרטיס.</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
