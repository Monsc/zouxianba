import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import userRoutes from './routes/users';
import notificationRoutes from './routes/notifications';
import { errorHandler, notFound } from './middleware/errorHandler';
import http from 'http';
const SocketIOServer = require('socket.io').Server;
import { Message } from './models/Message';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Log environment variables (without sensitive data)
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI ? 'defined' : 'undefined'
});

// Create Express app
const app = express();

// Enable CORS for specific origins
app.use(cors({
  origin: [
    'https://zouxianba.vercel.app', // 正式前端域名
    'http://localhost:3000',        // 本地开发
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.use('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: [
      'https://zouxianba.vercel.app',
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }
});

const userSocketMap = new Map<string, string>(); // userId -> socketId

io.on('connection', (socket: any) => {
  let userId = '';
  socket.on('login', (uid: string) => {
    userId = uid;
    userSocketMap.set(uid, socket.id);
  });

  socket.on('send_message', async (data: any) => {
    // data: { to, content, contentType, imageUrl }
    const msg = await Message.create({
      from: userId,
      to: data.to,
      content: data.content,
      contentType: data.contentType || 'text',
      imageUrl: data.imageUrl,
    });
    // 推送给目标用户
    const toSocket = userSocketMap.get(data.to);
    if (toSocket) {
      io.to(toSocket).emit('new_message', msg);
    }
    // 推送给自己（同步）
    socket.emit('new_message', msg);
  });

  socket.on('read_messages', async (data: any) => {
    // data: { from }
    await Message.updateMany({ from: data.from, to: userId, read: false }, { read: true });
    const toSocket = userSocketMap.get(data.from);
    if (toSocket) {
      io.to(toSocket).emit('messages_read', { from: userId });
    }
  });

  socket.on('disconnect', () => {
    if (userId) userSocketMap.delete(userId);
  });
});

// Start server
server.listen(process.env.PORT || 5000, () => {
  console.log('Server running');
}); 