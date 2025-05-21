const mongoose = require('mongoose');

const voiceChatRoomSchema = new mongoose.Schema({
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
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['host', 'speaker', 'listener'],
      default: 'listener'
    },
    isMuted: {
      type: Boolean,
      default: false
    },
    hasRaisedHand: {
      type: Boolean,
      default: false
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isRecording: {
    type: Boolean,
    default: false
  },
  recordings: [{
    url: String,
    duration: Number,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  settings: {
    isPrivate: {
      type: Boolean,
      default: false
    },
    allowRaiseHand: {
      type: Boolean,
      default: true
    },
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
    maxParticipants: {
      type: Number,
      default: 100
    }
  },
  status: {
    type: String,
    enum: ['active', 'ended', 'scheduled'],
    default: 'active'
  },
  scheduledStartTime: Date,
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: Date
}, {
  timestamps: true
});

// 索引
voiceChatRoomSchema.index({ host: 1 });
voiceChatRoomSchema.index({ 'participants.user': 1 });
voiceChatRoomSchema.index({ status: 1 });
voiceChatRoomSchema.index({ scheduledStartTime: 1 });

// 方法
voiceChatRoomSchema.methods.addParticipant = async function(userId, role = 'listener') {
  if (this.participants.length >= this.settings.maxParticipants) {
    throw new Error('Room is full');
  }

  const existingParticipant = this.participants.find(p => p.user.toString() === userId.toString());
  if (existingParticipant) {
    existingParticipant.role = role;
    existingParticipant.joinedAt = new Date();
  } else {
    this.participants.push({
      user: userId,
      role,
      joinedAt: new Date()
    });
  }

  return this.save();
};

voiceChatRoomSchema.methods.removeParticipant = async function(userId) {
  this.participants = this.participants.filter(p => p.user.toString() !== userId.toString());
  return this.save();
};

voiceChatRoomSchema.methods.updateParticipantRole = async function(userId, role) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    participant.role = role;
    return this.save();
  }
  throw new Error('Participant not found');
};

voiceChatRoomSchema.methods.toggleMute = async function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    participant.isMuted = !participant.isMuted;
    return this.save();
  }
  throw new Error('Participant not found');
};

voiceChatRoomSchema.methods.toggleRaiseHand = async function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    participant.hasRaisedHand = !participant.hasRaisedHand;
    return this.save();
  }
  throw new Error('Participant not found');
};

voiceChatRoomSchema.methods.startRecording = async function() {
  if (this.isRecording) {
    throw new Error('Recording is already in progress');
  }
  this.isRecording = true;
  return this.save();
};

voiceChatRoomSchema.methods.stopRecording = async function(recordingUrl, duration) {
  if (!this.isRecording) {
    throw new Error('No recording in progress');
  }
  this.isRecording = false;
  this.recordings.push({
    url: recordingUrl,
    duration,
    createdAt: new Date()
  });
  return this.save();
};

voiceChatRoomSchema.methods.endRoom = async function() {
  if (this.status === 'ended') {
    throw new Error('Room is already ended');
  }
  this.status = 'ended';
  this.endedAt = new Date();
  return this.save();
};

const VoiceChatRoom = mongoose.model('VoiceChatRoom', voiceChatRoomSchema);

module.exports = VoiceChatRoom; 