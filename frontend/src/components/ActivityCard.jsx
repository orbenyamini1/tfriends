import React from 'react';

const ActivityCard = React.memo(({ activity, onSwipe }) => {
  if (!activity) return null;

  const UPLOADS_URL = 'http://localhost:5000/uploads/';
  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';

  // בדיקה של שני השדות (imageUrl או image)
  const rawImage = activity.imageUrl || activity.image;

  // אם זו כתובת אינטרנט מלאה נשתמש בה, אם זה קובץ מהשרת נשרשר את תיקיית uploads
  const imageSrc = rawImage
    ? (rawImage.startsWith('http') ? rawImage : `${UPLOADS_URL}${rawImage}`)
    : DEFAULT_IMAGE;

  return (
    <div style={{
      width: '380px',
      background: '#ffffff',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ position: 'relative', width: '100%', height: '240px', background: '#e2e8f0' }}>
        <img 
          src={imageSrc} 
          alt={activity.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_IMAGE;
          }}
        />
        <span style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(15, 23, 42, 0.75)',
          color: '#ffffff',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {activity.category}
        </span>
      </div>

      <div style={{ padding: '16px' }}>
        <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#0f172a' }}>{activity.title}</h3>
        <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '13px' }}>📍 {activity.location}</p>
        <p style={{ margin: '0 0 16px 0', color: '#334155', fontSize: '14px', lineHeight: '1.4' }}>{activity.description}</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <button 
            onClick={() => onSwipe('dislike')}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              border: '2px solid #ef4444',
              background: '#fee2e2',
              color: '#ef4444',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
          <button 
            onClick={() => onSwipe('like')}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              border: '2px solid #22c55e',
              background: '#dcfce7',
              color: '#22c55e',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            💚
          </button>
        </div>
      </div>
    </div>
  );
});

export default ActivityCard;
