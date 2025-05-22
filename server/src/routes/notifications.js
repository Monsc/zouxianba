const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const { auth } = require('../middleware/auth');

// 获取通知列表
router.get('/', auth, NotificationController.getNotifications);

// 获取未读通知数
router.get('/unread-count', auth, NotificationController.getUnreadCount);

// 允许未登录用户访问未读通知数（健康检查用，返回0）
router.get('/unread/count', (req, res) => {
  res.status(200).json({ status: 'success', data: { count: 0 } });
});

// 标记通知为已读
router.patch('/:notificationId/read', auth, NotificationController.markAsRead);

// 标记所有通知为已读
router.patch('/read-all', auth, NotificationController.markAllAsRead);

// 删除通知
router.delete('/:notificationId', auth, NotificationController.deleteNotification);

// 删除所有通知
router.delete('/', auth, NotificationController.deleteAllNotifications);

module.exports = router; 