const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isMuted: {
      type: Boolean,
      default: false
    },
    hasRaisedHand: {
      type: Boolean,
      default: false
    }
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  isRecording: {
    type: Boolean,
    default: false
  },
  settings: {
    allowChat: {
      type: Boolean,
      default: true
    },
    allowReactions: {
      type: Boolean,
      default: true
    },
    allowBackgroundMusic: {
      type: Boolean,
      default: true
    },
    allowSpeechToText: {
      type: Boolean,
      default: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'ended'],
    default: 'active'
  }
}, {
  timestamps: true
});

// 索引
roomSchema.index({ host: 1 });
roomSchema.index({ 'participants.user': 1 });
roomSchema.index({ status: 1, createdAt: -1 });

// 虚拟字段
roomSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// 方法
roomSchema.methods.isHost = function(userId) {
  return this.host.toString() === userId.toString();
};

roomSchema.methods.isModerator = function(userId) {
  return this.moderators.some(mod => mod.toString() === userId.toString());
};

roomSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.user.toString() === userId.toString());
};

roomSchema.methods.getParticipant = function(userId) {
  return this.participants.find(p => p.user.toString() === userId.toString());
};

roomSchema.methods.addParticipant = function(userId) {
  if (!this.isParticipant(userId)) {
    this.participants.push({
      user: userId,
      joinedAt: new Date()
    });
  }
};

roomSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(
    p => p.user.toString() !== userId.toString()
  );
};

roomSchema.methods.addModerator = function(userId) {
  if (!this.isModerator(userId)) {
    this.moderators.push(userId);
  }
};

roomSchema.methods.removeModerator = function(userId) {
  this.moderators = this.moderators.filter(
    mod => mod.toString() !== userId.toString()
  );
};

const Room = mongoose.model('Room', roomSchema);

module.exports = Room; 