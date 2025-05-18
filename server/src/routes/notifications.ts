import express from 'express';
import { Notification } from '../models/Notification';
import { auth } from '../middleware/auth';
import { catchAsync } from '../middleware/errorHandler';
import { Request, Response } from 'express';
import { Report } from '../models/Report';

const router = express.Router();

// 获取当前用户的所有通知或未读数量
router.get('/', auth, catchAsync(async (req: Request, res: Response) => {
  if (req.query.unread === '1') {
    const count = await Notification.countDocuments({ targetUser: req.user.id, read: false });
    return res.json({ count });
  }
  const notifications = await Notification.find({ targetUser: req.user.id })
    .sort({ createdAt: -1 })
    .populate('actor', 'username handle avatar')
    .populate('post', 'content');
  res.json(notifications);
  return null;
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
  return null;
}));

// 举报内容
router.post('/', auth, catchAsync(async (req: Request, res: Response) => {
  const { targetUser, targetPost, targetComment, reason, detail } = req.body;
  if (!reason) return res.status(400).json({ error: '举报原因必填' });
  if (!targetUser && !targetPost && !targetComment) {
    return res.status(400).json({ error: '必须指定举报对象' });
  }
  const report = await Report.create({
    reporter: req.user.id,
    targetUser,
    targetPost,
    targetComment,
    reason,
    detail,
  });
  res.status(201).json(report);
  return null;
}));

export default router; 