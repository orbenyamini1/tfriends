import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // טעינת פרטי המשתמש מ-localStorage בעת עליית האפליקציה
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error('Failed to parse user from localStorage:', err);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  // שמירת נתוני המשתמש והטוקן בעת התחברות / הרשמה
  const loginContext = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // עדכון פרטי המשתמש (למשל שינוי תמונת פרופיל בזמן אמת בלי התנתקות)
  const updateUserContext = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  // התנתקות וניקוי מוחלט של הסשן
  const logoutContext = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginContext, updateUserContext, logoutContext }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};