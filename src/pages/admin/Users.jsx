import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../../supabaseClient';
import { AuthContext } from '../../App';
import AdminLayout from '../../components/AdminLayout';

export default function Users({ onNavigate }) {
  const { user: currentUser, role: currentRole } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [opLoading, setOpLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Invitation Form State
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFullName, setInviteFullName] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [invitePassword, setInvitePassword] = useState(''); // If provided, creates user immediately

  async function loadUsers() {
    try {
      setLoading(true);
      // Query profiles table
      const { data, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load user profiles:', err);
      setError('אירעה שגיאה בטעינת רשימת משתמשי הצוות.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Role-guard check: Redirect if not admin
    if (currentRole && currentRole !== 'admin') {
      onNavigate('/admin');
      return;
    }
    loadUsers();
  }, [currentRole, onNavigate]);

  async function callServerlessFunction(payload) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      throw new Error('פג תוקף החיבור. אנא התחברו מחדש.');
    }

    const response = await fetch('/.netlify/functions/manage-users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'פעולת השרת נכשלה');
    }

    return result;
  }

  async function handleInvite(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setOpLoading(true);

    try {
      await callServerlessFunction({
        action: 'invite-user',
        email: inviteEmail,
        fullName: inviteFullName,
        role: inviteRole,
        password: invitePassword.trim() || undefined
      });

      setMessage(`הפעולה בוצעה בהצלחה! המשתמש ${inviteEmail} נוסף לרשימת הצוות.`);
      setInviteEmail('');
      setInviteFullName('');
      setInviteRole('editor');
      setInvitePassword('');
      setShowInviteForm(false);
      await loadUsers();
    } catch (err) {
      console.error('Failed to invite user:', err);
      setError(err.message || 'אירעה שגיאה בהוספת המשתמש.');
    } finally {
      setOpLoading(false);
    }
  }

  async function handleToggleActive(profile) {
    setError(null);
    setMessage(null);
    setOpLoading(true);

    try {
      const nextActiveState = !profile.is_active;
      await callServerlessFunction({
        action: 'deactivate-user',
        targetUserId: profile.id,
        isActive: nextActiveState
      });

      setMessage(`המשתמש ${profile.email} ${nextActiveState ? 'הופעל בהצלחה' : 'הושעה וגישתו נחסמה'}.`);
      await loadUsers();
    } catch (err) {
      console.error('Failed to toggle status:', err);
      setError(err.message || 'שגיאה בעדכון סטטוס המשתמש.');
    } finally {
      setOpLoading(false);
    }
  }

  async function handleChangeRole(profile, newRole) {
    setError(null);
    setMessage(null);
    setOpLoading(true);

    try {
      await callServerlessFunction({
        action: 'update-user-role',
        targetUserId: profile.id,
        newRole: newRole
      });

      setMessage(`תפקידו של ${profile.email} עודכן בהצלחה ל-${newRole === 'admin' ? 'מנהל' : 'עורך'}.`);
      await loadUsers();
    } catch (err) {
      console.error('Failed to change user role:', err);
      setError(err.message || 'שגיאה בעדכון תפקיד המשתמש.');
    } finally {
      setOpLoading(false);
    }
  }

  return (
    <AdminLayout currentPath="/admin/users" onNavigate={onNavigate}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '28px', fontWeight: '800', color: 'var(--primary-dark)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary-purple)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              ניהול צוות משתמשים והרשאות
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '6px' }}>
              מנהלי מערכת יכולים להוסיף אנשי צוות, לעדכן הרשאות (עורך/מנהל) או לחסום גישה של משתמשים קיימים.
            </p>
          </div>
          
          {!showInviteForm && (
            <button 
              onClick={() => setShowInviteForm(true)} 
              className="btn btn-primary"
              style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              הוספת איש צוות חדש
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

        {/* Creation/Invitation Form Box */}
        {showInviteForm && (
          <div className="card glass" style={{ borderRight: '6px solid var(--primary-purple)', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#ffffff' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '19px', fontWeight: '800', color: 'var(--primary-purple)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-purple)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="17" y1="11" x2="23" y2="11" />
              </svg>
              הוספת משתמש צוות חדש
            </h3>

            <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">שם מלא של איש הצוות</label>
                  <input 
                    type="text" 
                    required 
                    className="form-control"
                    placeholder="ישראל ישראלי"
                    value={inviteFullName}
                    onChange={e => setInviteFullName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">כתובת אימייל</label>
                  <input 
                    type="email" 
                    required 
                    className="form-control"
                    placeholder="staff@kitomarom.co.il"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">הרשאת משתמש (תפקיד)</label>
                  <select 
                    className="form-control"
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}
                  >
                    <option value="editor">עורך תוכן (Editor) - ניהול קישורים והגדרות עמוד בלבד</option>
                    <option value="admin">מנהל מערכת (Admin) - שליטה מלאה כולל ניהול משתמשים</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">סיסמה ראשונית (אופציונלי - יווצר ויופעל מיידית)</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="השאירו ריק להזמנה במייל, או הקלידו סיסמה"
                    value={invitePassword}
                    onChange={e => setInvitePassword(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowInviteForm(false)} className="btn btn-text">ביטול</button>
                <button type="submit" disabled={opLoading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {opLoading ? 'מוסיף משתמש...' : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="8" cy="7" r="4" />
                        <line x1="20" y1="8" x2="20" y2="14" />
                        <line x1="17" y1="11" x2="23" y2="11" />
                      </svg>
                      הוסף איש צוות
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* User table list */}
        {loading ? (
          <div>טוען רשימת צוות...</div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden', backgroundColor: '#ffffff' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--primary-light)', borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--primary-dark)', fontSize: '14px' }}>שם מלא</th>
                    <th style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--primary-dark)', fontSize: '14px' }}>כתובת אימייל</th>
                    <th style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--primary-dark)', fontSize: '14px' }}>תפקיד במערכת</th>
                    <th style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--primary-dark)', fontSize: '14px', textAlign: 'center' }}>סטטוס גישה</th>
                    <th style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--primary-dark)', fontSize: '14px', textAlign: 'center' }}>פעולות ניהול</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((profile) => {
                    const isSelf = profile.id === currentUser?.id;
                    return (
                      <tr key={profile.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '16px 20px', fontWeight: '700', fontSize: '15px', color: 'var(--primary-dark)' }}>
                          {profile.full_name} {isSelf && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(אתה)</span>}
                        </td>
                        
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-dark)' }}>
                          {profile.email}
                        </td>

                        {/* Role selection dropdown */}
                        <td style={{ padding: '16px 20px' }}>
                          {isSelf ? (
                            <span className="badge badge-success" style={{ fontWeight: '700' }}>מנהל (פעיל)</span>
                          ) : (
                            <select
                              className="form-control"
                              style={{ width: '130px', padding: '6px 10px', fontSize: '13px', border: '1px solid var(--border-color)' }}
                              value={profile.role}
                              onChange={(e) => handleChangeRole(profile, e.target.value)}
                              disabled={opLoading}
                            >
                              <option value="editor">עורך תוכן</option>
                              <option value="admin">מנהל מערכת</option>
                            </select>
                          )}
                        </td>

                        {/* Active/Inactive badge */}
                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                          <span className={`badge ${profile.is_active ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '12px' }}>
                            {profile.is_active ? 'מורשה גישה' : 'גישה מושעית'}
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                          {!isSelf ? (
                            <button
                              onClick={() => handleToggleActive(profile)}
                              className={`btn btn-sm ${profile.is_active ? 'btn-outline' : 'btn-primary'}`}
                              style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                              disabled={opLoading}
                            >
                              {profile.is_active ? (
                                <>
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="6" y="4" width="4" height="16" />
                                    <rect x="14" y="4" width="4" height="16" />
                                  </svg>
                                  השעיית גישה
                                </>
                              ) : (
                                <>
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  ביטול השעיה
                                </>
                              )}
                            </button>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>לא ניתן לשנות משתמש עצמי</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
