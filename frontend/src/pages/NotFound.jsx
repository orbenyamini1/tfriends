import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', direction: 'rtl', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '64px', color: '#2563eb', margin: '0 0 10px 0' }}>404</h1>
      <h2 style={{ color: '#1e293b', marginBottom: '12px' }}>העמוד שחיפשת לא נמצא</h2>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>ייתכן שהכתובת שגויה או שהעמוד הוסר.</p>
      <Link 
        to="/" 
        style={{
          background: '#2563eb',
          color: '#ffffff',
          padding: '10px 20px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 'bold'
        }}
      >
        חזרה לדף הבית
      </Link>
    </div>
  );
};

export default NotFound;