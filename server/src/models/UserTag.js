const mongoose = require('mongoose');

const userTagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['interest', 'skill', 'profession', 'hobby', 'other'],
    default: 'other'
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  count: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  }
}, {
  timestamps: true
});

// 索引
userTagSchema.index({ name: 'text' });
userTagSchema.index({ category: 1, count: -1 });
userTagSchema.index({ isVerified: 1 });

// 方法
userTagSchema.methods.addUser = async function(userId) {
  if (!this.users.includes(userId)) {
    this.users.push(userId);
    this.count += 1;
    await this.save();
  }
};

userTagSchema.methods.removeUser = async function(userId) {
  const index = this.users.indexOf(userId);
  if (index > -1) {
    this.users.splice(index, 1);
    this.count -= 1;
    await this.save();
  }
};

// 静态方法
userTagSchema.statics.getPopularTags = async function(limit = 10) {
  return this.find()
    .sort({ count: -1 })
    .limit(limit);
};

userTagSchema.statics.getTagsByCategory = async function(category, limit = 20) {
  return this.find({ category })
    .sort({ count: -1 })
    .limit(limit);
};

const UserTag = mongoose.model('UserTag', userTagSchema);

module.exports = UserTag; 