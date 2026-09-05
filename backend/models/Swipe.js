const mongoose = require('mongoose');

const swipeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  status: {
    type: String,
    enum: ['like', 'dislike'],
    required: true
  }
}, {
  timestamps: true
});

// Compound index: Prevents a user from swiping on the same activity twice
swipeSchema.index({ user: 1, activity: 1 }, { unique: true });

module.exports = mongoose.model('Swipe', swipeSchema);