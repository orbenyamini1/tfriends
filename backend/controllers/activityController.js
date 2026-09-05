const Activity = require('../models/Activity');
const Swipe = require('../models/Swipe');
const User = require('../models/User');

/**
 * @desc    Get activities not yet swiped by user, prioritized by user preferences
 * @route   GET /api/activities
 * @access  Private
 */
const getActivities = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null;

    let filter = {};
    let preferredCategories = [];

    if (userId) {
      // 1. שליפת הפעילויות שהמשתמש כבר דירג (user ו-activity בהתאמה למודל)
      const userSwipes = await Swipe.find({ user: userId }).select('activity');
      const swipedActivityIds = userSwipes.map(s => s.activity);

      // סינון פעילויות שכבר החליק עליהן
      filter = { _id: { $nin: swipedActivityIds } };

      // 2. שליפת רשימת הקטגוריות המועדפות של המשתמש
      const currentUser = await User.findById(userId).select('preferences');
      preferredCategories = currentUser?.preferences?.categories || [];
    }

    // 3. שליפת הפעילויות הזמינות
    const activities = await Activity.find(filter);

    // 4. מיון חכם: כרטיסים התואמים את העדפות המשתמש מקבלים עדיפות עליונה
    if (preferredCategories.length > 0) {
      activities.sort((a, b) => {
        const aPref = preferredCategories.includes(a.category) ? 1 : 0;
        const bPref = preferredCategories.includes(b.category) ? 1 : 0;
        return bPref - aPref;
      });
    }

    res.json(activities);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new activity
 * @route   POST /api/activities
 * @access  Private
 */
const createActivity = async (req, res, next) => {
  try {
    const { title, description, category, location, imageUrl } = req.body;
    
    // תמיכה בהעלאת תמונה מקומית או בכתובת רשת (URL)
    const imagePath = req.file ? req.file.filename : (imageUrl || 'default-activity.jpg');

    const newActivity = await Activity.create({
      title,
      description,
      category,
      location,
      imageUrl: imagePath
    });

    res.status(201).json(newActivity);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivities,
  createActivity
};