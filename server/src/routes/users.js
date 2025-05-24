const express = require('express');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const UserController = require('../controllers/UserController');
const { upload } = require('../middleware/upload');

const router = express.Router();

// 具体路由应放在参数路由之前
// 上传头像
router.post('/avatar', auth, upload.single('avatar'), UserController.uploadAvatar);
// 社交媒体账号关联
router.post('/social/connect', auth, UserController.connectSocialAccount);
router.delete('/social/:platform', auth, UserController.disconnectSocialAccount);
// 用户屏蔽
router.post('/block/:userId', auth, UserController.blockUser);
router.delete('/block/:userId', auth, UserController.unblockUser);
router.get('/blocked', auth, UserController.getBlockedUsers);
// 隐私设置
router.patch('/privacy', auth, UserController.updatePrivacySettings);
// 通知设置
router.patch('/notifications', auth, UserController.updateNotificationSettings);
// 高级用户
router.post('/premium', auth, UserController.upgradeToPremium);
// 更新用户资料
router.patch('/profile', auth, UserController.updateProfile);
// 获取推荐用户（假设有这个控制器方法）
router.get('/recommended', optionalAuth, UserController.getRecommendedUsers);
// 其他具体路由可在此添加

// 参数路由放到最后
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

// 获取用户资料
router.get('/:id', auth, UserController.getProfile);

module.exports = router; 