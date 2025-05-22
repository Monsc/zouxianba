const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  type: {
    type: String,
    enum: ['private', 'group'],
    default: 'private'
  },
  name: String,
  avatar: String,
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  },
  isActive: {
    type: Boolean,
    default: true
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
conversationSchema.index({ participants: 1 });
conversationSchema.index({ type: 1, updatedAt: -1 });

// 虚拟字段：获取未读消息数
conversationSchema.virtual('totalUnreadCount').get(function() {
  return Array.from(this.unreadCount.values()).reduce((sum, count) => sum + count, 0);
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation; 