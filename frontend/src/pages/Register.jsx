import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginContext } = useContext(AuthContext);
  const navigate = useNavigate();

  // טיפול בבחירת תמונה ותצוגה מקדימה
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. יצירת אובייקט FormData לשליחת שדות + קובץ
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('email', email.trim());
      formData.append('password', password);
      
      if (profileImage) {
        formData.append('image', profileImage); // מתאים ל-upload.single('image')
      }

      // 2. שליחה לשרת
      const { data } = await API.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // 3. שמירת כל נתוני המשתמש כולל ה-profileImage וה-ID ב-Context
      loginContext(
        { 
          _id: data._id, 
          name: data.name, 
          email: data.email, 
          profileImage: data.profileImage 
        }, 
        data.token
      );

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה בהרשמה למערכת');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '420px', 
      margin: '60px auto', 
      padding: '30px', 
      background: '#ffffff', 
      borderRadius: '12px', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
      border: '1px solid #e2e8f0', 
      direction: 'rtl',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ textAlign: 'center', margin: '0 0 20px 0', color: '#1e293b' }}>הרשמה ל-tfriends 🚀</h2>
      
      {error && (
        <div style={{ 
          background: '#fee2e2', 
          color: '#dc2626', 
          padding: '10px', 
          borderRadius: '6px', 
          marginBottom: '15px', 
          fontSize: '13px', 
          textAlign: 'center' 
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* תצוגה מקדימה והעלאת תמונת פרופיל */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          marginBottom: '5px' 
        }}>
          {previewUrl ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <img 
                src={previewUrl} 
                alt="תצוגה מקדימה" 
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2563eb' }}
              />
              <button 
                type="button" 
                onClick={handleRemoveImage}
                style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer' }}
              >
                החלף תמונה ✕
              </button>
            </div>
          ) : (
            <label style={{ cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ 
                width: '75px', 
                height: '75px', 
                borderRadius: '50%', 
                background: '#f1f5f9', 
                border: '2px dashed #cbd5e1', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 6px auto'
              }}>
                <span style={{ fontSize: '24px' }}>📷</span>
              </div>
              <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold' }}>הוסף תמונת פרופיל</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>

        <div>
          <label style={{ fontSize: '13px', color: '#475569', display: 'block', marginBottom: '4px' }}>שם מלא:</label>
          <input 
            type="text" 
            placeholder="למשל: ישראל ישראלי" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '13px', color: '#475569', display: 'block', marginBottom: '4px' }}>אימייל:</label>
          <input 
            type="email" 
            placeholder="name@example.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '13px', color: '#475569', display: 'block', marginBottom: '4px' }}>סיסמה:</label>
          <input 
            type="password" 
            placeholder="לפחות 6 תווים..." 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            minLength={6}
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            marginTop: '10px',
            padding: '11px', 
            background: loading ? '#94a3b8' : '#2563eb', 
            color: '#ffffff', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: loading ? 'not-allowed' : 'pointer', 
            fontWeight: 'bold',
            fontSize: '15px'
          }}
        >
          {loading ? 'רושם משתמש...' : 'הירשם למערכת 🚀'}
        </button>
      </form>

      <p style={{ marginTop: '20px', fontSize: '13px', textAlign: 'center', color: '#64748b' }}>
        כבר נרשמת? <Link to="/login" style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'none' }}>התחבר כאן</Link>
      </p>
    </div>
  );
};

export default Register;