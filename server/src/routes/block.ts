import express from 'express';
import { User } from '../models/User';
import { auth } from '../middleware/auth';
import { catchAsync } from '../middleware/errorHandler';
import { Request, Response } from 'express';

const router = express.Router();

// 屏蔽用户
router.post('/:userId', auth, catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (userId === req.user.id) return res.status(400).json({ error: '不能屏蔽自己' });
  await User.findByIdAndUpdate(req.user.id, { $addToSet: { blocked: userId } });
  res.json({ success: true });
  return null;
}));

// 取消屏蔽
router.delete('/:userId', auth, catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  await User.findByIdAndUpdate(req.user.id, { $pull: { blocked: userId } });
  res.json({ success: true });
  return null;
}));

export default router; 