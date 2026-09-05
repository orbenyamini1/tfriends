const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// ייבוא נתיבי ה-API
const authRoutes = require('./routes/authRoutes');
const swipeRoutes = require('./routes/swipeRoutes');
const activityRoutes = require('./routes/activityRoutes');
const groupRoutes = require('./routes/groupRoutes');

// טעינת הגדרות ה-env
dotenv.config();

// חיבור למסד הנתונים
connectDB();

const app = express();

// 1. אבטחת כותרות HTTP באמצעות Helmet
// הגדרת crossOriginResourcePolicy מאפשרת ל-React לטעון את התמונות מתיקיית uploads ללא חסימת CORS בדפדפן
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// 2. הגבלת קצב בקשות (Rate Limiting) למניעת התקפות Brute-Force ו-DoS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // חלון זמן של 15 דקות
  max: 150, // מקסימום 150 בקשות ל-IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'יותר מדי בקשות מכתובת זו, נסה שוב בעוד 15 דקות' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // הגבלה מחמירה יותר על התחברות והרשמה
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'יותר מדי ניסיונות כניסה/הרשמה, נסה שוב בעוד 15 דקות' }
});

// הגדרת CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Middlewares לפענוח גוף הבקשה
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// הפיכת תיקיית uploads לציבורית לצורך הצגת תמונות ב-React
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// החלת ה-Rate Limiters על הנתיבים
app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// חיבור נתיבי ה-API לשרת
app.use('/api/auth', authRoutes);
app.use('/api/swipes', swipeRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/groups', groupRoutes);

// נתיב בדיקה ראשוני
app.get('/', (req, res) => {
  res.send('tfriends API is running successfully with Full Stack requirements completed!');
});

const PORT = process.env.PORT || 5000;

// מנגנון גלובלי לטיפול בשגיאות
app.use((err, req, res, next) => {
  console.error('❌ Global Error Caught:', err.message);

  if (err.isJoi) {
    return res.status(400).json({
      status: 'error',
      message: err.details[0].message
    });
  }

  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`🎯 Server is running on port ${PORT}`);
});