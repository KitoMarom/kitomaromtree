import React from 'react';

export default function RegistrationCard({ card }) {
  const { area_name, display_title, description, image_url, target_url } = card;

  // Use a generic placeholder with Kito Marom styles if no image is uploaded
  const cardImage = image_url || `https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=400&auto=format&fit=crop`;

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
      {/* Area Badge floating on top of image */}
      <span className="badge badge-primary" style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        fontSize: '14px',
        padding: '6px 14px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
        zIndex: 2,
        fontWeight: '700'
      }}>
        📍 {area_name}
      </span>

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
        {/* Soft overlay gradient */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(92, 31, 156, 0.4) 0%, transparent 100%)'
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

        {/* CTA Button linking to registration */}
        <a 
          href={target_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-primary w-full"
          style={{
            marginTop: '12px',
            padding: '12px',
            fontSize: '15px',
            fontWeight: '700',
            textAlign: 'center',
            display: 'block'
          }}
        >
          מעבר להרשמה מאובטחת 🚀
        </a>
      </div>
    </div>
  );
}
