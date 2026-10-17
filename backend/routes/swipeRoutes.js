const express = require('express');
const router = express.Router();
const Swipe = require('../models/Swipe');
const { handleSwipe } = require('../controllers/swipeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const swipes = await Swipe.find({ user: userId })
      .populate('activity', 'title category image imageUrl')
      .sort({ createdAt: -1 });

    res.status(200).json(swipes);
  } catch (error) {
    next(error);
  }
});

// רישום סווייפ חדש (POST)
router.post('/', handleSwipe);

module.exports = router;