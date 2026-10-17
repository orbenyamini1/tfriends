import React from 'react';

const ActivityCard = React.memo(({ activity, onSwipe }) => {
  if (!activity) return null;

  // חילוץ כתובת הבסיס של השרת ללא סיומת /api
  const API_BASE = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
    : 'https://tfriends-backend.onrender.com';

  const UPLOADS_URL = `${API_BASE}/uploads/`;

  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';

  const rawImage = activity.imageUrl || activity.image;

  const imageSrc = rawImage?.startsWith('http')
    ? rawImage
    : (rawImage ? (UPLOADS_URL + rawImage) : DEFAULT_IMAGE);

  return (
    <div style={{
      width: '380px',
      background: '#ffffff',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      userSelect: 'none'
    }}>
      <div style={{ position: 'relative', width: '100%', height: '240px', background: '#e2e8f0' }}>
        <img 
          src={imageSrc} 
          alt={activity.title || 'פעילות'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_IMAGE;
          }}
        />
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(15, 23, 42, 0.75)',
          color: '#ffffff',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          backdropFilter: 'blur(4px)'
        }}>
          🏷️ {activity.category || 'כללי'}
        </div>
      </div>

      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', color: '#0f172a' }}>{activity.title}</h2>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b' }}>📍 {activity.location || 'לא צוין מיקום'}</p>
          <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>
            {activity.description || 'אין תיאור זמין לפעילות זו.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '14px', marginTop: '24px' }}>
          <button 
            onClick={() => onSwipe('dislike')}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '10px',
              border: '2px solid #ef4444',
              background: '#ffffff',
              color: '#ef4444',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            ❌ לא מתאים
          </button>
          <button 
            onClick={() => onSwipe('like')}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: '#10b981',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            💚 זורם לגמרי
          </button>
        </div>
      </div>
    </div>
  );
});

export default ActivityCard;