import express from 'express';
import { Notification } from '../models/Notification';
import { auth } from '../middleware/auth';
import { socketIO, getUserSocket } from '../server';

const router = express.Router();

// 获取用户的所有通知
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .populate('sender', 'nickname avatar')
      .populate('post', 'content')
      .populate('comment', 'content')
      .limit(50);

    res.json(notifications);
  } catch (error) {
    console.error('获取通知失败:', error);
    res.status(500).json({ message: '获取通知失败' });
  }
});

// 标记通知为已读
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: '通知不存在' });
    }

    res.json(notification);
  } catch (error) {
    console.error('标记通知已读失败:', error);
    res.status(500).json({ message: '标记通知已读失败' });
  }
});

// 标记所有通知为已读
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );

    res.json({ message: '所有通知已标记为已读' });
  } catch (error) {
    console.error('标记所有通知已读失败:', error);
    res.status(500).json({ message: '标记所有通知已读失败' });
  }
});

// 获取未读通知数量
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });

    res.json({ count });
  } catch (error) {
    console.error('获取未读通知数量失败:', error);
    res.status(500).json({ message: '获取未读通知数量失败' });
  }
});

// 创建通知的辅助函数
export const createNotification = async (
  recipientId: string,
  senderId: string,
  type: 'like' | 'comment' | 'follow' | 'mention',
  postId?: string,
  commentId?: string
) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      post: postId,
      comment: commentId
    });

    // 通过 WebSocket 发送实时通知
    const recipientSocket = getUserSocket(recipientId);
    if (recipientSocket) {
      socketIO.to(recipientSocket).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('创建通知失败:', error);
    return null;
  }
};

export const notificationRoutes = router; 