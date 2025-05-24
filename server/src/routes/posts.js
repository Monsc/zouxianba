const express = require('express');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { auth, optionalAuth } = require('../middleware/auth');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { upload } = require('../middleware/upload');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Tag = require('../models/Tag');
const PostController = require('../controllers/PostController');

const router = express.Router();

// Get feed posts
router.get('/feed', auth, catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const posts = await Post.find({
    $or: [
      { author: req.user.id },
      { author: { $in: req.user.following } },
    ],
    visibility: { $in: ['public', 'followers'] },
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'username handle avatar isVerified')
    .populate({
      path: 'comments',
      populate: {
        path: 'author',
        select: 'username handle avatar isVerified',
      },
    });

  res.json(posts);
}));

// Get user posts
router.get('/user/:userId', optionalAuth, catchAsync(async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const query = { author: userId };

  // If not viewing own posts, only show public posts
  if (!req.user || req.user.id !== userId) {
    query.visibility = 'public';
  }

  const posts = await Post.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'username handle avatar isVerified')
    .populate({
      path: 'comments',
      populate: {
        path: 'author',
        select: 'username handle avatar isVerified',
      },
    });

  res.json(posts);
}));

// Create post
router.post('/', auth, upload.array('images', 9), PostController.createPost);

// Get post by ID
router.get('/:id', auth, PostController.getPost);

// Update post
router.patch('/:id', auth, PostController.updatePost);

// Delete post
router.delete('/:id', auth, PostController.deletePost);

// Like/Unlike post
router.post('/:postId/like', auth, catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const likeIndex = post.likes.indexOf(req.user.id);
  if (likeIndex === -1) {
    post.likes.push(req.user.id);
    if (post.author.toString() !== req.user.id) {
      await Notification.create({
        type: 'like',
        actor: req.user.id,
        targetUser: post.author,
        post: post._id,
      });
    }
  } else {
    post.likes.splice(likeIndex, 1);
  }

  await post.save();
  res.json(post);
}));

// Add comment
router.post('/:postId/comments', auth, catchAsync(async (req, res) => {
  const { content, media, parentComment } = req.body;

  const post = await Post.findById(req.params.postId);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const comment = await Comment.create({
    post: post._id,
    author: req.user.id,
    content,
    media,
    parentComment,
  });

  post.comments.push(comment._id);
  await post.save();

  await comment.populate('author', 'username handle avatar isVerified');

  if (post.author.toString() !== req.user.id) {
    await Notification.create({
      type: 'comment',
      actor: req.user.id,
      targetUser: post.author,
      post: post._id,
    });
  }

  res.status(201).json(comment);
}));

// Get post comments
router.get('/:postId/comments', optionalAuth, catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const comments = await Comment.find({
    post: req.params.postId,
    parentComment: null, // Only get top-level comments
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'username handle avatar isVerified')
    .populate({
      path: 'replies',
      populate: {
        path: 'author',
        select: 'username handle avatar isVerified',
      },
    });

  res.json(comments);
}));

// Repost post
router.post('/:id/repost', auth, PostController.repost);

// Get post details
router.get('/:id', optionalAuth, catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'username handle avatar')
    .populate('originalPost')
    .populate('mentions', 'username handle avatar');
  
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  res.json(post);
}));

// Get repost list
router.get('/:id/reposts', optionalAuth, catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('reposts.user', 'username handle avatar');
  
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  res.json(post.reposts);
}));

// Toggle bookmark
router.post('/:id/bookmark', auth, PostController.toggleBookmark);

// Report post
router.post('/:id/report', auth, PostController.reportPost);

// Toggle pin
router.post('/:id/pin', auth, PostController.togglePin);

// Get edit history
router.get('/:id/history', auth, PostController.getEditHistory);

// GET /api/posts - 获取所有公开帖子（兼容前端 /api/posts 请求）
router.get('/', optionalAuth, catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // 只返回公开帖子
  const posts = await Post.find({ visibility: 'public' })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'username handle avatar isVerified')
    .populate({
      path: 'comments',
      populate: {
        path: 'author',
        select: 'username handle avatar isVerified',
      },
    });

  const total = await Post.countDocuments({ visibility: 'public' });
  // 自检日志
  console.log('[API] /api/posts 返回 posts 数量:', posts.length);
  console.log('[API] /api/posts 鉴权信息:', req.user ? '已登录' : '未登录');
  console.log('[API] /api/posts 数据库查询结果:', posts.length > 0 ? '有数据' : '无数据');
  res.json({
    posts,
    hasMore: page * limit < total
  });
}));

// Get public feed (no auth required)
router.get('/public-feed', catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const posts = await Post.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'username handle avatar isVerified')
    .populate({
      path: 'comments',
      populate: {
        path: 'author',
        select: 'username handle avatar isVerified',
      },
    });

  res.json(posts);
}));

module.exports = router; 