import express from 'express';
import { User } from '../models/User';
import { auth, optionalAuth } from '../middleware/auth';
import { catchAsync } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

// Get user profile
router.get('/:userId', optionalAuth, catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId)
    .select('-password')
    .populate('followers', 'username handle avatar isVerified')
    .populate('following', 'username handle avatar isVerified');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // If user is private and not followed by the requesting user, hide some info
  if (user.isPrivate && (!req.user || !user.followers.includes(req.user.id))) {
    user.followers = [];
    user.following = [];
  }

  res.json(user);
}));

// Search users
router.get('/search/:query', optionalAuth, catchAsync(async (req, res) => {
  const { query } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const users = await User.find({
    $or: [
      { username: { $regex: query, $options: 'i' } },
      { handle: { $regex: query, $options: 'i' } },
    ],
  })
    .select('-password')
    .skip(skip)
    .limit(limit);

  res.json(users);
}));

// Follow/Unfollow user
router.post('/:userId/follow', auth, catchAsync(async (req, res) => {
  if (req.params.userId === req.user.id) {
    throw new AppError('Cannot follow yourself', 400);
  }

  const userToFollow = await User.findById(req.params.userId);
  if (!userToFollow) {
    throw new AppError('User not found', 404);
  }

  const followingIndex = req.user.following.indexOf(userToFollow._id);
  const followerIndex = userToFollow.followers.indexOf(req.user._id);

  if (followingIndex === -1) {
    req.user.following.push(userToFollow._id);
    userToFollow.followers.push(req.user._id);
  } else {
    req.user.following.splice(followingIndex, 1);
    userToFollow.followers.splice(followerIndex, 1);
  }

  await Promise.all([req.user.save(), userToFollow.save()]);

  res.json({
    following: req.user.following,
    followers: userToFollow.followers,
  });
}));

// Get user followers
router.get('/:userId/followers', optionalAuth, catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId)
    .select('followers isPrivate')
    .populate('followers', 'username handle avatar isVerified');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // If user is private and not followed by the requesting user, hide followers
  if (user.isPrivate && (!req.user || !user.followers.includes(req.user.id))) {
    throw new AppError('Cannot view followers', 403);
  }

  res.json(user.followers);
}));

// Get user following
router.get('/:userId/following', optionalAuth, catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId)
    .select('following isPrivate')
    .populate('following', 'username handle avatar isVerified');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // If user is private and not followed by the requesting user, hide following
  if (user.isPrivate && (!req.user || !user.followers.includes(req.user.id))) {
    throw new AppError('Cannot view following', 403);
  }

  res.json(user.following);
}));

// Update user privacy
router.patch('/privacy', auth, catchAsync(async (req, res) => {
  const { isPrivate } = req.body;

  req.user.isPrivate = isPrivate;
  await req.user.save();

  res.json({ isPrivate: req.user.isPrivate });
}));

// Get suggested users to follow
router.get('/suggestions', auth, catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;

  // Get users that the current user is not following
  const users = await User.find({
    _id: { $nin: [...req.user.following, req.user._id] },
  })
    .select('-password')
    .limit(limit);

  res.json(users);
}));

export default router; 