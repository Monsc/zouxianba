import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { auth } from '../middleware/auth';
import { catchAsync } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';
import { Request, Response } from 'express';
import { upload } from '../middleware/upload';

const router = express.Router();

// Register
router.post('/register', catchAsync(async (req: Request, res: Response) => {
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
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });

  res.status(201).json({
    user: (user as any).getPublicProfile(),
    token,
  });
}));

// Login
router.post('/login', catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check password
  const isMatch = await (user as any).comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  // Generate token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });

  res.json({
    user: (user as any).getPublicProfile(),
    token,
  });
}));

// Get current user
router.get('/me', auth, catchAsync(async (req: Request, res: Response) => {
  res.json((req.user as any).getPublicProfile());
}));

// Update user profile
router.patch('/me', auth, upload.single('avatar'), catchAsync(async (req: Request, res: Response) => {
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
  if ((req as any).file) {
    req.user.avatar = '/uploads/' + (req as any).file.filename;
  }

  await req.user.save();
  res.json((req.user as any).getPublicProfile());
}));

// Change password
router.post('/change-password', auth, catchAsync(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const isMatch = await (req.user as any).comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  req.user.password = newPassword;
  await req.user.save();

  res.json({ message: 'Password updated successfully' });
}));

// Delete account
router.delete('/me', auth, catchAsync(async (req: Request, res: Response) => {
  await req.user.deleteOne();
  res.json({ message: 'Account deleted successfully' });
}));

export default router; 