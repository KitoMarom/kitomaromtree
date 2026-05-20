import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../../supabaseClient';
import { AuthContext } from '../../App';
import AdminLayout from '../../components/AdminLayout';

export default function Settings({ onNavigate }) {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    page_title: '',
    page_subtitle: '',
    intro_text: '',
    logo_url: '',
    hero_image_url: '',
    contact_phone: '',
    contact_email: '',
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
            contact_phone: data.contact_phone || '',
            contact_email: data.contact_email || '',
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
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary-dark)' }}>⚙️ הגדרות עמוד ההרשמה הציבורי</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '6px' }}>
              כאן תוכלו לערוך את כותרות העמוד הראשי, לוגו החברה, פרטי יצירת הקשר והתוכן המוצג להורים.
            </p>
          </div>
        </div>

        {/* Messaging Banners */}
        {message && (
          <div style={{ padding: '14px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: 'var(--radius-sm)', fontWeight: '600' }}>
            {message}
          </div>
        )}
        {error && (
          <div style={{ padding: '14px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius-sm)', fontWeight: '600' }}>
            ❌ {error}
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
                <label className="form-label">טלפון במשרד</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={formData.contact_phone}
                  onChange={e => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="09-7407000"
                />
              </div>

              <div className="form-group">
                <label className="form-label">אימייל ליצירת קשר</label>
                <input 
                  type="email" 
                  className="form-control"
                  value={formData.contact_email}
                  onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="office@kitomarom.co.il"
                />
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
                style={{ padding: '12px 36px', fontSize: '16px', fontWeight: '700' }}
              >
                {saving ? 'שומר שינויים...' : '💾 שמור ופרסם עכשיו'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
