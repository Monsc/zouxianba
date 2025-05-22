const express = require('express');
const router = express.Router();

// 导入所有路由
const userRoutes = require('./users');
const authRoutes = require('./auth');
const postRoutes = require('./posts');
const commentRoutes = require('./comments');
const messageRoutes = require('./messages');
const notificationRoutes = require('./notifications');
const userRelationshipRoutes = require('./userRelationships');
const searchRoutes = require('./search');

// 注册路由
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/relationships', userRelationshipRoutes);
router.use('/search', searchRoutes);

module.exports = router; 