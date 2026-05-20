import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';
import Header from '../components/Header';

const SETTINGS_ID = '00000000-0000-0000-0000-000000000000';

const audienceLabels = {
  school: 'בתי ספר',
  kindergarten: 'גני ילדים',
  both: 'בתי ספר וגני ילדים'
};

function getAudienceLabel(value) {
  return audienceLabels[value] || audienceLabels.school;
}

function sortByOrderAndArea(first, second) {
  const firstOrder = Number(first.sort_order) || 0;
  const secondOrder = Number(second.sort_order) || 0;

  if (firstOrder !== secondOrder) {
    return firstOrder - secondOrder;
  }

  return (first.area_name || '').localeCompare(second.area_name || '', 'he');
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
      areas: group.areas.sort(sortByOrderAndArea)
    }))
    .sort((first, second) => {
      if (first.sortOrder !== second.sortOrder) {
        return first.sortOrder - second.sortOrder;
      }

      return first.title.localeCompare(second.title, 'he');
    });
}

export default function PublicPage({ registrationId, onNavigate }) {
  const [settings, setSettings] = useState(null);
  const [cards, setCards] = useState([]);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        setSelectedRegistration(null);

        const { data: settingsData, error: settingsError } = await supabase
          .from('page_settings')
          .select('*')
          .eq('id', SETTINGS_ID)
          .single();

        if (settingsError) throw settingsError;
        setSettings(settingsData);

        if (registrationId) {
          const { data: registrationData, error: registrationError } = await supabase
            .from('registration_cards')
            .select('*')
            .eq('id', registrationId)
            .eq('is_active', true)
            .single();

          if (registrationError) throw registrationError;
          setSelectedRegistration(registrationData);
          setCards([]);
          return;
        }

        const { data: cardsData, error: cardsError } = await supabase
          .from('registration_cards')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (cardsError) throw cardsError;
        setCards(cardsData || []);
      } catch (err) {
        console.error('Error loading public page data:', err);
        setError('אירעה שגיאה בטעינת העמוד. אנא נסו לרענן שוב מאוחר יותר.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [registrationId]);

  const activityGroups = useMemo(() => groupByActivity(cards), [cards]);

  function navigate(event, path) {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-main)',
        fontFamily: 'var(--font-family)'
      }}>
        <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary-dark)' }}>
          טוען...
        </span>
      </div>
    );
  }

  const pageTitle = settings?.page_title || 'קיטו מרום';

  return (
    <div className="app-container" style={{ backgroundColor: 'var(--bg-main)' }}>
      <Header settings={settings} />

      <main className="main-content" style={{ paddingBottom: '56px' }}>
        <section style={{
          backgroundColor: 'var(--bg-main)',
          borderBottom: '1px solid var(--border-color)',
          padding: '30px 0 22px',
          textAlign: 'center'
        }}>
          <div className="container" style={{ maxWidth: '760px' }}>
            <h1 style={{
              fontSize: 'clamp(30px, 7vw, 42px)',
              fontWeight: '800',
              color: 'var(--primary-dark)',
              lineHeight: '1.15'
            }}>
              {pageTitle}
            </h1>
          </div>
        </section>

        {error && (
          <section style={{ marginTop: '24px' }}>
            <div className="container" style={{ maxWidth: '760px' }}>
              <div className="card text-center" style={{ backgroundColor: '#fef2f2' }}>
                <p style={{ color: '#991b1b', fontWeight: '700', fontSize: '16px' }}>{error}</p>
              </div>
            </div>
          </section>
        )}

        {!error && registrationId && selectedRegistration && (
          <section style={{ marginTop: '24px' }}>
            <div className="container" style={{ maxWidth: '760px' }}>
              <a
                href="/"
                onClick={(event) => navigate(event, '/')}
                style={{
                  display: 'inline-flex',
                  marginBottom: '18px',
                  fontSize: '15px',
                  fontWeight: '700',
                  color: 'var(--primary-purple)'
                }}
              >
                חזרה לכל הפעילויות
              </a>

              <article className="card" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                padding: '28px',
                backgroundColor: '#ffffff'
              }}>
                <div>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    minHeight: '36px',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary-dark)',
                    fontSize: '15px',
                    fontWeight: '800'
                  }}>
                    {getAudienceLabel(selectedRegistration.education_level)}
                  </span>
                </div>

                <div>
                  <h2 style={{
                    fontSize: 'clamp(24px, 6vw, 34px)',
                    fontWeight: '800',
                    color: 'var(--primary-dark)',
                    lineHeight: '1.2',
                    marginBottom: '8px'
                  }}>
                    {selectedRegistration.display_title}
                  </h2>
                  <p style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: 'var(--secondary-color)'
                  }}>
                    {selectedRegistration.area_name}
                  </p>
                </div>

                {selectedRegistration.description && (
                  <p style={{
                    fontSize: '18px',
                    lineHeight: '1.75',
                    color: 'var(--text-dark)',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedRegistration.description}
                  </p>
                )}

                <a
                  href={selectedRegistration.target_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    minHeight: '54px',
                    fontSize: '18px',
                    fontWeight: '800',
                    marginTop: '4px'
                  }}
                >
                  מעבר להרשמה
                </a>
              </article>
            </div>
          </section>
        )}

        {!error && !registrationId && (
          <section style={{ marginTop: '24px' }}>
            <div className="container" style={{
              maxWidth: '760px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {activityGroups.length === 0 ? (
                <div className="card text-center" style={{ padding: '38px 22px', backgroundColor: '#ffffff' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight: '700' }}>
                    אין כרגע הרשמות פעילות.
                  </p>
                </div>
              ) : (
                activityGroups.map((activity) => (
                  <article
                    key={activity.title}
                    className="card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      padding: '24px',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <h2 style={{
                      fontSize: 'clamp(22px, 5vw, 30px)',
                      fontWeight: '800',
                      color: 'var(--primary-dark)',
                      lineHeight: '1.25'
                    }}>
                      {activity.title}
                    </h2>

                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}>
                      {activity.areas.map((area) => (
                        <a
                          key={area.id}
                          href={`/registration/${area.id}`}
                          onClick={(event) => navigate(event, `/registration/${area.id}`)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '48px',
                            padding: '10px 18px',
                            borderRadius: '999px',
                            border: '1px solid var(--primary-purple)',
                            backgroundColor: 'var(--primary-light)',
                            color: 'var(--primary-dark)',
                            fontSize: '18px',
                            fontWeight: '800',
                            lineHeight: '1.2'
                          }}
                        >
                          {area.area_name}
                        </a>
                      ))}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
