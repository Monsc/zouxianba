const express = require('express');
const router = express.Router();
const UserTagController = require('../controllers/UserTagController');
const { auth, adminAuth } = require('../middleware/auth');

// 标签管理
router.post('/', auth, UserTagController.createTag);
router.get('/', auth, UserTagController.getTags);
router.get('/popular', auth, UserTagController.getPopularTags);
router.get('/search', auth, UserTagController.searchTags);

// 用户标签
router.get('/user/:userId', auth, UserTagController.getUserTags);
router.post('/:tagId/users', auth, UserTagController.addUserTag);
router.delete('/:tagId/users', auth, UserTagController.removeUserTag);

// 标签详情
router.get('/:tagId/users', auth, UserTagController.getTagUsers);

// 管理员操作
router.patch('/:tagId/verify', adminAuth, UserTagController.verifyTag);

module.exports = router; 