import { useContext, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Copy,
  Edit3,
  Link as LinkIcon,
  MapPin,
  Pause,
  Play,
  Plus,
  Save,
  Trash2
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { AuthContext } from '../../authContext';
import AdminLayout from '../../components/AdminLayout';
import { clearAdminDraft, readAdminDraft, writeAdminDraft } from '../../utils/adminDrafts';

const CARDS_DRAFT_KEY = 'kito-admin-cards-draft-v1';

const EMPTY_FORM = {
  area_name: '',
  display_title: '',
  description: '',
  target_url: '',
  sort_order: 0,
  is_active: true,
  education_level: 'school'
};

const audienceLabels = {
  school: 'בתי ספר',
  kindergarten: 'גני ילדים',
  both: 'בתי ספר וגני ילדים'
};

const audienceOptions = [
  { value: 'school', label: audienceLabels.school },
  { value: 'kindergarten', label: audienceLabels.kindergarten },
  { value: 'both', label: audienceLabels.both }
];

function getAudienceLabel(value) {
  return audienceLabels[value] || audienceLabels.school;
}

function truncateUrl(url) {
  if (!url) return '';
  return url.length > 42 ? `${url.slice(0, 42)}...` : url;
}

function getOperationErrorMessage(err, fallback) {
  if (err?.message?.includes('registration_cards_education_level_check')) {
    return 'הדאטהבייס עדיין לא עודכן לתמיכה בבחירה "בתי ספר וגני ילדים". צריך להריץ את מיגרציית ה-constraint ב-Supabase.';
  }

  return err?.message || fallback;
}

function groupByActivity(cards) {
  const groups = new Map();

  cards.forEach((card) => {
    const title = (card.display_title || 'פעילות הרשמה').trim();
    const sortOrder = Number(card.sort_order) || 0;

    if (!groups.has(title)) {
      groups.set(title, {
        title,
        sortOrder,
        areas: []
      });
    }

    const group = groups.get(title);
    group.sortOrder = Math.min(group.sortOrder, sortOrder);
    group.areas.push(card);
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      areas: group.areas.sort((first, second) => {
        const firstOrder = Number(first.sort_order) || 0;
        const secondOrder = Number(second.sort_order) || 0;

        if (firstOrder !== secondOrder) {
          return firstOrder - secondOrder;
        }

        return (first.area_name || '').localeCompare(second.area_name || '', 'he');
      })
    }))
    .sort((first, second) => {
      if (first.sortOrder !== second.sortOrder) {
        return first.sortOrder - second.sortOrder;
      }

      return first.title.localeCompare(second.title, 'he');
    });
}

