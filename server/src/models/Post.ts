import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
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
      maxlength: 4, // Maximum 4 media items per post
    }],
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    }],
    reposts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    isRepost: {
      type: Boolean,
      default: false,
    },
    originalPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    visibility: {
      type: String,
      enum: ['public', 'followers', 'private'],
      default: 'public',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for search and sorting
postSchema.index({ content: 'text' });
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });

// Method to get post with populated fields
postSchema.methods.getPopulatedPost = async function() {
  return this.populate([
    {
      path: 'author',
      select: 'username handle avatar isVerified',
    },
    {
      path: 'comments',
      populate: {
        path: 'author',
        select: 'username handle avatar isVerified',
      },
    },
  ]);
};

export const Post = mongoose.model('Post', postSchema); 