import axios from 'axios';

// הגדרת כתובת הבסיס של שרת ה-Node.js שלנו
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api` 
    : 'https://tfriends-backend.onrender.com/api',
});
// Middleware של Axios: מצרף אוטומטית את ה-JWT Token לכל בקשה שיוצאת לשרת
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;