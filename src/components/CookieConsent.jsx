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
    <>
      <div role="dialog" aria-label="הודעת Cookies" dir="rtl" className="cookie-consent">
        <p className="cookie-consent__text">
          לידיעתך, באתר זה נעשה שימוש בקבצי Cookies. המשך גלישה באתר מהווה הסכמה לשימוש זה. למידע נוסף על{' '}
          <a
            href={PRIVACY_POLICY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="cookie-consent__link"
          >
            מדיניות הפרטיות
          </a>
        </p>

        <button type="button" onClick={acceptCookies} className="cookie-consent__button">
          קבל
        </button>
      </div>

      <style>{`
        .cookie-consent {
          position: fixed;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          min-height: 46px;
          padding: 7px 40px;
          background-color: #dddddd;
          color: #222222;
          box-shadow: 0 -1px 6px rgba(0, 0, 0, 0.08);
          font-family: var(--font-family);
          font-size: 16px;
          line-height: 1.45;
        }

        .cookie-consent__text {
          margin: 0;
          text-align: right;
        }

        .cookie-consent__link {
          color: #337AB7;
          text-decoration: underline;
          font-weight: 700;
        }

        .cookie-consent__button {
          flex-shrink: 0;
          min-width: 60px;
          min-height: 34px;
          padding: 6px 18px;
          border: 0;
          border-radius: 3px;
          background-color: #5CB85C;
          color: #ffffff;
          font-family: var(--font-family);
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
        }

        @media (max-width: 640px) {
          .cookie-consent {
            right: 8px;
            bottom: 8px;
            left: 8px;
            gap: 8px;
            min-height: 0;
            padding: 6px 8px;
            font-size: 12px;
            line-height: 1.25;
            box-shadow: 0 1px 7px rgba(0, 0, 0, 0.12);
          }

          .cookie-consent__button {
            min-width: 48px;
            min-height: 32px;
            padding: 4px 12px;
            font-size: 14px;
          }
        }
      `}</style>
    </>
  );
}
