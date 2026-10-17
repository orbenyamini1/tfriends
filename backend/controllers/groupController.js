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
      members: [adminId] // המנהל מתווסף אוטומטית כחבר קבוצה
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
      .populate('admin', 'name email');

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

    // בדיקת הרשאת מנהל
    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'רק מנהל הקבוצה מורשה לעדכן את פרטיה' });
    }

    if (name) group.name = name;
    if (req.file) group.image = req.file.filename;

    await group.save();
    await group.populate('members', 'name email profileImage');

    res.json(group);
  } catch (error) {
    next(error);
  }
};

// 5. MATCHES - שליפת כל ההתאמות הפעילות עבור קבוצה מסוימת (לפחות 2 חברים עשו לייק)
const getGroupMatches = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'קבוצה לא נמצאה' });
    }

    // שליפת כל הלייקים של חברי הקבוצה
    const groupLikes = await Swipe.find({
      user: { $in: group.members },
      status: 'like'
    })
      .populate('user', 'name')
      .populate('activity');

    // קיבוץ הלייקים לפי Activity
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

    // סינון: רק פעילויות שלפחות 2 חברים שונים עשו להן לייק
    const matches = Object.values(activityMap)
      .filter((item) => item.users.length >= 2)
      .map((item) => ({
        id: item.activity._id,
        activityTitle: item.activity.title,
        message: `יש התאמה בקבוצה "${group.name}" על ${item.activity.title}! 🎉 (חברים: ${item.users.join(', ')})`
      }));

    res.status(200).json({ success: true, matches });
  } catch (error) {
    next(error);
  }
};

// 6. DELETE - הסרת חבר מהקבוצה (מנהל מסיר חבר / חבר עוזב מרצונו)
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

    // רק מנהל יכול להסיר חברים אחרים, או שמשתמש עוזב בעצמו
    if (!isAdmin && !isSelfRemoval) {
      return res.status(403).json({ message: 'אין לך הרשאה להסיר משתמש זה מהקבוצה' });
    }

    // מנהל אינו יכול להסיר את עצמו כל עוד הוא Admin (אלא אם מוחקים את הקבוצה)
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

// 7. DELETE - מחיקת קבוצה לחלוטין (הרשאת Admin בלבד)
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