export default function Cards({ onNavigate }) {
  const { user } = useContext(AuthContext);
  const [initialDraft] = useState(() => readAdminDraft(CARDS_DRAFT_KEY));
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [opLoading, setOpLoading] = useState(false);
  const [message, setMessage] = useState(
    initialDraft?.showForm ? 'שוחזרה טיוטת פעילות/אזור שעדיין לא נשמרה.' : null
  );
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(Boolean(initialDraft?.showForm));
  const [editingCardId, setEditingCardId] = useState(initialDraft?.editingCardId || null);
  const [lockedActivityTitle, setLockedActivityTitle] = useState(initialDraft?.lockedActivityTitle || '');
  const [formData, setFormData] = useState(() => (
    initialDraft?.showForm ? { ...EMPTY_FORM, ...(initialDraft.formData || {}) } : EMPTY_FORM
  ));

  const activityGroups = useMemo(() => groupByActivity(cards), [cards]);
  const isAddingAreaToExistingActivity = !editingCardId && Boolean(lockedActivityTitle);

  useEffect(() => {
    if (!showForm) {
      clearAdminDraft(CARDS_DRAFT_KEY);
      return;
    }

    writeAdminDraft(CARDS_DRAFT_KEY, {
      showForm,
      editingCardId,
      lockedActivityTitle,
      formData
    });
  }, [showForm, editingCardId, lockedActivityTitle, formData]);

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
      console.error('Failed to load registrations:', err);
      setError('אירעה שגיאה בטעינת הפעילויות והאזורים.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialCards() {
      try {
        setLoading(true);
        const { data, error: cardsError } = await supabase
          .from('registration_cards')
          .select('*')
          .order('sort_order', { ascending: true });

        if (cardsError) throw cardsError;
        if (isMounted) setCards(data || []);
      } catch (err) {
        console.error('Failed to load registrations:', err);
        if (isMounted) setError('אירעה שגיאה בטעינת הפעילויות והאזורים.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadInitialCards();

    return () => {
      isMounted = false;
    };
  }, []);

  function resetForm() {
    clearAdminDraft(CARDS_DRAFT_KEY);
    setFormData(EMPTY_FORM);
    setEditingCardId(null);
    setLockedActivityTitle('');
    setShowForm(false);
  }

  function handleEditClick(card) {
    setEditingCardId(card.id);
    setLockedActivityTitle('');
    setFormData({
      area_name: card.area_name || '',
      display_title: card.display_title || '',
      description: card.description || '',
      target_url: card.target_url || '',
      sort_order: card.sort_order || 0,
      is_active: card.is_active !== undefined ? card.is_active : true,
      education_level: card.education_level || 'school'
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCreateActivityClick() {
    setEditingCardId(null);
    setLockedActivityTitle('');
    setFormData(EMPTY_FORM);
    setShowForm(true);
  }

  function handleAddAreaToActivityClick(activity) {
    setEditingCardId(null);
    setLockedActivityTitle(activity.title);
    setFormData({
      ...EMPTY_FORM,
      display_title: activity.title,
      sort_order: activity.sortOrder
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function buildPayload() {
    return {
      area_name: formData.area_name.trim(),
      display_title: formData.display_title.trim(),
      description: formData.description.trim(),
      target_url: formData.target_url.trim(),
      sort_order: Number(formData.sort_order) || 0,
      is_active: formData.is_active,
      education_level: formData.education_level
    };
  }

  async function writeAuditLog(action, entityId, details) {
    if (!user?.id) return;

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action,
      entity_type: 'registration_cards',
      entity_id: entityId,
      details
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setOpLoading(true);

    try {
      const payload = buildPayload();

      if (editingCardId) {
        const { error: updateError } = await supabase
          .from('registration_cards')
          .update({
            ...payload,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCardId);

        if (updateError) throw updateError;

        await writeAuditLog(
          'UPDATE_ACTIVITY_AREA',
          editingCardId,
          `Updated ${payload.area_name} for activity ${payload.display_title}`
        );

        setMessage('האזור עודכן בהצלחה.');
      } else {
        const { data: newCard, error: insertError } = await supabase
          .from('registration_cards')
          .insert(payload)
          .select()
          .single();

        if (insertError) throw insertError;

        await writeAuditLog(
          'CREATE_ACTIVITY_AREA',
          newCard.id,
          `Created ${payload.area_name} for activity ${payload.display_title}`
        );

        setMessage('האזור נוסף לפעילות בהצלחה.');
      }

      resetForm();
      await loadCards();
    } catch (err) {
      console.error('Operation failed:', err);
      setError(getOperationErrorMessage(err, 'אירעה שגיאה בשמירת הפעילות.'));
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
        .update({
          is_active: nextActiveState,
          updated_at: new Date().toISOString()
        })
        .eq('id', card.id);

      if (updateError) throw updateError;

      await writeAuditLog(
        nextActiveState ? 'ACTIVATE_ACTIVITY_AREA' : 'DEACTIVATE_ACTIVITY_AREA',
        card.id,
        `${nextActiveState ? 'Activated' : 'Deactivated'} ${card.area_name} for activity ${card.display_title}`
      );

      setMessage(`האזור "${card.area_name}" ${nextActiveState ? 'הופעל ויוצג להורים' : 'כובה והוסר מהעמוד הציבורי'}.`);
      await loadCards();
    } catch (err) {
      console.error('Toggle failed:', err);
      setError(getOperationErrorMessage(err, 'שגיאה בשינוי מצב האזור.'));
    }
  }

  async function handleDuplicateArea(card) {
    const areaName = window.prompt('שם האזור המשוכפל:', `${card.area_name} - עותק`);
    const normalizedAreaName = areaName?.trim();

    if (!normalizedAreaName) return;

    setError(null);
    setMessage(null);
    setOpLoading(true);

    try {
      const { data: newCard, error: insertError } = await supabase
        .from('registration_cards')
        .insert({
          area_name: normalizedAreaName,
          display_title: card.display_title,
          description: card.description || '',
          target_url: card.target_url,
          sort_order: Number(card.sort_order) + 1 || 0,
          is_active: false,
          education_level: card.education_level || 'school'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      await writeAuditLog(
        'DUPLICATE_ACTIVITY_AREA',
        newCard.id,
        `Duplicated ${card.area_name} as ${normalizedAreaName} in activity ${card.display_title}`
      );

      setMessage(`האזור "${card.area_name}" שוכפל כ-"${normalizedAreaName}" ונשמר ככבוי לעריכה.`);
      await loadCards();
    } catch (err) {
      console.error('Duplicate area failed:', err);
      setError(getOperationErrorMessage(err, 'אירעה שגיאה בשכפול האזור.'));
    } finally {
      setOpLoading(false);
    }
  }

  async function handleDuplicateActivity(activity) {
    const activityTitle = window.prompt('שם הפעילות המשוכפלת:', `${activity.title} - עותק`);
    const normalizedActivityTitle = activityTitle?.trim();

    if (!normalizedActivityTitle) return;

    setError(null);
    setMessage(null);
    setOpLoading(true);

    try {
      const duplicatedAreas = activity.areas.map((area) => ({
        area_name: area.area_name,
        display_title: normalizedActivityTitle,
        description: area.description || '',
        target_url: area.target_url,
        sort_order: area.sort_order || 0,
        is_active: false,
        education_level: area.education_level || 'school'
      }));

      const { data: newAreas, error: insertError } = await supabase
        .from('registration_cards')
        .insert(duplicatedAreas)
        .select();

      if (insertError) throw insertError;

      await writeAuditLog(
        'DUPLICATE_ACTIVITY',
        newAreas?.[0]?.id || activity.areas[0].id,
        `Duplicated activity ${activity.title} as ${normalizedActivityTitle} with ${activity.areas.length} areas`
      );

      setMessage(`הפעילות "${activity.title}" שוכפלה כ-"${normalizedActivityTitle}" וכל האזורים נשמרו ככבויים לעריכה.`);
      await loadCards();
    } catch (err) {
      console.error('Duplicate activity failed:', err);
      setError(getOperationErrorMessage(err, 'אירעה שגיאה בשכפול הפעילות.'));
    } finally {
      setOpLoading(false);
    }
  }

  async function handleDeleteArea(card) {
    const approved = window.confirm(
      `למחוק את האזור "${card.area_name}" מתוך הפעילות "${card.display_title}"? הפעולה לא ניתנת לביטול.`
    );

    if (!approved) return;

    setError(null);
    setMessage(null);
    setOpLoading(true);

    try {
      await writeAuditLog(
        'DELETE_ACTIVITY_AREA',
        card.id,
        `Deleted ${card.area_name} from activity ${card.display_title}`
      );

      const { error: deleteError } = await supabase
        .from('registration_cards')
        .delete()
        .eq('id', card.id);

      if (deleteError) throw deleteError;

      if (editingCardId === card.id) {
        resetForm();
      }

      setMessage(`האזור "${card.area_name}" נמחק מהפעילות.`);
      await loadCards();
    } catch (err) {
      console.error('Delete area failed:', err);
      setError(getOperationErrorMessage(err, 'אירעה שגיאה במחיקת האזור.'));
    } finally {
      setOpLoading(false);
    }
  }

  async function handleDeleteActivity(activity) {
    const approved = window.confirm(
      `למחוק את הפעילות "${activity.title}" ואת כל ${activity.areas.length} האזורים שבתוכה? הפעולה לא ניתנת לביטול.`
    );

    if (!approved) return;

    setError(null);
    setMessage(null);
    setOpLoading(true);

    try {
      const areaIds = activity.areas.map((area) => area.id);

      await writeAuditLog(
        'DELETE_ACTIVITY',
        areaIds[0],
        `Deleted activity ${activity.title} with ${activity.areas.length} areas`
      );

      const { error: deleteError } = await supabase
        .from('registration_cards')
        .delete()
        .in('id', areaIds);

      if (deleteError) throw deleteError;

      if (areaIds.includes(editingCardId)) {
        resetForm();
      }

      setMessage(`הפעילות "${activity.title}" נמחקה יחד עם כל האזורים שלה.`);
      await loadCards();
    } catch (err) {
      console.error('Delete activity failed:', err);
      setError(getOperationErrorMessage(err, 'אירעה שגיאה במחיקת הפעילות.'));
    } finally {
      setOpLoading(false);
    }
  }

  return (
    <AdminLayout currentPath="/admin/cards" onNavigate={onNavigate}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '28px', fontWeight: '800', color: 'var(--primary-dark)' }}>
              ניהול פעילויות ואזורים
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '6px' }}>
              כל פעילות יכולה להכיל כמה אזורים. לכל אזור מגדירים קישור הרשמה, קהל יעד ותיאור מלא.
            </p>
          </div>

          {!showForm && (
            <button
              onClick={handleCreateActivityClick}
              className="btn btn-primary"
              style={{ fontWeight: '700' }}
            >
              <Plus size={18} />
              הוספת פעילות חדשה
            </button>
          )}
        </div>

        {message && (
          <div style={{
            padding: '14px 18px',
            backgroundColor: '#d1fae5',
            color: '#065f46',
            borderRadius: 'var(--radius-md)',
            fontWeight: '700',
            border: '1px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <CheckCircle size={18} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div style={{
            padding: '14px 18px',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: 'var(--radius-md)',
            fontWeight: '700',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="card"
            style={{ display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#ffffff' }}
          >
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--primary-dark)' }}>
              {editingCardId
                ? 'עריכת אזור בפעילות'
                : isAddingAreaToExistingActivity
                  ? 'הוספת אזור לפעילות קיימת'
                  : 'הוספת פעילות חדשה'}
            </h2>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">שם הפעילות</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder={'לדוגמה: הרשמה לקייטנת קיץ תשפ"ו'}
                  disabled={isAddingAreaToExistingActivity}
                  value={formData.display_title}
                  onChange={(event) => setFormData({ ...formData, display_title: event.target.value })}
                  style={{
                    cursor: isAddingAreaToExistingActivity ? 'not-allowed' : 'text',
                    opacity: isAddingAreaToExistingActivity ? 0.78 : 1
                  }}
                />
                {isAddingAreaToExistingActivity && (
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    שם הפעילות נעול כשמוסיפים אזור לפעילות קיימת.
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">שם האזור</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="לדוגמה: חריש"
                  value={formData.area_name}
                  onChange={(event) => setFormData({ ...formData, area_name: event.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">מיועד עבור</label>
                <select
                  className="form-control"
                  value={formData.education_level}
                  onChange={(event) => setFormData({ ...formData, education_level: event.target.value })}
                >
                  {audienceOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">סדר הופעה</label>
                <input
                  type="number"
                  required
                  className="form-control"
                  value={formData.sort_order}
                  onChange={(event) => setFormData({ ...formData, sort_order: event.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">תיאור מלא שיוצג להורים באזור הזה</label>
              <textarea
                required
                className="form-control"
                rows="5"
                placeholder="כתבו כאן את כל הפרטים שההורה צריך לראות לפני מעבר להרשמה."
                value={formData.description}
                onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                style={{ resize: 'vertical', minHeight: '140px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">קישור להרשמה</label>
              <input
                type="url"
                required
                className="form-control"
                placeholder="https://registration-system.co.il/my-area"
                value={formData.target_url}
                onChange={(event) => setFormData({ ...formData, target_url: event.target.value })}
              />
            </div>

            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(event) => setFormData({ ...formData, is_active: event.target.checked })}
              />
              אזור פעיל ומוצג להורים
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
              <button type="button" onClick={resetForm} className="btn btn-text">ביטול</button>
              <button type="submit" disabled={opLoading} className="btn btn-primary">
                <Save size={18} />
                {opLoading ? 'שומר...' : 'שמירת אזור'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div>טוען פעילויות ואזורים...</div>
        ) : cards.length === 0 ? (
          <div className="card text-center" style={{ padding: '50px 20px', backgroundColor: '#ffffff' }}>
            <h2 style={{ fontSize: '20px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              טרם הוגדרו פעילויות.
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
              הוסיפו פעילות ראשונה ואז צרפו אליה את האזורים הרלוונטיים.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {activityGroups.map((activity) => (
              <section
                key={activity.title}
                className="card"
                style={{ padding: 0, overflow: 'hidden', backgroundColor: '#ffffff' }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                  padding: '20px 22px',
                  borderBottom: '1px solid var(--border-color)'
                }}>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--primary-dark)' }}>
                      {activity.title}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                      {activity.areas.length} אזורים בפעילות
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleAddAreaToActivityClick(activity)}
                    >
                      <Plus size={15} />
                      הוספת אזור לפעילות
                    </button>

                    <button
                      type="button"
                      className="admin-icon-button"
                      title="שכפול פעילות"
                      aria-label={`שכפול פעילות ${activity.title}`}
                      disabled={opLoading}
                      onClick={() => handleDuplicateActivity(activity)}
                    >
                      <Copy size={16} />
                    </button>

                    <button
                      type="button"
                      className="admin-icon-button admin-icon-button-danger"
                      title="מחיקת פעילות"
                      aria-label={`מחיקת פעילות ${activity.title}`}
                      disabled={opLoading}
                      onClick={() => handleDeleteActivity(activity)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'right'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--primary-light)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '14px 18px', fontWeight: '800', color: 'var(--primary-dark)', fontSize: '14px' }}>אזור</th>
                        <th style={{ padding: '14px 18px', fontWeight: '800', color: 'var(--primary-dark)', fontSize: '14px' }}>מיועד עבור</th>
                        <th style={{ padding: '14px 18px', fontWeight: '800', color: 'var(--primary-dark)', fontSize: '14px' }}>תיאור</th>
                        <th style={{ padding: '14px 18px', fontWeight: '800', color: 'var(--primary-dark)', fontSize: '14px' }}>קישור</th>
                        <th style={{ padding: '14px 18px', fontWeight: '800', color: 'var(--primary-dark)', fontSize: '14px', textAlign: 'center' }}>סטטוס</th>
                        <th style={{ padding: '14px 18px', fontWeight: '800', color: 'var(--primary-dark)', fontSize: '14px', textAlign: 'center' }}>פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activity.areas.map((card) => (
                        <tr key={card.id} style={{ borderBottom: '1px solid var(--border-color)' }} className="table-row-hover">
                          <td style={{ padding: '16px 18px', fontSize: '15px', fontWeight: '800', color: 'var(--primary-dark)' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                              <MapPin size={16} color="var(--primary-purple)" />
                              {card.area_name}
                            </span>
                          </td>

                          <td style={{ padding: '16px 18px', fontSize: '14px' }}>
                            <span className="badge badge-primary">
                              {getAudienceLabel(card.education_level)}
                            </span>
                          </td>

                          <td style={{
                            padding: '16px 18px',
                            fontSize: '14px',
                            color: 'var(--text-dark)',
                            maxWidth: '320px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {card.description || 'אין תיאור'}
                          </td>

                          <td style={{ padding: '16px 18px', fontSize: '13px', direction: 'ltr', textAlign: 'right' }}>
                            <a
                              href={card.target_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: 'var(--primary-purple)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              <LinkIcon size={14} />
                              {truncateUrl(card.target_url)}
                            </a>
                          </td>

                          <td style={{ padding: '16px 18px', textAlign: 'center' }}>
                            <span className={`badge ${card.is_active ? 'badge-success' : 'badge-danger'}`}>
                              {card.is_active ? 'פעיל' : 'כבוי'}
                            </span>
                          </td>

                          <td style={{ padding: '16px 18px' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => handleEditClick(card)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '7px 12px', fontSize: '13px' }}
                              >
                                <Edit3 size={14} />
                                עריכה
                              </button>

                              <button
                                onClick={() => handleToggleActive(card)}
                                className={`btn btn-sm ${card.is_active ? 'btn-outline' : 'btn-primary'}`}
                                disabled={opLoading}
                                style={{ padding: '7px 12px', fontSize: '13px' }}
                              >
                                {card.is_active ? <Pause size={14} /> : <Play size={14} />}
                                {card.is_active ? 'כיבוי' : 'הפעלה'}
                              </button>

                              <button
                                onClick={() => handleDuplicateArea(card)}
                                className="admin-icon-button"
                                title="שכפול אזור"
                                aria-label={`שכפול אזור ${card.area_name}`}
                                disabled={opLoading}
                              >
                                <Copy size={15} />
                              </button>

                              <button
                                onClick={() => handleDeleteArea(card)}
                                className="admin-icon-button admin-icon-button-danger"
                                title="מחיקת אזור"
                                aria-label={`מחיקת אזור ${card.area_name}`}
                                disabled={opLoading}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}

            <style>{`
              .table-row-hover:hover {
                background-color: #f8fafc;
              }

              .admin-icon-button {
                width: 34px;
                height: 34px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border: 1px solid var(--border-color);
                border-radius: var(--radius-sm);
                background: #ffffff;
                color: var(--primary-purple);
                cursor: pointer;
                transition: var(--transition);
              }

              .admin-icon-button:hover {
                background: var(--primary-light);
              }

              .admin-icon-button-danger {
                color: #9f3a38;
                border-color: #ead2d2;
                background: #fff8f8;
              }

              .admin-icon-button-danger:hover {
                background: #fdf0f0;
                border-color: #e7bebe;
              }

              .admin-icon-button:disabled {
                cursor: not-allowed;
                opacity: 0.5;
              }
            `}</style>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
