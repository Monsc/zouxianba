const express = require('express');
const { User } = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');
const { catchAsync, AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Get user profile
router.get('/:userId', optionalAuth, catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId)
    .select('-password -email')
    .populate('followers', 'username handle avatar isVerified')
    .populate('following', 'username handle avatar isVerified');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json(user);
}));

// Update user profile
router.patch('/profile', auth, catchAsync(async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['username', 'handle', 'bio', 'avatar', 'coverImage'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    throw new AppError('Invalid updates', 400);
  }

  updates.forEach(update => {
    if (allowedUpdates.includes(update)) req.user[update] = req.body[update];
  });

  await req.user.save();
  res.json(req.user);
}));

// Follow user
router.post('/:userId/follow', auth, catchAsync(async (req, res) => {
  if (req.params.userId === req.user.id) {
    throw new AppError('Cannot follow yourself', 400);
  }

  const userToFollow = await User.findById(req.params.userId);
  if (!userToFollow) {
    throw new AppError('User not found', 404);
  }

  if (req.user.following.includes(userToFollow._id)) {
    throw new AppError('Already following this user', 400);
  }

  req.user.following.push(userToFollow._id);
  userToFollow.followers.push(req.user._id);

  await Promise.all([req.user.save(), userToFollow.save()]);

  res.json({ message: 'Followed successfully' });
}));

// Unfollow user
router.delete('/:userId/follow', auth, catchAsync(async (req, res) => {
  if (req.params.userId === req.user.id) {
    throw new AppError('Cannot unfollow yourself', 400);
  }

  const userToUnfollow = await User.findById(req.params.userId);
  if (!userToUnfollow) {
    throw new AppError('User not found', 404);
  }

  if (!req.user.following.includes(userToUnfollow._id)) {
    throw new AppError('Not following this user', 400);
  }

  req.user.following = req.user.following.filter(
    id => id.toString() !== userToUnfollow._id.toString()
  );
  userToUnfollow.followers = userToUnfollow.followers.filter(
    id => id.toString() !== req.user._id.toString()
  );

  await Promise.all([req.user.save(), userToUnfollow.save()]);

  res.json({ message: 'Unfollowed successfully' });
}));

// Get user followers
router.get('/:userId/followers', optionalAuth, catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId)
    .populate('followers', 'username handle avatar isVerified');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json(user.followers);
}));

// Get user following
router.get('/:userId/following', optionalAuth, catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId)
    .populate('following', 'username handle avatar isVerified');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json(user.following);
}));

module.exports = router; 