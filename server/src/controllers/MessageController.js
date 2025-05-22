const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { AppError } = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { uploadToCloudflare } = require('../utils/cloudflare');

class MessageController {
  // 发送消息
  sendMessage = catchAsync(async (req, res) => {
    const { conversationId, content, attachments } = req.body;
    const userId = req.user._id;

    // 检查会话是否存在
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new AppError('会话不存在', 404);
    }

    // 检查用户是否是会话参与者
    if (!conversation.participants.includes(userId)) {
      throw new AppError('您不是该会话的参与者', 403);
    }

    // 处理附件
    let processedAttachments = [];
    if (attachments && attachments.length > 0) {
      processedAttachments = await Promise.all(
        attachments.map(async (attachment) => {
          const { type, file } = attachment;
          const uploadedFile = await uploadToCloudflare(file);
          return {
            type,
            url: uploadedFile.url,
            name: file.name,
            size: file.size
          };
        })
      );
    }

    // 创建消息
    const message = await Message.create({
      conversation: conversationId,
      sender: userId,
      content,
      attachments: processedAttachments,
      readBy: [{ user: userId }]
    });

    // 更新会话的最后消息和未读数
    conversation.lastMessage = message._id;
    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== userId.toString()) {
        const currentCount = conversation.unreadCount.get(participantId.toString()) || 0;
        conversation.unreadCount.set(participantId.toString(), currentCount + 1);
      }
    });
    await conversation.save();

    // 发送WebSocket通知
    req.io.to(conversationId).emit('new_message', message);

    res.status(201).json({
      status: 'success',
      data: { message }
    });
  });

  // 获取会话消息
  getMessages = catchAsync(async (req, res) => {
    const { conversationId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    // 检查会话是否存在
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new AppError('会话不存在', 404);
    }

    // 检查用户是否是会话参与者
    if (!conversation.participants.includes(userId)) {
      throw new AppError('您不是该会话的参与者', 403);
    }

    // 获取消息
    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sender', 'username avatar')
      .lean();

    // 标记消息为已读
    const unreadMessages = messages.filter(
      msg => !msg.readBy.some(read => read.user.toString() === userId.toString())
    );

    if (unreadMessages.length > 0) {
      await Message.updateMany(
        {
          _id: { $in: unreadMessages.map(msg => msg._id) },
          'readBy.user': { $ne: userId }
        },
        {
          $push: {
            readBy: {
              user: userId,
              readAt: new Date()
            }
          }
        }
      );

      // 更新会话未读数
      conversation.unreadCount.set(userId.toString(), 0);
      await conversation.save();

      // 发送WebSocket通知
      req.io.to(conversationId).emit('messages_read', {
        conversationId,
        userId
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        messages: messages.reverse(),
        hasMore: messages.length === limit
      }
    });
  });

  // 撤回消息
  recallMessage = catchAsync(async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      throw new AppError('消息不存在', 404);
    }

    // 检查是否是消息发送者
    if (message.sender.toString() !== userId.toString()) {
      throw new AppError('您不能撤回他人的消息', 403);
    }

    // 检查消息发送时间是否在2分钟内
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    if (message.createdAt < twoMinutesAgo) {
      throw new AppError('只能撤回2分钟内的消息', 400);
    }

    message.recalled = true;
    message.recalledAt = new Date();
    await message.save();

    // 发送WebSocket通知
    req.io.to(message.conversation.toString()).emit('message_recalled', {
      messageId,
      conversationId: message.conversation
    });

    res.status(200).json({
      status: 'success',
      data: { message }
    });
  });

  // 删除消息
  deleteMessage = catchAsync(async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      throw new AppError('消息不存在', 404);
    }

    // 检查是否是消息发送者
    if (message.sender.toString() !== userId.toString()) {
      throw new AppError('您不能删除他人的消息', 403);
    }

    await message.remove();

    // 发送WebSocket通知
    req.io.to(message.conversation.toString()).emit('message_deleted', {
      messageId,
      conversationId: message.conversation
    });

    res.status(200).json({
      status: 'success',
      data: null
    });
  });
}

module.exports = new MessageController(); 