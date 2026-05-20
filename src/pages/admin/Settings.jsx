import { useState, useEffect, useContext } from 'react';
import { supabase } from '../../supabaseClient';
import { AuthContext } from '../../authContext';
import AdminLayout from '../../components/AdminLayout';

export default function Settings({ onNavigate }) {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    page_title: '',
    page_subtitle: '',
    intro_text: '',
    logo_url: '',
    hero_image_url: '',
    company_name: '',
    office_address: '',
    po_box: '',
    contact_phone: '',
    contact_fax: '',
    footer_text: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const { data, error: settingsError } = await supabase
          .from('page_settings')
          .select('*')
          .eq('id', '00000000-0000-0000-0000-000000000000')
          .single();

        if (settingsError) throw settingsError;

        if (data) {
          setFormData({
            page_title: data.page_title || '',
            page_subtitle: data.page_subtitle || '',
            intro_text: data.intro_text || '',
            logo_url: data.logo_url || '',
            hero_image_url: data.hero_image_url || '',
            company_name: data.company_name || 'קיטו מרום הדרכה טכנולוגית בע"מ',
            office_address: data.office_address || 'מתחם INTRO, רחוב האורזים 2 נתניה.',
            po_box: data.po_box || 'ת.ד. 2356, נתניה 42120',
            contact_phone: data.contact_phone || '09-8344840',
            contact_fax: data.contact_fax || '09-8344841',
            footer_text: data.footer_text || ''
          });
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
        setError('אירעה שגיאה בטעינת הגדרות העמוד.');
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    try {
      const { error: updateError } = await supabase
        .from('page_settings')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', '00000000-0000-0000-0000-000000000000');

      if (updateError) throw updateError;

      // Log action in audit logs
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'UPDATE_SETTINGS',
        entity_type: 'page_settings',
        entity_id: '00000000-0000-0000-0000-000000000000',
        details: 'Updated public page settings parameters'
      });

      setMessage('הגדרות העמוד עודכנו בהצלחה ופורסמו להורים! ✨');
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError(err.message || 'אירעה שגיאה בשמירת השינויים.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout currentPath="/admin/settings" onNavigate={onNavigate}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '28px', fontWeight: '800', color: 'var(--primary-dark)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary-purple)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              הגדרות עמוד ההרשמה הציבורי
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '6px' }}>
              כאן תוכלו לערוך את כותרות העמוד הראשי, לוגו החברה, פרטי יצירת הקשר והתוכן המוצג להורים.
            </p>
          </div>
        </div>

        {/* Messaging Banners */}
        {message && (
          <div style={{ 
            padding: '14px 18px', 
            backgroundColor: '#d1fae5', 
            color: '#065f46', 
            borderRadius: 'var(--radius-md)', 
            fontWeight: '600',
            border: '1px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div style={{ 
            padding: '14px 18px', 
            backgroundColor: '#fee2e2', 
            color: '#991b1b', 
            borderRadius: 'var(--radius-md)', 
            fontWeight: '600',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Content Box */}
        {loading ? (
          <div>טוען הגדרות עמוד...</div>
        ) : (
          <form onSubmit={handleSave} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontSize: '19px', fontWeight: '800', color: 'var(--primary-purple)', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              טקסטים וכותרות
            </h3>

            <div className="form-group">
              <label className="form-label">כותרת עמוד ראשית</label>
              <input 
                type="text" 
                required 
                className="form-control"
                value={formData.page_title}
                onChange={e => setFormData({ ...formData, page_title: e.target.value })}
                placeholder="לדוגמה: צהרונים וקייטנות תשפ''ו - קיטו מרום"
              />
            </div>

            <div className="form-group">
              <label className="form-label">כותרת משנה</label>
              <input 
                type="text" 
                required 
                className="form-control"
                value={formData.page_subtitle}
                onChange={e => setFormData({ ...formData, page_subtitle: e.target.value })}
                placeholder="לדוגמה: בחרו את האיזור המבוקש כדי להירשם"
              />
            </div>

            <div className="form-group">
              <label className="form-label">טקסט הסבר / פתיח (אופציונלי)</label>
              <textarea 
                className="form-control" 
                rows="3"
                value={formData.intro_text}
                onChange={e => setFormData({ ...formData, intro_text: e.target.value })}
                placeholder="טקסט הסבר קצר על פעילות החברה שיוצג בראש העמוד..."
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
            </div>

            <h3 style={{ fontSize: '19px', fontWeight: '800', color: 'var(--primary-purple)', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginTop: '10px' }}>
              לוגו ונראות ויזואלית
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">קישור ללוגו (Logo URL)</label>
                <input 
                  type="url" 
                  className="form-control"
                  value={formData.logo_url}
                  onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="form-group">
                <label className="form-label">קישור לתמונת רקע/גיבור (Hero Cover URL)</label>
                <input 
                  type="url" 
                  className="form-control"
                  value={formData.hero_image_url}
                  onChange={e => setFormData({ ...formData, hero_image_url: e.target.value })}
                  placeholder="https://example.com/hero.jpg"
                />
              </div>
            </div>

            <h3 style={{ fontSize: '19px', fontWeight: '800', color: 'var(--primary-purple)', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginTop: '10px' }}>
              פרטי קשר וכותרת תחתונה
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">שם החברה</label>
                <input 
                  type="text" 
                  required
                  className="form-control"
                  value={formData.company_name}
                  onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder={"קיטו מרום הדרכה טכנולוגית בע\"מ"}
                />
              </div>

              <div className="form-group">
                <label className="form-label">כתובת פיזית במשרד</label>
                <input 
                  type="text" 
                  required
                  className="form-control"
                  value={formData.office_address}
                  onChange={e => setFormData({ ...formData, office_address: e.target.value })}
                  placeholder="מתחם INTRO, רחוב האורזים 2 נתניה."
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">מען למכתבים (ת.ד.)</label>
                <input 
                  type="text" 
                  required
                  className="form-control"
                  value={formData.po_box}
                  onChange={e => setFormData({ ...formData, po_box: e.target.value })}
                  placeholder="ת.ד. 2356, נתניה 42120"
                />
              </div>

              <div className="form-row-nested" style={{ display: 'flex', gap: '16px', flex: 1 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">טלפון במשרד</label>
                  <input 
                    type="text" 
                    required
                    className="form-control"
                    value={formData.contact_phone}
                    onChange={e => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder="09-8344840"
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">פקס</label>
                  <input 
                    type="text" 
                    required
                    className="form-control"
                    value={formData.contact_fax}
                    onChange={e => setFormData({ ...formData, contact_fax: e.target.value })}
                    placeholder="09-8344841"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">טקסט כותרת תחתונה (Footer Text)</label>
              <input 
                type="text" 
                required 
                className="form-control"
                value={formData.footer_text}
                onChange={e => setFormData({ ...formData, footer_text: e.target.value })}
                placeholder="כל הזכויות שמורות לקיטו מרום © 2026"
              />
            </div>

            {/* Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
              <button 
                type="submit" 
                disabled={saving}
                className="btn btn-primary"
                style={{ 
                  padding: '12px 36px', 
                  fontSize: '16px', 
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                {saving ? 'שומר שינויים...' : 'שמור ופרסם עכשיו'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
