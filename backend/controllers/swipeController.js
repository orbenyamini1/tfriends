const Swipe = require('../models/Swipe');
const User = require('../models/User');
const Activity = require('../models/Activity');

/**
 * @desc    Record a swipe (like/dislike), save category preference, and check for mutual match
 * @route   POST /api/swipes
 * @access  Private
 */
const handleSwipe = async (req, res, next) => {
  try {
    const activityId = req.body.activityId || req.body.activity;
    const status = req.body.status || req.body.direction;
    const userId = req.user ? (req.user._id || req.user.id) : req.body.userId;

    if (!activityId || !status) {
      return res.status(400).json({ message: 'נא לספק activityId ו-status' });
    }

    // 1. שמירת ההחלקה בדאטה-בייס
    const swipe = await Swipe.create({
      user: userId,
      activity: activityId,
      status
    });

    // 2. שמירת העדפת הקטגוריה אם המשתמש עשה לייק
    if (status === 'like') {
      const activity = await Activity.findById(activityId);
      if (activity && activity.category) {
        await User.findByIdAndUpdate(userId, {
          $addToSet: { 'preferences.categories': activity.category }
        });
      }

      // 3. בדיקת Match מול חברים / קבוצה
      const currentUser = await User.findById(userId);
      const friendIds = currentUser?.friends || [];

      if (friendIds.length > 0) {
        const mutualSwipe = await Swipe.findOne({
          user: { $in: friendIds },
          activity: activityId,
          status: 'like'
        }).populate('user', 'name email');

        if (mutualSwipe) {
          return res.status(201).json({
            swipe,
            match: true,
            matchedWith: mutualSwipe.user,
            message: `יש התאמה! אתה ו-${mutualSwipe.user.name} אהבתם את ${activity ? activity.title : 'הפעילות'}!`
          });
        }
      }
    }

    res.status(201).json({ swipe, match: false });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({ message: 'פעילות זו כבר סומנה בעבר', match: false });
    }
    next(error);
  }
};

module.exports = {
  handleSwipe
};