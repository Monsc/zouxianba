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
import { Server as SocketIOServer } from 'socket.io';
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

// Enable CORS for all origins
app.use(cors());

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
const io = new SocketIOServer(server, { cors: { origin: '*' } });

const userSocketMap = new Map<string, string>(); // userId -> socketId

io.on('connection', (socket) => {
  let userId = '';
  socket.on('login', (uid: string) => {
    userId = uid;
    userSocketMap.set(uid, socket.id);
  });

  socket.on('send_message', async (data) => {
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

  socket.on('read_messages', async (data) => {
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

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('Environment variables:', {
      MONGODB_URI: process.env.MONGODB_URI ? 'defined' : 'undefined',
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT
    });
    process.exit(1);
  }
};

// Start server
server.listen(process.env.PORT || 5000, () => {
  console.log('Server running');
}); 