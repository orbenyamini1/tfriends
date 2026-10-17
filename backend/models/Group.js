const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'שם קבוצה הוא שדה חובה'],
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String,
    default: 'default-group.png'
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Group', groupSchema);