const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config');
const {
  handleJoinRoom,
  handleLeaveRoom,
  handleMute,
  handleRaiseHand,
  handleRecording,
  handleReaction,
  handleTranscript,
  handleBackgroundMusic
} = require('./events');

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: config.socket.cors
  });

  // 身份验证中间件
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, config.jwt.secret);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.user._id);

    // 加入房间
    socket.on('joinRoom', (roomId) => handleJoinRoom(socket, roomId));

    // 离开房间
    socket.on('leaveRoom', (roomId) => handleLeaveRoom(socket, roomId));

    // 静音/取消静音
    socket.on('mute', (data) => handleMute(socket, data));

    // 举手/取消举手
    socket.on('raiseHand', (data) => handleRaiseHand(socket, data));

    // 录制相关
    socket.on('startRecording', (data) => handleRecording(socket, data, 'start'));
    socket.on('stopRecording', (data) => handleRecording(socket, data, 'stop'));

    // 表情反应
    socket.on('reaction', (data) => handleReaction(socket, data));

    // 语音转文字
    socket.on('transcript', (data) => handleTranscript(socket, data));

    // 背景音乐
    socket.on('backgroundMusic', (data) => handleBackgroundMusic(socket, data));

    // 断开连接
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user._id);
      if (socket.roomId) {
        handleLeaveRoom(socket, socket.roomId);
      }
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

module.exports = {
  initializeSocket,
  getIO
}; 