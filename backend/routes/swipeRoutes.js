const express = require('express');
const router = express.Router();
const { handleSwipe } = require('../controllers/swipeController');
const { protect } = require('../middleware/authMiddleware');

// הנתיב מוגן - רק משתמש עם טוקן בתוקף יכול לבצע POST
router.post('/', protect, handleSwipe);

module.exports = router;