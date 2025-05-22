const VoiceChatRoom = require('../models/VoiceChatRoom');
const { getIO } = require('./index');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const NotificationController = require('../controllers/NotificationController');

// 用户在线状态映射
const onlineUsers = new Map();

// 认证中间件
const authenticateSocket = async (socket, next) => {
  // 健康检查时允许无 token 或 token === 'health-check' 连接
  const token = socket.handshake.auth && socket.handshake.auth.token;
  if (!token || token === 'health-check') {
    return next();
  }
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new Error('用户不存在'));
    }
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('认证失败'));
  }
};

// 初始化Socket.IO
const initializeSocket = (io) => {
  // 使用认证中间件
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();

    // 更新用户在线状态
    onlineUsers.set(userId, socket.id);
    io.emit('user_online', { userId });

    // 加入用户的房间
    socket.join(userId);

    // 加入用户参与的会话房间
    socket.on('join_conversations', async (conversationIds) => {
      conversationIds.forEach(id => socket.join(id));
    });

    // 处理新消息
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, attachments } = data;

        // 检查会话是否存在
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          throw new Error('会话不存在');
        }

        // 检查用户是否是会话参与者
        if (!conversation.participants.includes(userId)) {
          throw new Error('您不是该会话的参与者');
        }

        // 创建消息
        const message = await Message.create({
          conversation: conversationId,
          sender: userId,
          content,
          attachments,
          readBy: [{ user: userId }]
        });

        // 更新会话的最后消息和未读数
        conversation.lastMessage = message._id;
        conversation.participants.forEach(participantId => {
          if (participantId.toString() !== userId) {
            const currentCount = conversation.unreadCount.get(participantId.toString()) || 0;
            conversation.unreadCount.set(participantId.toString(), currentCount + 1);
          }
        });
        await conversation.save();

        // 发送消息给会话参与者
        io.to(conversationId).emit('new_message', message);

        // 发送通知给不在线的参与者
        conversation.participants.forEach(async (participantId) => {
          if (participantId.toString() !== userId && !onlineUsers.has(participantId.toString())) {
            await NotificationController.createNotification({
              recipient: participantId,
              type: 'message',
              actor: userId,
              message: message._id
            });
          }
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // 处理消息已读
    socket.on('mark_messages_read', async (data) => {
      try {
        const { conversationId } = data;

        // 更新消息已读状态
        await Message.updateMany(
          {
            conversation: conversationId,
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
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          conversation.unreadCount.set(userId, 0);
          await conversation.save();
        }

        // 通知其他参与者
        io.to(conversationId).emit('messages_read', {
          conversationId,
          userId
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // 处理消息撤回
    socket.on('recall_message', async (data) => {
      try {
        const { messageId } = data;

        const message = await Message.findById(messageId);
        if (!message) {
          throw new Error('消息不存在');
        }

        // 检查是否是消息发送者
        if (message.sender.toString() !== userId) {
          throw new Error('您不能撤回他人的消息');
        }

        // 检查消息发送时间是否在2分钟内
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        if (message.createdAt < twoMinutesAgo) {
          throw new Error('只能撤回2分钟内的消息');
        }

        message.recalled = true;
        message.recalledAt = new Date();
        await message.save();

        // 通知会话参与者
        io.to(message.conversation.toString()).emit('message_recalled', {
          messageId,
          conversationId: message.conversation
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // 处理用户输入状态
    socket.on('typing', (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit('user_typing', {
        userId,
        conversationId
      });
    });

    // 处理用户停止输入
    socket.on('stop_typing', (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit('user_stop_typing', {
        userId,
        conversationId
      });
    });

    // 处理断开连接
    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('user_offline', { userId });
    });
  });
};

// 加入房间
async function handleJoinRoom(socket, roomId) {
  try {
    const room = await VoiceChatRoom.findById(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.status !== 'active') {
      socket.emit('error', { message: 'Room is not active' });
      return;
    }

    // 加入 Socket.IO 房间
    socket.join(roomId);
    socket.roomId = roomId;

    // 更新数据库中的参与者
    await room.addParticipant(socket.user._id);

    // 广播新参与者加入
    getIO().to(roomId).emit('participantJoined', {
      user: socket.user,
      role: 'listener'
    });
  } catch (error) {
    console.error('Join room error:', error);
    socket.emit('error', { message: 'Failed to join room' });
  }
}

// 离开房间
async function handleLeaveRoom(socket, roomId) {
  try {
    const room = await VoiceChatRoom.findById(roomId);
    if (!room) {
      return;
    }

    // 离开 Socket.IO 房间
    socket.leave(roomId);
    delete socket.roomId;

    // 更新数据库中的参与者
    await room.removeParticipant(socket.user._id);

    // 广播参与者离开
    getIO().to(roomId).emit('participantLeft', {
      userId: socket.user._id
    });
  } catch (error) {
    console.error('Leave room error:', error);
  }
}

// 静音/取消静音
async function handleMute(socket, { roomId, isMuted }) {
  try {
    const room = await VoiceChatRoom.findById(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    // 更新参与者的静音状态
    const participant = room.participants.find(p => p.user.toString() === socket.user._id.toString());
    if (participant) {
      participant.isMuted = isMuted;
      await room.save();

      // 广播静音状态变化
      getIO().to(roomId).emit('participantMuted', {
        userId: socket.user._id,
        isMuted
      });
    }
  } catch (error) {
    console.error('Mute error:', error);
    socket.emit('error', { message: 'Failed to update mute status' });
  }
}

// 举手/取消举手
async function handleRaiseHand(socket, { roomId, hasRaisedHand }) {
  try {
    const room = await VoiceChatRoom.findById(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (!room.settings.allowRaiseHand) {
      socket.emit('error', { message: 'Raising hand is not allowed in this room' });
      return;
    }

    // 更新参与者的举手状态
    const participant = room.participants.find(p => p.user.toString() === socket.user._id.toString());
    if (participant) {
      participant.hasRaisedHand = hasRaisedHand;
      await room.save();

      // 广播举手状态变化
      getIO().to(roomId).emit('participantRaisedHand', {
        userId: socket.user._id,
        hasRaisedHand
      });
    }
  } catch (error) {
    console.error('Raise hand error:', error);
    socket.emit('error', { message: 'Failed to update raise hand status' });
  }
}

// 录制相关
async function handleRecording(socket, { roomId }, action) {
  try {
    const room = await VoiceChatRoom.findById(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.host.toString() !== socket.user._id.toString()) {
      socket.emit('error', { message: 'Only host can control recording' });
      return;
    }

    if (action === 'start') {
      await room.startRecording();
      getIO().to(roomId).emit('recordingStarted');
    } else {
      await room.stopRecording();
      getIO().to(roomId).emit('recordingStopped');
    }
  } catch (error) {
    console.error('Recording error:', error);
    socket.emit('error', { message: `Failed to ${action} recording` });
  }
}

// 表情反应
async function handleReaction(socket, { roomId, reaction }) {
  try {
    const room = await VoiceChatRoom.findById(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (!room.settings.allowReactions) {
      socket.emit('error', { message: 'Reactions are not allowed in this room' });
      return;
    }

    // 广播表情反应
    getIO().to(roomId).emit('reaction', {
      userId: socket.user._id,
      reaction
    });
  } catch (error) {
    console.error('Reaction error:', error);
    socket.emit('error', { message: 'Failed to send reaction' });
  }
}

// 语音转文字
async function handleTranscript(socket, { roomId, text }) {
  try {
    const room = await VoiceChatRoom.findById(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    // 广播语音转文字结果
    getIO().to(roomId).emit('transcript', {
      userId: socket.user._id,
      text
    });
  } catch (error) {
    console.error('Transcript error:', error);
    socket.emit('error', { message: 'Failed to process transcript' });
  }
}

// 背景音乐
async function handleBackgroundMusic(socket, { roomId, action, track, volume }) {
  try {
    const room = await VoiceChatRoom.findById(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (!room.settings.allowBackgroundMusic) {
      socket.emit('error', { message: 'Background music is not allowed in this room' });
      return;
    }

    if (room.host.toString() !== socket.user._id.toString()) {
      socket.emit('error', { message: 'Only host can control background music' });
      return;
    }

    // 广播背景音乐控制
    getIO().to(roomId).emit('backgroundMusic', {
      action,
      track,
      volume
    });
  } catch (error) {
    console.error('Background music error:', error);
    socket.emit('error', { message: 'Failed to control background music' });
  }
}

module.exports = {
  handleJoinRoom,
  handleLeaveRoom,
  handleMute,
  handleRaiseHand,
  handleRecording,
  handleReaction,
  handleTranscript,
  handleBackgroundMusic,
  initializeSocket,
  onlineUsers
}; 