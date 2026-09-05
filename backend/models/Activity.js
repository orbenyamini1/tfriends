const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'] // למשל: 'Bars', 'Concerts'
  },
  image: {
    type: String,
    default: 'default-activity.jpg' // יישמר שם הקובץ שיועלה דרך Multer
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);