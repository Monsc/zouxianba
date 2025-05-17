import express from 'express';
import { Post } from '../models/Post';
import { Comment } from '../models/Comment';
import { auth, optionalAuth } from '../middleware/auth';
import { catchAsync } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

// Get feed posts
router.get('/feed', auth, catchAsync(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
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
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const query: any = { author: userId };

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
router.post('/', auth, catchAsync(async (req, res) => {
  const { content, media, visibility } = req.body;

  const post = await Post.create({
    author: req.user.id,
    content,
    media,
    visibility,
  });

  await post.populate('author', 'username handle avatar isVerified');
  res.status(201).json(post);
}));

// Get post by ID
router.get('/:postId', optionalAuth, catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.postId)
    .populate('author', 'username handle avatar isVerified')
    .populate({
      path: 'comments',
      populate: {
        path: 'author',
        select: 'username handle avatar isVerified',
      },
    });

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  // Check visibility
  if (post.visibility !== 'public' && (!req.user || post.author._id.toString() !== req.user.id)) {
    throw new AppError('Post not found', 404);
  }

  res.json(post);
}));

// Update post
router.patch('/:postId', auth, catchAsync(async (req, res) => {
  const post = await Post.findOne({
    _id: req.params.postId,
    author: req.user.id,
  });

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = ['content', 'media', 'visibility'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    throw new AppError('Invalid updates', 400);
  }

  updates.forEach(update => {
    post[update] = req.body[update];
  });

  post.isEdited = true;
  await post.save();

  await post.populate('author', 'username handle avatar isVerified');
  res.json(post);
}));

// Delete post
router.delete('/:postId', auth, catchAsync(async (req, res) => {
  const post = await Post.findOne({
    _id: req.params.postId,
    author: req.user.id,
  });

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  // Delete all comments
  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();

  res.json({ message: 'Post deleted successfully' });
}));

// Like/Unlike post
router.post('/:postId/like', auth, catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const likeIndex = post.likes.indexOf(req.user.id);
  if (likeIndex === -1) {
    post.likes.push(req.user.id);
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
  res.status(201).json(comment);
}));

// Get post comments
router.get('/:postId/comments', optionalAuth, catchAsync(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
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

export default router; 