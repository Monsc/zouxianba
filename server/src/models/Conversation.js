const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }],
  },
  {
    timestamps: true,
  }
);

// Ensure each conversation has exactly two participants
conversationSchema.pre('save', function(next) {
  if (this.participants.length !== 2) {
    next(new Error('A conversation must have exactly two participants'));
  }
  next();
});

module.exports = { Conversation: mongoose.model('Conversation', conversationSchema) }; 