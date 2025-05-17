import express from 'express';
import { Notification } from '../models/Notification';
import { auth } from '../middleware/auth';
import { catchAsync } from '../middleware/errorHandler';
import { Request, Response } from '../types/express';

const router = express.Router();

// 获取当前用户的所有通知
router.get('/', auth, catchAsync(async (req: Request, res: Response) => {
  const notifications = await Notification.find({ targetUser: req.user.id })
    .sort({ createdAt: -1 })
    .populate('actor', 'username handle avatar')
    .populate('post', 'content');
  res.json(notifications);
}));

// 标记通知为已读
router.put('/:id/read', auth, catchAsync(async (req: Request, res: Response) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, targetUser: req.user.id },
    { read: true },
    { new: true }
  );
  if (!notification) return res.status(404).json({ error: 'Notification not found' });
  res.json(notification);
}));

export default router; 