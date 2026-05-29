import { useState } from 'react';

const CONSENT_STORAGE_KEY = 'kito-cookie-consent-v1';
const PRIVACY_POLICY_URL = 'https://www.kitomarom.co.il/privacy-policy';

export default function CookieConsent() {
  const [hasAccepted, setHasAccepted] = useState(() => (
    window.localStorage.getItem(CONSENT_STORAGE_KEY) === 'accepted'
  ));

  function acceptCookies() {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted');
    setHasAccepted(true);
  }

  if (hasAccepted) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="הודעת Cookies"
      dir="rtl"
      style={{
        position: 'fixed',
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        minHeight: '46px',
        padding: '7px 40px',
        backgroundColor: '#dddddd',
        color: '#222222',
        boxShadow: '0 -1px 6px rgba(0, 0, 0, 0.08)',
        fontFamily: 'var(--font-family)',
        fontSize: '16px',
        lineHeight: '1.45'
      }}
    >
      <p style={{ margin: 0, textAlign: 'right' }}>
        לידיעתך, באתר זה נעשה שימוש בקבצי Cookies. המשך גלישה באתר מהווה הסכמה לשימוש זה. למידע נוסף על{' '}
        <a
          href={PRIVACY_POLICY_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#337AB7', textDecoration: 'underline', fontWeight: 700 }}
        >
          מדיניות הפרטיות
        </a>
      </p>

      <button
        type="button"
        onClick={acceptCookies}
        style={{
          flexShrink: 0,
          minWidth: '60px',
          minHeight: '34px',
          padding: '6px 18px',
          border: 0,
          borderRadius: '3px',
          backgroundColor: '#5CB85C',
          color: '#ffffff',
          fontFamily: 'var(--font-family)',
          fontSize: '16px',
          fontWeight: 700,
          cursor: 'pointer'
        }}
      >
        קבל
      </button>
    </div>
  );
}
