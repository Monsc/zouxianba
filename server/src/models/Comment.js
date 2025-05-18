const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 280,
    },
    media: [{
      type: String, // URL to media file
      maxlength: 1, // Maximum 1 media item per comment
    }],
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    replies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    }],
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient querying
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1, createdAt: 1 });

// Method to get comment with populated fields
commentSchema.methods.getPopulatedComment = async function() {
  return this.populate([
    {
      path: 'author',
      select: 'username handle avatar isVerified',
    },
    {
      path: 'replies',
      populate: {
        path: 'author',
        select: 'username handle avatar isVerified',
      },
    },
  ]);
};

module.exports = { Comment: mongoose.model('Comment', commentSchema) }; 