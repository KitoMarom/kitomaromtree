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

  return (
    <div className="app-container">
      <Header settings={settings} />

      <main className="main-content" style={{ paddingBottom: '80px' }}>
        {/* Hero Section */}
        <section style={{
          position: 'relative',
          padding: '80px 0',
          backgroundImage: `linear-gradient(135deg, rgba(92, 31, 156, 0.95) 0%, rgba(59, 7, 100, 0.95) 100%), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          textAlign: 'center',
          borderBottom: '6px solid var(--accent-gold)'
        }}>
          {/* Subtle geometric circles */}
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.03)',
            pointerEvents: 'none'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '15%',
            right: '8%',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.04)',
            pointerEvents: 'none'
          }}></div>

          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <span style={{
              display: 'inline-block',
              backgroundColor: 'var(--accent-gold)',
              color: 'var(--primary-dark)',
              fontWeight: '800',
              padding: '6px 16px',
              borderRadius: '9999px',
              fontSize: '14px',
              marginBottom: '16px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}>
              ✨ הרשמה לשנת הלימודים תשפ"ו
            </span>
            
            <h1 style={{
              color: 'white',
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: '800',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              marginBottom: '16px',
              lineHeight: '1.2'
            }}>
              {settings?.page_title}
            </h1>
            
            <p style={{
              fontSize: 'clamp(16px, 2.5vw, 20px)',
              color: '#f3e8ff',
              maxWidth: '800px',
              margin: '0 auto 24px',
              lineHeight: '1.6',
              fontWeight: '500'
            }}>
              {settings?.page_subtitle}
            </p>

            {settings?.intro_text && (
              <p style={{
                fontSize: '15px',
                color: '#e9d5ff',
                maxWidth: '650px',
                margin: '0 auto',
                lineHeight: '1.6',
                borderTop: '1px solid rgba(255,255,255,0.15)',
                paddingTop: '16px'
              }}>
                {settings.intro_text}
              </p>
            )}
          </div>
        </section>

        {/* Error State */}
        {error && (
          <section style={{ marginTop: '40px' }}>
            <div className="container">
              <div className="card text-center" style={{ borderLeft: '5px solid var(--danger)', backgroundColor: '#fef2f2' }}>
                <p style={{ color: '#b91c1c', fontWeight: '600', fontSize: '16px' }}>{error}</p>
              </div>
            </div>
          </section>
        )}

        {/* Cards Section */}
        {!error && (
          <section style={{ marginTop: '50px' }}>
            <div className="container">
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '40px'
              }}>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  color: 'var(--primary-dark)',
                  position: 'relative',
                  paddingBottom: '8px'
                }}>
                  קישורי הרשמה לפי אזורים
                </h2>
                <div style={{
                  width: '60px',
                  height: '4px',
                  backgroundColor: 'var(--primary-purple)',
                  borderRadius: '2px'
                }}></div>
              </div>

              {cards.length === 0 ? (
                <div className="card text-center" style={{ padding: '60px 24px', backgroundColor: '#f8fafc' }}>
                  <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>ℹ️</span>
                  <h3 style={{ fontSize: '20px', color: 'var(--text-muted)', fontWeight: '700' }}>אין כרגע קישורי הרשמה פעילים</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '8px' }}>
                    מחלקת הרישום מעדכנת את העמוד כעת. אנא חזרו לבקר שוב בקרוב.
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '30px'
                }}>
                  {cards.map((card) => (
                    <RegistrationCard key={card.id} card={card} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Contact Strip */}
        <section style={{ marginTop: '70px' }}>
          <div className="container">
            <div className="card glass" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '24px',
              padding: '30px 40px',
              borderRadius: 'var(--radius-md)',
              borderRight: '6px solid var(--primary-purple)'
            }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary-dark)' }}>צריכים עזרה ברישום? 🙋</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '4px' }}>
                  מוקד השירות והרישום של קיטו מרום זמין עבורכם לכל שאלה או קושי טכני.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {settings?.contact_phone && (
                  <a href={`tel:${settings.contact_phone}`} className="btn btn-primary" style={{ padding: '12px 28px' }}>
                    📞 התקשרו: {settings.contact_phone}
                  </a>
                )}
                {settings?.contact_email && (
                  <a href={`mailto:${settings.contact_email}`} className="btn btn-outline" style={{ padding: '12px 28px' }}>
                    ✉️ שלחו אימייל
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
