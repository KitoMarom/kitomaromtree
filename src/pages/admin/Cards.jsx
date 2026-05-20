import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../../supabaseClient';
import { AuthContext } from '../../App';
import AdminLayout from '../../components/AdminLayout';

export default function Cards({ onNavigate }) {
  const { user } = useContext(AuthContext);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [opLoading, setOpLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Form State (For Create & Update)
  const [showForm, setShowForm] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [formData, setFormData] = useState({
    area_name: '',
    display_title: '',
    description: '',
    image_url: '',
    target_url: '',
    sort_order: 0,
    is_active: true
  });

  async function loadCards() {
    try {
      setLoading(true);
      const { data, error: cardsError } = await supabase
        .from('registration_cards')
        .select('*')
        .order('sort_order', { ascending: true });

      if (cardsError) throw cardsError;
      setCards(data || []);
    } catch (err) {
      console.error('Failed to load cards:', err);
      setError('אירעה שגיאה בטעינת כרטיסי הרישום.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCards();
  }, []);

  function handleEditClick(card) {
    setEditingCardId(card.id);
    setFormData({
      area_name: card.area_name || '',
      display_title: card.display_title || '',
      description: card.description || '',
      image_url: card.image_url || '',
      target_url: card.target_url || '',
      sort_order: card.sort_order || 0,
      is_active: card.is_active !== undefined ? card.is_active : true
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelForm() {
    setShowForm(false);
    setEditingCardId(null);
    setFormData({
      area_name: '',
      display_title: '',
      description: '',
      image_url: '',
      target_url: '',
      sort_order: 0,
      is_active: true
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setOpLoading(true);

    try {
      if (editingCardId) {
        // UPDATE Existing Card
        const { error: updateError } = await supabase
          .from('registration_cards')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCardId);

        if (updateError) throw updateError;

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'UPDATE_CARD',
          entity_type: 'registration_cards',
          entity_id: editingCardId,
          details: `Updated card for area: ${formData.area_name}`
        });

        setMessage('קישור ההרשמה עודכן בהצלחה! ✨');
      } else {
        // CREATE New Card
        const { data: newCard, error: insertError } = await supabase
          .from('registration_cards')
          .insert({
            ...formData
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'CREATE_CARD',
          entity_type: 'registration_cards',
          entity_id: newCard.id,
          details: `Created new card for area: ${formData.area_name}`
        });

        setMessage('קישור הרשמה לאזור חדש נוסף בהצלחה! 🚀');
      }

      handleCancelForm();
      await loadCards();
    } catch (err) {
      console.error('Operation failed:', err);
      setError(err.message || 'אירעה שגיאה בביצוע הפעולה.');
    } finally {
      setOpLoading(false);
    }
  }

  async function handleToggleActive(card) {
    setError(null);
    setMessage(null);

    try {
      const nextActiveState = !card.is_active;
      const { error: updateError } = await supabase
        .from('registration_cards')
        .update({ is_active: nextActiveState })
        .eq('id', card.id);

      if (updateError) throw updateError;

      // Log audit
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: nextActiveState ? 'ACTIVATE_CARD' : 'DEACTIVATE_CARD',
        entity_type: 'registration_cards',
        entity_id: card.id,
        details: `${nextActiveState ? 'Activated' : 'Deactivated'} card for area ${card.area_name}`
      });

      setMessage(`הכרטיס עבור "${card.area_name}" ${nextActiveState ? 'הופעל והוא מוצג כעת להורים' : 'הושבת והוסר מהעמוד הציבורי'}.`);
      await loadCards();
    } catch (err) {
      console.error('Toggle failed:', err);
      setError('שגיאה בשינוי מצב כרטיס.');
    }
  }

  return (
    <AdminLayout currentPath="/admin/cards" onNavigate={onNavigate}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary-dark)' }}>🔗 ניהול קישורי הרשמה לקייטנות וצהרונים</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '6px' }}>
              הוסיפו, עדכנו או השביתו קישורי רישום לפי ערים/אזורים. סידור הכרטיסים מבוצע לפי שדה "סדר הופעה".
            </p>
          </div>
          
          {!showForm && (
            <button 
              onClick={() => setShowForm(true)} 
              className="btn btn-primary"
              style={{ fontWeight: '700' }}
            >
              ➕ הוספת אזור וקישור חדש
            </button>
          )}
        </div>

        {/* Messaging */}
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

        {/* Edit / Create Form Panel */}
        {showForm && (
          <div className="card glass" style={{ borderRight: '6px solid var(--primary-purple)', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontSize: '19px', fontWeight: '800', color: 'var(--primary-purple)' }}>
              {editingCardId ? '✏️ עריכת פרטי קישור רישום' : '➕ הוספת אזור וקישור הרשמה חדש'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">שם האזור / עיר</label>
                  <input 
                    type="text" 
                    required 
                    className="form-control"
                    placeholder="לדוגמה: טירת הכרמל"
                    value={formData.area_name}
                    onChange={e => setFormData({ ...formData, area_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">כותרת הכרטיס לתצוגה</label>
                  <input 
                    type="text" 
                    required 
                    className="form-control"
                    placeholder="לדוגמה: הרשמה לצהרוני גני ילדים תשפ''ו"
                    value={formData.display_title}
                    onChange={e => setFormData({ ...formData, display_title: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">תיאור קצר להורים (אופציונלי)</label>
                <textarea 
                  className="form-control"
                  rows="2"
                  placeholder="לדוגמה: צהרונים איכותיים הפועלים בתוך הגנים העירוניים עם ארוחה חמה..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">כתובת קישור ההרשמה (Target URL)</label>
                <input 
                  type="url" 
                  required 
                  className="form-control"
                  placeholder="https://registration-system.co.il/my-area"
                  value={formData.target_url}
                  onChange={e => setFormData({ ...formData, target_url: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">קישור לתמונה לכרטיס (אופציונלי)</label>
                  <input 
                    type="url" 
                    className="form-control"
                    placeholder="https://example.com/card-image.jpg"
                    value={formData.image_url}
                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">סדר הופעה (מספר נמוך יותר יופיע קודם)</label>
                  <input 
                    type="number" 
                    required 
                    className="form-control"
                    value={formData.sort_order}
                    onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-checkbox">
                  <input 
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  הגדר כרטיס זה כפעיל כעת (יוצג מיד להורים בעמוד הראשי)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={handleCancelForm} className="btn btn-text">ביטול</button>
                <button type="submit" disabled={opLoading} className="btn btn-primary">
                  {opLoading ? 'שומר...' : '💾 שמור קישור רישום'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List of cards */}
        {loading ? (
          <div>טוען רשימת קישורים...</div>
        ) : cards.length === 0 ? (
          <div className="card text-center" style={{ padding: '50px 20px', backgroundColor: '#ffffff' }}>
            <span style={{ fontSize: '32px' }}>📭</span>
            <h3 style={{ fontSize: '18px', color: 'var(--text-muted)', marginTop: '8px' }}>טרם הוגדרו אזורי רישום</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>לחצו על הכפתור בפינה השמאלית העליונה כדי להוסיף את האזור הראשון.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden', backgroundColor: '#ffffff' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'right'
              }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--primary-light)', borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--primary-dark)', fontSize: '14px' }}>מיקום / סדר</th>
                    <th style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--primary-dark)', fontSize: '14px' }}>שם האזור</th>
                    <th style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--primary-dark)', fontSize: '14px' }}>כותרת לתצוגה</th>
                    <th style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--primary-dark)', fontSize: '14px' }}>כתובת יעד (קישור)</th>
                    <th style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--primary-dark)', fontSize: '14px', textAlign: 'center' }}>סטטוס</th>
                    <th style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--primary-dark)', fontSize: '14px', textAlign: 'center' }}>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {cards.map((card) => (
                    <tr key={card.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition)' }} className="table-row-hover">
                      {/* Sort Badge / Value */}
                      <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                        <span className="badge badge-primary" style={{ fontWeight: '700' }}>#{card.sort_order}</span>
                      </td>

                      {/* Area Badge */}
                      <td style={{ padding: '16px 20px', fontWeight: '700', fontSize: '15px', color: 'var(--primary-dark)' }}>
                        📍 {card.area_name}
                      </td>

                      {/* Display Title */}
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-dark)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {card.display_title}
                      </td>

                      {/* Target Link */}
                      <td style={{ padding: '16px 20px', fontSize: '13px', direction: 'ltr', textAlign: 'right' }}>
                        <a 
                          href={card.target_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ color: 'var(--primary-purple)', textDecoration: 'underline' }}
                        >
                          {card.target_url.length > 35 ? `${card.target_url.slice(0, 35)}...` : card.target_url}
                        </a>
                      </td>

                      {/* Active Status Badge */}
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <span className={`badge ${card.is_active ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '12px' }}>
                          {card.is_active ? 'פעיל בעמוד' : 'כבוי / מושבת'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button 
                          onClick={() => handleEditClick(card)} 
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 12px', fontSize: '13px' }}
                        >
                          ✏️ עריכה
                        </button>
                        
                        <button 
                          onClick={() => handleToggleActive(card)} 
                          className={`btn btn-sm ${card.is_active ? 'btn-outline' : 'btn-primary'}`}
                          style={{ padding: '6px 12px', fontSize: '13px' }}
                        >
                          {card.is_active ? '⏸️ השבתה' : '▶️ הפעלה'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <style>{`
                .table-row-hover:hover {
                  background-color: #f8fafc;
                }
              `}</style>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
