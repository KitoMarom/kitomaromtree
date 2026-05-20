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
    is_active: true,
    education_level: 'school',
    program_type: 'after_school'
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
      is_active: card.is_active !== undefined ? card.is_active : true,
      education_level: card.education_level || 'school',
      program_type: card.program_type || 'after_school'
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
      is_active: true,
      education_level: 'school',
      program_type: 'after_school'
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

        setMessage('קישור ההרשמה עודכן בהצלחה!');
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

        setMessage('קישור הרשמה לאזור חדש נוסף בהצלחה!');
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
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '28px', fontWeight: '800', color: 'var(--primary-dark)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary-purple)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              ניהול קישורי הרשמה לקייטנות וצהרונים
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '6px' }}>
              הוסיפו, עדכנו או השביתו קישורי רישום לפי ערים/אזורים. סידור הכרטיסים מבוצע לפי שדה "סדר הופעה".
            </p>
          </div>
          
          {!showForm && (
            <button 
              onClick={() => setShowForm(true)} 
              className="btn btn-primary"
              style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              הוספת אזור וקישור חדש
            </button>
          )}
        </div>

        {/* Messaging */}
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

        {/* Edit / Create Form Panel */}
        {showForm && (
          <div className="card glass" style={{ borderRight: '6px solid var(--primary-purple)', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#ffffff' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '19px', fontWeight: '800', color: 'var(--primary-purple)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-purple)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {editingCardId ? (
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                ) : (
                  <>
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </>
                )}
              </svg>
              {editingCardId ? 'עריכת פרטי קישור רישום' : 'הוספת אזור וקישור הרשמה חדש'}
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
                  <label className="form-label">מוסד חינוכי</label>
                  <select 
                    className="form-control"
                    value={formData.education_level}
                    onChange={e => setFormData({ ...formData, education_level: e.target.value })}
                  >
                    <option value="school">בתי ספר</option>
                    <option value="kindergarten">גני ילדים</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">סוג פעילות</label>
                  <select 
                    className="form-control"
                    value={formData.program_type}
                    onChange={e => setFormData({ ...formData, program_type: e.target.value })}
                  >
                    <option value="after_school">צהרונים</option>
                    <option value="camp">קייטנות</option>
                  </select>
                </div>
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
                <button type="submit" disabled={opLoading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {opLoading ? 'שומר...' : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      שמור קישור רישום
                    </>
                  )}
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
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--text-muted)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 style={{ fontSize: '18px', color: 'var(--text-muted)', marginTop: '8px' }}>טרם הוגדרו אזורי רישום</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>לחצו על הכפתור בפינה השמאלית העליונה כדי להוסיף את האזור הראשון.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden', backgroundColor: '#ffffff' }}>
            <div className="table-responsive">
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
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-purple)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {card.area_name}
                        </span>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                          <span className="badge badge-primary" style={{ fontSize: '11px', padding: '2px 8px' }}>
                            {card.education_level === 'school' ? 'בתי ספר' : 'גני ילדים'}
                          </span>
                          <span className="badge badge-primary" style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                            {card.program_type === 'after_school' ? 'צהרונים' : 'קייטנות'}
                          </span>
                        </div>
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
                          style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          עריכה
                        </button>
                        
                        <button 
                          onClick={() => handleToggleActive(card)} 
                          className={`btn btn-sm ${card.is_active ? 'btn-outline' : 'btn-primary'}`}
                          style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          {card.is_active ? (
                            <>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="6" y="4" width="4" height="16" />
                                <rect x="14" y="4" width="4" height="16" />
                              </svg>
                              השבתה
                            </>
                          ) : (
                            <>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="5 3 19 12 5 21 5 3" />
                              </svg>
                              הפעלה
                            </>
                          )}
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
