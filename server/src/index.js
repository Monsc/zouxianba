const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const http = require('http');
const SocketIOServer = require('socket.io').Server;
const { Message } = require('./models/Message');
const mongoose = require('mongoose');

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
    'https://zouxianba-client.onrender.com', // 新增生产前端域名
    'https://zouxianba.vercel.app', // 保留原有
    'http://localhost:3000',        // 本地开发
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
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
      'https://zouxianba-client.onrender.com', // 新增生产前端域名
      'https://zouxianba.vercel.app',
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
  }
});

const userSocketMap = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  let userId = '';
  socket.on('login', (uid) => {
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

// Start server
server.listen(process.env.PORT || 5000, () => {
  console.log('Server running');
}); 