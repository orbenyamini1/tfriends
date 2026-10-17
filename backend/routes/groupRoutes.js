const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// כל נתיבי הקבוצות מוגנים באימות משתמש
router.use(protect);

// יצירת קבוצה + שליפת קבוצות המשתמש
router.post('/', upload.single('image'), groupController.createGroup);
router.get('/', groupController.getUserGroups);

// הצטרפות לקבוצה עם קוד
router.post('/join', groupController.joinGroup);

// עדכון קבוצה (PUT) + מחיקת קבוצה (DELETE)
router.put('/:groupId', upload.single('image'), groupController.updateGroup);
router.delete('/:groupId', groupController.deleteGroup);

// הסרת חבר מסוים מהקבוצה (DELETE)
router.delete('/:groupId/members/:memberId', groupController.removeMember);

// הנתיב שהיה חסר ופתר את שגיאת ה-404:
router.get('/:groupId/matches', groupController.getGroupMatches);

module.exports = router;