const Notification = require('../models/Notification');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

class NotificationController {
  // 获取通知列表
  getNotifications = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('actor', 'username avatar')
      .populate('post', 'content images')
      .populate('comment', 'content')
      .populate('message', 'content')
      .lean();

    res.status(200).json({
      status: 'success',
      data: {
        notifications,
        hasMore: notifications.length === limit
      }
    });
  });

  // 获取未读通知数
  getUnreadCount = catchAsync(async (req, res) => {
    const userId = req.user._id;

    const count = await Notification.countDocuments({
      recipient: userId,
      read: false
    });

    res.status(200).json({
      status: 'success',
      data: { count }
    });
  });

  // 标记通知为已读
  markAsRead = catchAsync(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      throw new AppError('通知不存在', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        notification
      }
    });
  });

  // 标记所有通知为已读
  markAllAsRead = catchAsync(async (req, res) => {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );

    res.status(200).json({
      status: 'success',
      data: null
    });
  });

  // 删除通知
  deleteNotification = catchAsync(async (req, res) => {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      throw new AppError('通知不存在', 404);
    }

    res.status(200).json({
      status: 'success',
      data: null
    });
  });

  // 删除所有通知
  deleteAllNotifications = catchAsync(async (req, res) => {
    const userId = req.user._id;

    await Notification.deleteMany({ recipient: userId });

    res.status(200).json({
      status: 'success',
      data: null
    });
  });

  // 创建通知
  createNotification = catchAsync(async (req, res) => {
    const { recipient, type, actor, post, comment, message, metadata } = req.body;

    // 检查接收者是否存在
    const user = await User.findById(recipient);
    if (!user) {
      throw new AppError('接收者不存在', 404);
    }

    // 创建通知
    const notification = await Notification.create({
      recipient,
      type,
      actor,
      post,
      comment,
      message,
      metadata
    });

    // 发送WebSocket通知
    if (global.io) {
      global.io.to(recipient.toString()).emit('new_notification', notification);
    }

    res.status(201).json({
      status: 'success',
      data: {
        notification
      }
    });
  });
}

module.exports = new NotificationController(); 