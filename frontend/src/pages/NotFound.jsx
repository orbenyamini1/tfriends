import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      direction: 'rtl',
      background: '#f8fafc',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '96px', margin: 0, color: '#ef4444', fontWeight: 'bold' }}>404</h1>
      <h2 style={{ fontSize: '24px', color: '#0f172a', margin: '10px 0' }}>אופס! הדף לא נמצא</h2>
      <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '400px', marginBottom: '24px', lineHeight: '1.5' }}>
        הקישור שחיפשת אינו קיים במערכת, שונה או הוסר.
      </p>
      <Link 
        to="/" 
        style={{
          padding: '12px 24px',
          backgroundColor: '#2563eb',
          color: '#ffffff',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '14px',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
        }}
      >
        חזרה לדף הבית 🏠
      </Link>
    </div>
  );
};

export default NotFound;