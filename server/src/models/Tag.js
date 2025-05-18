const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['mention', 'hashtag'],
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 索引优化
tagSchema.index({ name: 1, type: 1 });
tagSchema.index({ count: -1 });

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag; 