const express = require('express');
const router = express.Router();
const Bookmark = require('../models/Bookmark');
const { authenticateToken } = require('../middleware/auth');

// 获取用户的收藏
router.get('/', authenticateToken, async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.id })
      .populate({
        path: 'post',
        populate: {
          path: 'author',
          select: 'username handle avatar'
        }
      })
      .sort({ createdAt: -1 });
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 添加收藏
router.post('/:postId', authenticateToken, async (req, res) => {
  try {
    const bookmark = new Bookmark({
      user: req.user.id,
      post: req.params.postId
    });
    await bookmark.save();
    res.status(201).json(bookmark);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: '已经收藏过了' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// 取消收藏
router.delete('/:postId', authenticateToken, async (req, res) => {
  try {
    await Bookmark.findOneAndDelete({
      user: req.user.id,
      post: req.params.postId
    });
    res.json({ message: '收藏已取消' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 检查是否已收藏
router.get('/check/:postId', authenticateToken, async (req, res) => {
  try {
    const bookmark = await Bookmark.findOne({
      user: req.user.id,
      post: req.params.postId
    });
    res.json({ isBookmarked: !!bookmark });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 