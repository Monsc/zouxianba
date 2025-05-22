const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const { AppError } = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

class ConversationController {
  // 创建会话
  createConversation = catchAsync(async (req, res) => {
    const { participants, type = 'private', name, avatar } = req.body;
    const userId = req.user._id;

    // 检查参与者是否存在
    const users = await User.find({ _id: { $in: participants } });
    if (users.length !== participants.length) {
      throw new AppError('部分用户不存在', 404);
    }

    // 检查是否已存在相同的私聊会话
    if (type === 'private' && participants.length === 2) {
      const existingConversation = await Conversation.findOne({
        type: 'private',
        participants: { $all: participants }
      });

      if (existingConversation) {
        return res.status(200).json({
          status: 'success',
          data: { conversation: existingConversation }
        });
      }
    }

    // 创建会话
    const conversation = await Conversation.create({
      participants,
      type,
      name,
      avatar,
      unreadCount: new Map(participants.map(id => [id.toString(), 0]))
    });

    res.status(201).json({
      status: 'success',
      data: { conversation }
    });
  });

  // 获取会话列表
  getConversations = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('participants', 'username avatar')
      .populate('lastMessage')
      .lean();

    // 获取每个会话的未读消息数
    const conversationsWithUnreadCount = conversations.map(conv => ({
      ...conv,
      unreadCount: conv.unreadCount.get(userId.toString()) || 0
    }));

    res.status(200).json({
      status: 'success',
      data: {
        conversations: conversationsWithUnreadCount,
        hasMore: conversations.length === limit
      }
    });
  });

  // 获取会话详情
  getConversation = catchAsync(async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'username avatar')
      .populate('lastMessage');

    if (!conversation) {
      throw new AppError('会话不存在', 404);
    }

    if (!conversation.participants.some(p => p._id.toString() === userId.toString())) {
      throw new AppError('您不是该会话的参与者', 403);
    }

    res.status(200).json({
      status: 'success',
      data: { conversation }
    });
  });

  // 更新会话信息
  updateConversation = catchAsync(async (req, res) => {
    const { conversationId } = req.params;
    const { name, avatar } = req.body;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new AppError('会话不存在', 404);
    }

    // 检查权限
    if (conversation.type === 'private') {
      throw new AppError('私聊会话不能修改信息', 403);
    }

    if (!conversation.participants.includes(userId)) {
      throw new AppError('您不是该会话的参与者', 403);
    }

    // 更新会话信息
    if (name) conversation.name = name;
    if (avatar) conversation.avatar = avatar;

    await conversation.save();

    res.status(200).json({
      status: 'success',
      data: { conversation }
    });
  });

  // 离开会话
  leaveConversation = catchAsync(async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new AppError('会话不存在', 404);
    }

    if (!conversation.participants.includes(userId)) {
      throw new AppError('您不是该会话的参与者', 403);
    }

    // 如果是私聊，直接删除会话
    if (conversation.type === 'private') {
      await conversation.remove();
    } else {
      // 如果是群聊，从参与者中移除
      conversation.participants = conversation.participants.filter(
        p => p.toString() !== userId.toString()
      );
      conversation.unreadCount.delete(userId.toString());
      await conversation.save();
    }

    res.status(200).json({
      status: 'success',
      data: null
    });
  });

  // 添加会话参与者
  addParticipants = catchAsync(async (req, res) => {
    const { conversationId } = req.params;
    const { participants } = req.body;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new AppError('会话不存在', 404);
    }

    if (conversation.type === 'private') {
      throw new AppError('私聊会话不能添加参与者', 403);
    }

    if (!conversation.participants.includes(userId)) {
      throw new AppError('您不是该会话的参与者', 403);
    }

    // 检查新参与者是否存在
    const users = await User.find({ _id: { $in: participants } });
    if (users.length !== participants.length) {
      throw new AppError('部分用户不存在', 404);
    }

    // 添加新参与者
    const newParticipants = participants.filter(
      p => !conversation.participants.includes(p)
    );

    conversation.participants.push(...newParticipants);
    newParticipants.forEach(p => {
      conversation.unreadCount.set(p.toString(), 0);
    });

    await conversation.save();

    res.status(200).json({
      status: 'success',
      data: { conversation }
    });
  });

  // 移除会话参与者
  removeParticipant = catchAsync(async (req, res) => {
    const { conversationId, participantId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new AppError('会话不存在', 404);
    }

    if (conversation.type === 'private') {
      throw new AppError('私聊会话不能移除参与者', 403);
    }

    if (!conversation.participants.includes(userId)) {
      throw new AppError('您不是该会话的参与者', 403);
    }

    // 移除参与者
    conversation.participants = conversation.participants.filter(
      p => p.toString() !== participantId
    );
    conversation.unreadCount.delete(participantId);

    await conversation.save();

    res.status(200).json({
      status: 'success',
      data: { conversation }
    });
  });
}

module.exports = new ConversationController(); 