import React from 'react';

export default function RegistrationCard({ card }) {
  const { area_name, display_title, description, image_url, target_url, education_level, program_type } = card;

  // Use a generic placeholder with Kito Marom styles if no image is uploaded
  const cardImage = image_url || `https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=400&auto=format&fit=crop`;

  // Translate category values
  const educationLevelLabel = education_level === 'kindergarten' ? 'גני ילדים' : 'בתי ספר';
  const programTypeLabel = program_type === 'camp' ? 'קייטנות' : 'צהרונים';

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
      {/* Area Badges floating on top of image */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        gap: '6px',
        zIndex: 2,
        maxWidth: 'calc(100% - 32px)',
        direction: 'rtl'
      }}>
        {(() => {
          const areas = area_name ? area_name.split(/[,/]/).map(s => s.trim()).filter(Boolean) : [];
          const maxBadges = 2;
          const displayedAreas = areas.slice(0, maxBadges);
          const extraCount = areas.length - maxBadges;
          
          return (
            <>
              {displayedAreas.map((area, idx) => (
                <span key={idx} className="badge badge-primary" style={{
                  fontSize: '13px',
                  padding: '4px 10px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  fontWeight: '700',
                  whiteSpace: 'nowrap'
                }}>
                  {area}
                </span>
              ))}
              {extraCount > 0 && (
                <span className="badge" style={{
                  fontSize: '13px',
                  padding: '4px 10px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  fontWeight: '700',
                  backgroundColor: 'var(--primary-dark)',
                  color: 'white',
                  whiteSpace: 'nowrap'
                }}>
                  +{extraCount} רשויות
                </span>
              )}
            </>
          );
        })()}
      </div>

      {/* Card Visual Header */}
      <div style={{
        height: '160px',
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
          background: 'linear-gradient(to top, rgba(72, 57, 112, 0.4) 0%, transparent 100%)'
        }}></div>
      </div>

      {/* Card Body */}
      <div style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        gap: '12px'
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
            flexGrow: 1,
            lineHeight: '1.5'
          }}>
            {description}
          </p>
        )}

        {/* Categories Badges */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '8px', marginBottom: '4px' }}>
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
            marginTop: '8px',
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
