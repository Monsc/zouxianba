import express from 'express';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { auth } from '../middleware/auth';
import { catchAsync } from '../middleware/errorHandler';
import { Request, Response } from '../types/express';
import { upload } from '../middleware/upload';

const router = express.Router();

// 获取会话列表（最近联系人+最后一条消息）
router.get('/conversations', auth, catchAsync(async (req: Request, res: Response) => {
  // 查找与当前用户相关的所有消息
  const messages = await Message.find({ $or: [ { from: req.user.id }, { to: req.user.id } ] })
    .sort({ createdAt: -1 });
  // 聚合为会话
  const conversations: Record<string, any> = {};
  messages.forEach(msg => {
    const otherId = msg.from.toString() === req.user.id ? msg.to.toString() : msg.from.toString();
    if (!conversations[otherId]) {
      conversations[otherId] = { ...msg.toObject(), user: otherId };
    }
  });
  // 填充用户信息
  const userIds = Object.keys(conversations);
  const users = await User.find({ _id: { $in: userIds } }, 'username handle avatar');
  userIds.forEach(id => {
    conversations[id].user = users.find(u => u._id.toString() === id);
  });
  res.json(Object.values(conversations));
}));

// 获取与某用户的历史消息
router.get('/:userId', auth, catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const messages = await Message.find({
    $or: [
      { from: req.user.id, to: userId },
      { from: userId, to: req.user.id },
    ],
  }).sort({ createdAt: 1 });
  res.json(messages);
}));

// 发送图片消息
router.post('/:userId/image', auth, upload.single('image'), catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!req.file) return res.status(400).json({ error: '未上传图片' });
  const message = await Message.create({
    from: req.user.id,
    to: userId,
    contentType: 'image',
    imageUrl: '/uploads/' + req.file.filename,
  });
  res.status(201).json(message);
}));

// 发送文本消息
router.post('/:userId', auth, catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: '消息内容不能为空' });
  const message = await Message.create({
    from: req.user.id,
    to: userId,
    content,
    contentType: 'text',
  });
  res.status(201).json(message);
}));

// 获取未读消息总数
router.get('/unread-count', auth, catchAsync(async (req: Request, res: Response) => {
  const count = await Message.countDocuments({ to: req.user.id, read: false });
  res.json({ count });
}));

export default router; 