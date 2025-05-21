const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const mongoose = require('mongoose');
const { authenticateToken } = require('./middleware/auth');
const config = require('./config');
const { initializeSocket } = require('./socket');

// 路由导入
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const tagRoutes = require('./routes/tags');
const bookmarkRoutes = require('./routes/bookmarks');
const voiceChatRoutes = require('./routes/voice-chat');

// 中间件导入
const { errorHandler, notFound } = require('./middleware/errorHandler');

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 创建 Express 应用
const app = express();

// 中间件配置
app.use(helmet());
app.use(cors({
  origin: [
    'https://zouxianba-client.onrender.com',
    'https://zouxianba.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-csrf-token',
    'x-request-timestamp',
    'x-request-signature'
  ]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由配置
app.use('/api/auth', authRoutes);
app.use('/api/posts', authenticateToken, postRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/bookmarks', authenticateToken, bookmarkRoutes);
app.use('/api/voice-chat', authenticateToken, voiceChatRoutes);

// 健康检查端点
app.use('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// 错误处理
app.use(notFound);
app.use(errorHandler);

// 创建 HTTP 服务器
const server = http.createServer(app);

// 连接数据库并启动服务器
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  
  // 初始化 Socket.IO
  initializeSocket(server);
  
  // 启动服务器
  server.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      PORT: config.port,
      MONGODB_URI: config.mongoUri ? 'defined' : 'undefined'
    });
  });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
}); 