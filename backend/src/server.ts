import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import usersRouter from './routes/users';
import { notificationRoutes } from './routes/notificationRoutes';
import { Notification } from './models/Notification';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// 存储用户ID和socket的映射
const userSockets = new Map<string, string>();

// Socket.IO 连接处理
io.on('connection', (socket) => {
  console.log('用户已连接:', socket.id);

  // 用户登录时存储socket映射
  socket.on('user:login', (userId: string) => {
    userSockets.set(userId, socket.id);
    console.log(`用户 ${userId} 已登录, socket: ${socket.id}`);
  });

  // 用户登出时移除socket映射
  socket.on('user:logout', (userId: string) => {
    userSockets.delete(userId);
    console.log(`用户 ${userId} 已登出`);
  });

  // 断开连接时清理
  socket.on('disconnect', () => {
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        console.log(`用户 ${userId} 断开连接`);
        break;
      }
    }
  });
});

// 导出 Socket.IO 实例和用户映射
export const socketIO = io;
export const getUserSocket = (userId: string) => userSockets.get(userId);

// ... existing code ...

app.use('/api/users', usersRouter);
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 