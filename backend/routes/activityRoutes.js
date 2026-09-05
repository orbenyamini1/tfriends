const express = require('express');
const router = express.Router();
const Joi = require('joi');
const activityController = require('../controllers/activityController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// סכמת אימות לפעילות חדשה (Joi)
const activitySchema = Joi.object({
  title: Joi.string().min(2).required().messages({
    'string.empty': 'שם הפעילות הוא שדה חובה',
    'string.min': 'שם הפעילות חייב להכיל לפחות 2 תווים'
  }),
  category: Joi.string().required().messages({
    'string.empty': 'קטגוריה היא שדה חובה'
  }),
  location: Joi.string().required().messages({
    'string.empty': 'מיקום הוא שדה חובה'
  }),
  description: Joi.string().allow('').optional(),
  imageUrl: Joi.string().allow('').optional()
}).unknown(true); // מאפשר שדות נוספים שנשלחים ב-FormData

// מידלוור לאימות הנתונים
const validateActivity = (req, res, next) => {
  const { error } = activitySchema.validate(req.body);
  if (error) {
    error.status = 400;
    return next(error);
  }
  next();
};

// שליפת פעילויות מותאמות אישית
router.get('/', protect, activityController.getActivities);

// יצירת פעילות חדשה עם הגנה, העלאת תמונה ואימות נתונים
router.post(
  '/', 
  protect, 
  upload.single('image'), 
  validateActivity, 
  activityController.createActivity
);

module.exports = router;