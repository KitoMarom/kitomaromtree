import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RegistrationCard from '../components/RegistrationCard';

export default function PublicPage() {
  const [settings, setSettings] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all'); // all, school, kindergarten
  const [selectedActivity, setSelectedActivity] = useState('all'); // all, after_school, camp

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // 1. Fetch public settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('page_settings')
          .select('*')
          .eq('id', '00000000-0000-0000-0000-000000000000')
          .single();

        if (settingsError) throw settingsError;
        setSettings(settingsData);

        // 2. Fetch active registration cards sorted by sort_order
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
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-main)',
        fontFamily: 'var(--font-family)',
        gap: '16px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid var(--primary-light)',
          borderTop: '5px solid var(--primary-purple)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--primary-dark)' }}>טוען עמוד הרשמה...</span>
      </div>
    );
  }

  const heroImage = settings?.hero_image_url || `https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop`;

  // Extract unique areas from active cards
  const uniqueAreas = Array.from(new Set(cards.map(c => c.area_name).filter(Boolean)));

  // Filter logic
  const filteredCards = cards.filter(card => {
    const matchesArea = !selectedArea || card.area_name === selectedArea;
    const cardLevel = card.education_level || 'school';
    const cardActivity = card.program_type || 'after_school';
    
    const matchesLevel = selectedLevel === 'all' || cardLevel === selectedLevel;
    const matchesActivity = selectedActivity === 'all' || cardActivity === selectedActivity;
    
    return matchesArea && matchesLevel && matchesActivity;
  });

  return (
    <div className="app-container">
      <Header settings={settings} />

      <main className="main-content" style={{ paddingBottom: '60px' }}>
        {/* Simplified Hero Section */}
        <section style={{
          position: 'relative',
          padding: '40px 0',
          backgroundImage: `linear-gradient(135deg, rgba(72, 57, 112, 0.95) 0%, rgba(48, 35, 80, 0.95) 100%), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          textAlign: 'center',
          borderBottom: '5px solid var(--accent-gold)'
        }}>
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{
              color: 'white',
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: '800',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              marginBottom: '12px',
              lineHeight: '1.2'
            }}>
              {settings?.page_title}
            </h1>
            
            <p style={{
              fontSize: 'clamp(15px, 2vw, 18px)',
              color: '#f3e8ff',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.6',
              fontWeight: '500'
            }}>
              {settings?.page_subtitle}
            </p>
          </div>
        </section>

        {/* Error State */}
        {error && (
          <section style={{ marginTop: '30px' }}>
            <div className="container">
              <div className="card text-center" style={{ borderLeft: '5px solid var(--danger)', backgroundColor: '#fef2f2' }}>
                <p style={{ color: '#b91c1c', fontWeight: '600', fontSize: '16px' }}>{error}</p>
              </div>
            </div>
          </section>
        )}

        {/* Filters & Cards Section */}
        {!error && (
          <section style={{ marginTop: '35px' }}>
            <div className="container">
              
              {/* Premium Horizontal Filter Bar */}
              <div className="card" style={{
                padding: '20px',
                marginBottom: '35px',
                backgroundColor: 'white',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '24px',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  {/* Filter Group: Area */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    flex: '1 1 200px'
                  }}>
                    <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary-dark)' }}>אזור בארץ</label>
                    <select
                      className="form-control"
                      style={{ padding: '10px 14px', fontSize: '15px' }}
                      value={selectedArea}
                      onChange={(e) => setSelectedArea(e.target.value)}
                    >
                      <option value="">כל האזורים</option>
                      {uniqueAreas.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filter Group: Education Level */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    flex: '1 1 250px'
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary-dark)' }}>מוסד חינוכי</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedLevel('all')}
                        style={{
                          flex: 1,
                          padding: '10px 8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          borderRadius: 'var(--radius-sm)',
                          border: selectedLevel === 'all' ? '2px solid var(--primary-purple)' : '1px solid var(--border-color)',
                          backgroundColor: selectedLevel === 'all' ? 'var(--primary-light)' : 'white',
                          color: selectedLevel === 'all' ? 'var(--primary-purple)' : 'var(--text-dark)',
                          cursor: 'pointer',
                          transition: 'var(--transition)'
                        }}
                      >
                        הכל
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedLevel('school')}
                        style={{
                          flex: 1,
                          padding: '10px 8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          borderRadius: 'var(--radius-sm)',
                          border: selectedLevel === 'school' ? '2px solid var(--primary-purple)' : '1px solid var(--border-color)',
                          backgroundColor: selectedLevel === 'school' ? 'var(--primary-light)' : 'white',
                          color: selectedLevel === 'school' ? 'var(--primary-purple)' : 'var(--text-dark)',
                          cursor: 'pointer',
                          transition: 'var(--transition)'
                        }}
                      >
                        בתי ספר
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedLevel('kindergarten')}
                        style={{
                          flex: 1,
                          padding: '10px 8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          borderRadius: 'var(--radius-sm)',
                          border: selectedLevel === 'kindergarten' ? '2px solid var(--primary-purple)' : '1px solid var(--border-color)',
                          backgroundColor: selectedLevel === 'kindergarten' ? 'var(--primary-light)' : 'white',
                          color: selectedLevel === 'kindergarten' ? 'var(--primary-purple)' : 'var(--text-dark)',
                          cursor: 'pointer',
                          transition: 'var(--transition)'
                        }}
                      >
                        גני ילדים
                      </button>
                    </div>
                  </div>

                  {/* Filter Group: Program Type */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    flex: '1 1 250px'
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary-dark)' }}>סוג פעילות</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedActivity('all')}
                        style={{
                          flex: 1,
                          padding: '10px 8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          borderRadius: 'var(--radius-sm)',
                          border: selectedActivity === 'all' ? '2px solid var(--primary-purple)' : '1px solid var(--border-color)',
                          backgroundColor: selectedActivity === 'all' ? 'var(--primary-light)' : 'white',
                          color: selectedActivity === 'all' ? 'var(--primary-purple)' : 'var(--text-dark)',
                          cursor: 'pointer',
                          transition: 'var(--transition)'
                        }}
                      >
                        הכל
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedActivity('after_school')}
                        style={{
                          flex: 1,
                          padding: '10px 8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          borderRadius: 'var(--radius-sm)',
                          border: selectedActivity === 'after_school' ? '2px solid var(--primary-purple)' : '1px solid var(--border-color)',
                          backgroundColor: selectedActivity === 'after_school' ? 'var(--primary-light)' : 'white',
                          color: selectedActivity === 'after_school' ? 'var(--primary-purple)' : 'var(--text-dark)',
                          cursor: 'pointer',
                          transition: 'var(--transition)'
                        }}
                      >
                        צהרונים
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedActivity('camp')}
                        style={{
                          flex: 1,
                          padding: '10px 8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          borderRadius: 'var(--radius-sm)',
                          border: selectedActivity === 'camp' ? '2px solid var(--primary-purple)' : '1px solid var(--border-color)',
                          backgroundColor: selectedActivity === 'camp' ? 'var(--primary-light)' : 'white',
                          color: selectedActivity === 'camp' ? 'var(--primary-purple)' : 'var(--text-dark)',
                          cursor: 'pointer',
                          transition: 'var(--transition)'
                        }}
                      >
                        קייטנות
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title Section */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '30px'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  color: 'var(--primary-dark)',
                  position: 'relative',
                  paddingBottom: '4px'
                }}>
                  קישורי הרשמה לפי אזורים
                </h2>
                <div style={{
                  width: '50px',
                  height: '3px',
                  backgroundColor: 'var(--primary-purple)',
                  borderRadius: '2px'
                }}></div>
              </div>

              {/* Dynamic Card Display */}
              {filteredCards.length === 0 ? (
                <div className="card text-center" style={{ padding: '50px 24px', backgroundColor: '#f8fafc' }}>
                  <h3 style={{ fontSize: '18px', color: 'var(--text-muted)', fontWeight: '700' }}>לא נמצאו קישורי הרשמה מתאימים לסינון שנבחר</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>
                    נסו לשנות את בחירת הסינון או לבחור "הכל" כדי לצפות בכל הקישורים הפעילים.
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '24px'
                }}>
                  {filteredCards.map((card) => (
                    <RegistrationCard key={card.id} card={card} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <Footer settings={settings} />
    </div>
  );
}
