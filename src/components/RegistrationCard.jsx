import React from 'react';

export default function RegistrationCard({ card }) {
  const { area_name, display_title, description, image_url, target_url, education_level, program_type } = card;

  // Use a generic placeholder with Kito Marom styles if no image is uploaded
  const cardImage = image_url || `https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=400&auto=format&fit=crop`;

  // Translate category values
  const educationLevelLabel = education_level === 'kindergarten' ? 'גני ילדים' : 'בתי ספר';
  const programTypeLabel = program_type === 'camp' ? 'קייטנות' : 'צהרונים';

  // Parse areas list
  const areas = area_name ? area_name.split(/[,/]/).map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="card card-hover" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: 0,
      overflow: 'hidden',
      border: '1px solid var(--border-color)',
      backgroundColor: 'white',
      borderRadius: 'var(--radius-md)',
      position: 'relative'
    }}>

      {/* Card Visual Header */}
      <div style={{
        height: '150px',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'var(--primary-light)'
      }}>
        <img 
          src={cardImage} 
          alt={display_title} 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'var(--transition)'
          }}
          className="card-img"
        />
        {/* Soft overlay gradient in Meteorite Purple */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(72, 57, 112, 0.5) 0%, transparent 60%)'
        }}></div>
      </div>

      {/* Card Body */}
      <div style={{
        padding: '20px 24px 24px',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        gap: '10px'
      }}>
        <h3 style={{
          fontSize: '19px',
          color: 'var(--primary-dark)',
          fontWeight: '700',
          lineHeight: '1.3'
        }}>
          {display_title}
        </h3>
        
        {description && (
          <p style={{
            fontSize: '14px',
            color: 'var(--text-muted)',
            lineHeight: '1.5'
          }}>
            {description}
          </p>
        )}

        {/* Areas Section - full list, no truncation */}
        {areas.length > 0 && (
          <div style={{
            borderTop: '1px solid #EEF0F4',
            paddingTop: '12px',
            marginTop: '2px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '8px'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary-purple)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span style={{
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--primary-purple)',
                letterSpacing: '0.02em',
                textTransform: 'uppercase'
              }}>
                רלוונטי לרשויות
              </span>
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              direction: 'rtl'
            }}>
              {areas.map((area, idx) => (
                <span key={idx} style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--primary-dark)',
                  backgroundColor: 'rgba(72, 57, 112, 0.08)',
                  border: '1px solid rgba(72, 57, 112, 0.18)',
                  borderRadius: '6px',
                  padding: '3px 10px',
                  whiteSpace: 'nowrap',
                  lineHeight: '1.6'
                }}>
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Categories Badges */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '6px' }}>
          <span style={{
            fontSize: '12px',
            fontWeight: '600',
            backgroundColor: '#F3F4F6',
            color: '#374151',
            padding: '4px 10px',
            borderRadius: '9999px',
            border: '1px solid var(--border-color)'
          }}>
            {educationLevelLabel}
          </span>
          <span style={{
            fontSize: '12px',
            fontWeight: '600',
            backgroundColor: program_type === 'camp' ? 'rgba(240, 173, 78, 0.15)' : 'rgba(51, 122, 183, 0.12)',
            color: program_type === 'camp' ? '#d97706' : '#2b6cb0',
            padding: '4px 10px',
            borderRadius: '9999px',
            border: program_type === 'camp' ? '1px solid rgba(240, 173, 78, 0.3)' : '1px solid rgba(51, 122, 183, 0.25)'
          }}>
            {programTypeLabel}
          </span>
        </div>

        {/* CTA Button linking to registration */}
        <a 
          href={target_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-primary w-full"
          style={{
            marginTop: '4px',
            padding: '12px',
            fontSize: '15px',
            fontWeight: '700',
            textAlign: 'center',
            display: 'block'
          }}
        >
          מעבר להרשמה מאובטחת
        </a>
      </div>
    </div>
  );
}
