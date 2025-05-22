const express = require('express');
const router = express.Router();
const {
  createTag,
  getTags,
  getPopularTags,
  getUserTags,
  addUserTag,
  removeUserTag,
  searchTags,
  verifyTag,
  getTagUsers,
  updateTag,
} = require('../controllers/UserTagController');
const { auth, adminAuth } = require('../middleware/auth');

// 标签管理
router.post('/', auth, createTag);
router.get('/', auth, getTags);
router.get('/popular', auth, getPopularTags);
router.get('/search', auth, searchTags);

// 用户标签
router.get('/user/:userId', auth, getUserTags);
router.post('/:tagId/users', auth, addUserTag);
router.delete('/:tagId/users', auth, removeUserTag);

// 标签详情
router.get('/:tagId/users', auth, getTagUsers);

// 管理员操作
router.patch('/:tagId/verify', adminAuth, verifyTag);

// Add the route
router.patch('/:tagId', auth, updateTag);

module.exports = router; 