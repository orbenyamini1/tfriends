const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @desc    Middleware to protect routes and verify JWT token
 * @param   {Object} req - Request object, attaches user if verified
 * @param   {Object} res
 * @param   {Function} next - Moves to the next controller
 */
const protect = async (req, res, next) => {
  let token;

  // בדיקה אם הטוקן נשלח ב-Header של הבקשה במבנה המקובל (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // חילוץ הטוקן מתוך המחרוזת
      token = req.headers.authorization.split(' ')[1];

      // אימות ה-Token באמצעות המפתח הסודי שלנו מה-.env
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // שליפת פרטי המשתמש מה-DB (ללא הסיסמה) והצמדתם לאובייקט req
      req.user = await User.findById(decoded.id);

      // אישור מעבר לפונקציה הבאה ב-Controller
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // מקרה שבו לא נשלח טוקן בכלל
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };