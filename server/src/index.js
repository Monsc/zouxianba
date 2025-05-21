const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const tagRoutes = require('./routes/tags');
const bookmarkRoutes = require('./routes/bookmarks');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const http = require('http');
const { Server } = require('socket.io');
const { Message } = require('./models/Message');
const mongoose = require('mongoose');
const { authenticateToken } = require('./middleware/auth');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

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
    'https://zouxianba-client.onrender.com', // 生产前端域名
    'http://localhost:5173', // Vite 本地开发端口
    'http://localhost:3000', // 兼容旧端口
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'x-request-timestamp'],
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', authenticateToken, postRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/bookmarks', authenticateToken, bookmarkRoutes);

// Health check endpoint
app.use('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'https://zouxianba-client.onrender.com', // 新增生产前端域名
      'https://zouxianba.vercel.app',
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'x-request-timestamp'],
  }
});

const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // 用户认证
  socket.on('authenticate', (token) => {
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      connectedUsers.set(user.id, socket.id);
      socket.userId = user.id;
      console.log('User authenticated:', user.id);
    } catch (err) {
      console.error('Authentication error:', err);
    }
  });

  // 处理私信
  socket.on('private_message', async (data) => {
    const { recipientId, message } = data;
    const recipientSocketId = connectedUsers.get(recipientId);
    
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('new_message', {
        senderId: socket.userId,
        message
      });
    }
  });

  // 处理点赞通知
  socket.on('like_post', async (data) => {
    const { postId, postAuthorId } = data;
    const authorSocketId = connectedUsers.get(postAuthorId);
    
    if (authorSocketId) {
      io.to(authorSocketId).emit('post_liked', {
        postId,
        userId: socket.userId
      });
    }
  });

  // 处理评论通知
  socket.on('comment_post', async (data) => {
    const { postId, postAuthorId } = data;
    const authorSocketId = connectedUsers.get(postAuthorId);
    
    if (authorSocketId) {
      io.to(authorSocketId).emit('post_commented', {
        postId,
        userId: socket.userId
      });
    }
  });

  // 处理关注通知
  socket.on('follow_user', async (data) => {
    const { targetUserId } = data;
    const targetSocketId = connectedUsers.get(targetUserId);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('user_followed', {
        followerId: socket.userId
      });
    }
  });

  // 断开连接处理
  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
    }
    console.log('User disconnected:', socket.id);
  });
});

// Start server
server.listen(process.env.PORT || 5000, () => {
  console.log('Server running');
}); 