const express = require('express');
const { Notification } = require('../models/Notification');
const { auth } = require('../middleware/auth');
const { catchAsync, AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Get user notifications
router.get('/', auth, catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ targetUser: req.user.id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('actor', 'username handle avatar isVerified')
    .populate('post', 'content');

  res.json(notifications);
}));

// Mark notifications as read
router.patch('/read', auth, catchAsync(async (req, res) => {
  const { notificationIds } = req.body;

  if (!Array.isArray(notificationIds)) {
    throw new AppError('Invalid notification IDs', 400);
  }

  await Notification.updateMany(
    {
      _id: { $in: notificationIds },
      targetUser: req.user.id,
    },
    { read: true }
  );

  res.json({ message: 'Notifications marked as read' });
}));

// Mark all notifications as read
router.patch('/read-all', auth, catchAsync(async (req, res) => {
  await Notification.updateMany(
    { targetUser: req.user.id, read: false },
    { read: true }
  );

  res.json({ message: 'All notifications marked as read' });
}));

// Delete notification
router.delete('/:notificationId', auth, catchAsync(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.notificationId,
    targetUser: req.user.id,
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  await notification.deleteOne();
  res.json({ message: 'Notification deleted' });
}));

// 获取未读通知数量
router.get('/unread/count', auth, catchAsync(async (req, res) => {
  const count = await Notification.countDocuments({
    targetUser: req.user.id,
    read: false,
  });
  res.json({ count });
}));

module.exports = router; 