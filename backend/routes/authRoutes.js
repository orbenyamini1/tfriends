const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateUserProfile } = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', upload.single('image'), registerUser);
router.post('/login', loginUser);
router.put('/profile', protect, upload.single('image'), updateUserProfile);

module.exports = router;