require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

// ייבוא ראוטרים
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const activityRoutes = require('./routes/activityRoutes');
const swipeRoutes = require('./routes/swipeRoutes');

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" } // פותר את ה-ERR_BLOCKED_BY_RESPONSE
  })
);
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'יותר מדי בקשות נשלחו מהתקן זה, אנא נסה שוב מאוחר יותר.'
  }
});
app.use('/api', apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'יותר מדי ניסיונות התחברות/הרשמה. אנא נסה שוב בעוד 15 דקות.'
  }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

//  CORS ופענוח JSON
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//  נתיבי ה-API
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/swipes', swipeRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'tfriends backend is active' });
});

app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'שגיאת שרת פנימית',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tfriends';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failure:', err.message);
  });

module.exports = app;