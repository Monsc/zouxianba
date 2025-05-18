const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  targetComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  reason: { type: String, required: true },
  detail: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = { Report: mongoose.model('Report', reportSchema) }; 