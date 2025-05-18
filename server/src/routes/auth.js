const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { auth } = require('../middleware/auth');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Register
router.post('/register', catchAsync(async (req, res) => {
  const { username, email, password, handle } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }, { handle }],
  });

  if (existingUser) {
    throw new AppError('User already exists', 400);
  }

  // Create new user
  const user = await User.create({
    username,
    email,
    password,
    handle,
  });

  // Generate token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.status(201).json({
    user: user.getPublicProfile(),
    token,
  });
}));

// Login
router.post('/login', catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  // Generate token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.json({
    user: user.getPublicProfile(),
    token,
  });
}));

// Get current user
router.get('/me', auth, catchAsync(async (req, res) => {
  res.json(req.user.getPublicProfile());
}));

// Update user profile
router.patch('/me', auth, upload.single('avatar'), catchAsync(async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['username', 'email', 'password', 'bio', 'location', 'website'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    throw new AppError('Invalid updates', 400);
  }

  updates.forEach(update => {
    req.user[update] = req.body[update];
  });

  // 处理头像上传
  if (req.file) {
    req.user.avatar = '/uploads/' + req.file.filename;
  }

  await req.user.save();
  res.json(req.user.getPublicProfile());
}));

// Change password
router.post('/change-password', auth, catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const isMatch = await req.user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  req.user.password = newPassword;
  await req.user.save();

  res.json({ message: 'Password updated successfully' });
}));

// Delete account
router.delete('/me', auth, catchAsync(async (req, res) => {
  await req.user.deleteOne();
  res.json({ message: 'Account deleted successfully' });
}));

module.exports = router; 