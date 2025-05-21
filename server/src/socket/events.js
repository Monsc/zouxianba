const VoiceChatRoom = require('../models/VoiceChatRoom');
const { getIO } = require('./index');

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
  handleBackgroundMusic
}; 