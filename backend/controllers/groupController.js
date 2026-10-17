const Group = require('../models/Group');
const Swipe = require('../models/Swipe');

// 1. CREATE - יצירת קבוצה חדשה (עם העלאת תמונה)
const createGroup = async (req, res, next) => {
  try {
    const { name } = req.body;
    const adminId = req.user._id;

    if (!name) {
      return res.status(400).json({ message: 'נא להזין שם לקבוצה' });
    }

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const groupImage = req.file ? req.file.filename : 'default-group.png';

    const group = await Group.create({
      name,
      code,
      image: groupImage,
      admin: adminId,
      members: [adminId], // המנהל מתווסף אוטומטית כחבר קבוצה
      matches: []
    });

    await group.populate('members', 'name email profileImage');
    await group.populate('admin', 'name email');

    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
};

// 2. READ - שליפת כל הקבוצות שבהן המשתמש חבר
const getUserGroups = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({ members: userId })
      .populate('members', 'name email profileImage')
      .populate('admin', 'name email')
      .populate('matches');

    res.json(groups);
  } catch (error) {
    next(error);
  }
};

// 3. JOIN - הצטרפות לקבוצה באמצעות קוד
const joinGroup = async (req, res, next) => {
  try {
    const { code } = req.body;
    const userId = req.user._id;

    const group = await Group.findOne({ code: code.toUpperCase() });
    if (!group) {
      return res.status(404).json({ message: 'קבוצה לא נמצאה עם הקוד הוזן' });
    }

    if (group.members.includes(userId)) {
      return res.status(400).json({ message: 'אתה כבר חבר בקבוצה זו' });
    }

    group.members.push(userId);
    await group.save();

    await group.populate('members', 'name email profileImage');
    await group.populate('admin', 'name email');
    await group.populate('matches');

    res.json(group);
  } catch (error) {
    next(error);
  }
};

// 4. UPDATE - עדכון פרטי קבוצה (מנהל בלבד)
const updateGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { name } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'הקבוצה לא נמצאה' });
    }

    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'רק מנהל הקבוצה מורשה לעדכן את פרטיה' });
    }

    if (name) group.name = name;
    if (req.file) group.image = req.file.filename;

    await group.save();
    await group.populate('members', 'name email profileImage');
    await group.populate('matches');

    res.json(group);
  } catch (error) {
    next(error);
  }
};

// 5. MATCHES - שליפת כל ההתאמות הפעילות עבור קבוצה מסוימת (כולל אובייקט Activity מלא)
const getGroupMatches = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId).populate('matches');

    if (!group) {
      return res.status(404).json({ success: false, message: 'קבוצה לא נמצאה' });
    }

    // שליפת כל הלייקים של חברי הקבוצה כדי להצליב
    const groupLikes = await Swipe.find({
      user: { $in: group.members },
      status: 'like'
    })
      .populate('user', 'name')
      .populate('activity');

    // קיבוץ לפי Activity
    const activityMap = {};
    groupLikes.forEach((swipe) => {
      if (!swipe.activity) return;
      const actId = swipe.activity._id.toString();
      if (!activityMap[actId]) {
        activityMap[actId] = {
          activity: swipe.activity,
          users: []
        };
      }
      activityMap[actId].users.push(swipe.user?.name || 'משתמש');
    });

    // כל פעילות שלפחות 2 חברים עשו לה לייק
    const computedMatches = Object.values(activityMap)
      .filter((item) => item.users.length >= 2)
      .map((item) => ({
        id: item.activity._id,
        activity: item.activity,
        activityTitle: item.activity.title,
        users: item.users,
        message: `יש התאמה בקבוצה "${group.name}" על ${item.activity.title}! 🎉 (חברים: ${item.users.join(', ')})`
      }));

    // סנכרון עם שדה ה-matches ב-DB במידה ועוד לא נשמרו
    const matchedActivityIds = computedMatches.map((m) => m.activity._id);
    if (matchedActivityIds.length > 0) {
      await Group.findByIdAndUpdate(groupId, {
        $addToSet: { matches: {$each: matchedActivityIds } }
      });
    }

    res.status(200).json({ 
      success: true, 
      matches: computedMatches,
      savedMatches: group.matches 
    });
  } catch (error) {
    next(error);
  }
};

// 6. DELETE - הסרת חבר מהקבוצה
const removeMember = async (req, res, next) => {
  try {
    const { groupId, memberId } = req.params;
    const currentUserId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'הקבוצה לא נמצאה' });
    }

    const isAdmin = group.admin.toString() === currentUserId.toString();
    const isSelfRemoval = memberId.toString() === currentUserId.toString();

    if (!isAdmin && !isSelfRemoval) {
      return res.status(403).json({ message: 'אין לך הרשאה להסיר משתמש זה מהקבוצה' });
    }

    if (isAdmin && isSelfRemoval) {
      return res.status(400).json({ message: 'מנהל הקבוצה אינו יכול לעזוב. ניתן למחוק את הקבוצה לחלוטין.' });
    }

    group.members = group.members.filter((id) => id.toString() !== memberId.toString());
    await group.save();
    await group.populate('members', 'name email profileImage');

    res.json({ message: 'המשתמש הוסר מהקבוצה בהצלחה', group });
  } catch (error) {
    next(error);
  }
};

// 7. DELETE - מחיקת קבוצה לחלוטין
const deleteGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'הקבוצה לא נמצאה' });
    }

    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'רק מנהל הקבוצה רשאי למחוק אותה' });
    }

    await Group.findByIdAndDelete(groupId);
    res.json({ message: 'הקבוצה נמחקה בהצלחה' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGroup,
  getUserGroups,
  joinGroup,
  updateGroup,
  getGroupMatches,
  removeMember,
  deleteGroup
};