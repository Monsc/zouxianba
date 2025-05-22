const socketIO = require('socket.io');
const { initializeSocket } = require('./events');

let io;

const initializeIO = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // 初始化Socket.IO事件处理
  initializeSocket(io);

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO未初始化');
  }
  return io;
};

module.exports = {
  initializeIO,
  getIO,
  initializeSocket
}; 