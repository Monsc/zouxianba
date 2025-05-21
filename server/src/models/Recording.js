const mongoose = require('mongoose');

const recordingSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  url: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  format: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  metadata: {
    title: String,
    description: String,
    tags: [String],
    participants: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      speakingTime: Number
    }]
  }
}, {
  timestamps: true
});

// 索引
recordingSchema.index({ room: 1, createdAt: -1 });
recordingSchema.index({ createdBy: 1 });
recordingSchema.index({ status: 1 });

// 虚拟字段
recordingSchema.virtual('participantCount').get(function() {
  return this.metadata.participants.length;
});

// 方法
recordingSchema.methods.addParticipant = function(userId, speakingTime = 0) {
  const existingParticipant = this.metadata.participants.find(
    p => p.user.toString() === userId.toString()
  );

  if (existingParticipant) {
    existingParticipant.speakingTime += speakingTime;
  } else {
    this.metadata.participants.push({
      user: userId,
      speakingTime
    });
  }
};

recordingSchema.methods.updateStatus = function(status) {
  this.status = status;
};

const Recording = mongoose.model('Recording', recordingSchema);

module.exports = Recording; 