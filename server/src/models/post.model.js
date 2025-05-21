const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000,
  },
  images: [{
    url: String,
    width: Number,
    height: Number,
    size: Number,
    type: String,
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  tags: [{
    type: String,
    trim: true,
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  visibility: {
    type: String,
    enum: ['public', 'private', 'followers'],
    default: 'public',
  },
  status: {
    type: String,
    enum: ['active', 'deleted', 'hidden'],
    default: 'active',
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  shareCount: {
    type: Number,
    default: 0,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
}, {
  timestamps: true,
});

// 索引
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ 'location.coordinates': '2dsphere' });
postSchema.index({ content: 'text' });

// 虚拟字段
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// 中间件
postSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // 提取提及的用户
    const mentionRegex = /@(\w+)/g;
    const mentions = this.content.match(mentionRegex);
    if (mentions) {
      this.mentions = mentions.map(mention => mention.slice(1));
    }
    
    // 提取标签
    const tagRegex = /#(\w+)/g;
    const tags = this.content.match(tagRegex);
    if (tags) {
      this.tags = tags.map(tag => tag.slice(1));
    }
  }
  next();
});

// 方法
postSchema.methods.incrementViewCount = async function() {
  this.viewCount += 1;
  return this.save();
};

postSchema.methods.incrementShareCount = async function() {
  this.shareCount += 1;
  return this.save();
};

postSchema.methods.addComment = async function(comment) {
  this.comments.push(comment);
  return this.save();
};

postSchema.methods.removeComment = async function(commentId) {
  this.comments = this.comments.filter(
    comment => comment._id.toString() !== commentId.toString()
  );
  return this.save();
};

postSchema.methods.toggleLike = async function(userId) {
  const index = this.likes.indexOf(userId);
  if (index === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(index, 1);
  }
  return this.save();
};

const Post = mongoose.model('Post', postSchema);

module.exports = Post; 