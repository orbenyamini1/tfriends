const Swipe = require('../models/Swipe');
const Group = require('../models/Group');

// רישום סווייפ ובדיקת התאמה (Match) קבוצתית
const handleSwipe = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { activityId, status, groupId } = req.body;

    if (!activityId || !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'activityId and status are required' 
      });
    }

    // 1. שמירה או עדכון של הסווייפ ב-MongoDB
    let swipe = await Swipe.findOne({ user: userId, activity: activityId });
    if (swipe) {
      swipe.status = status;
      await swipe.save();
    } else {
      swipe = await Swipe.create({
        user: userId,
        activity: activityId,
        status: status
      });
    }

    let isMatch = false;
    let matchedUsers = [];

    // 2. בדיקת התאמה: אם נשלח לייק
    if (status === 'like') {
      let targetGroup = null;

      if (groupId) {
        targetGroup = await Group.findById(groupId);
      } else {
        targetGroup = await Group.findOne({ members: userId });
      }

      if (targetGroup) {
        // שליפת כל הלייקים של חברי הקבוצה עבור אותה פעילות
        const groupLikes = await Swipe.find({
          activity: activityId,
          status: 'like',
          user: { $in: targetGroup.members }
        }).populate('user', 'name email');

        // אם לפחות 2 חברים שונים בקבוצה אהבו את הפעילות - מוכרזת התאמה!
        if (groupLikes.length >= 2) {
          isMatch = true;
          matchedUsers = groupLikes.map((gl) => gl.user?.name || 'משתמש');

          // עדכון היסטוריית הקבוצה ב-DB כדי שהמאטץ' יישמר לתמיד
          await Group.findByIdAndUpdate(targetGroup._id, {
            $addToSet: { matches: activityId }
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      swipe,
      match: isMatch,
      matchedUsers,
      message: isMatch ? 'יש התאמה בקבוצה! 🎉' : 'הסווייפ נקלט בהצלחה'
    });
  } catch (error) {
    next(error);
  }
};

// שליפת היסטוריית הסווייפים המלאה של המשתמש מ-MongoDB
const getUserSwipes = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    const swipes = await Swipe.find({ user: userId })
      .populate('activity', 'title category image imageUrl')
      .sort({ createdAt: -1 });

    res.status(200).json(swipes);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleSwipe,
  getUserSwipes
};