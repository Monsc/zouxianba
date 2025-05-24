const express = require('express');
const router = express.Router();
const Tag = require('../models/Tag');
const { authenticateToken } = require('../middleware/auth');

// 获取热门话题
router.get('/trending', async (req, res) => {
  try {
    const hashtags = await Tag.find({ type: 'hashtag' })
      .sort({ count: -1 })
      .limit(10);
    res.json(hashtags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 搜索话题
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const hashtags = await Tag.find({
      type: 'hashtag',
      name: new RegExp(query, 'i')
    }).limit(10);
    res.json(hashtags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取话题相关帖子
router.get('/:name/posts', async (req, res) => {
  try {
    const tag = await Tag.findOne({ name: req.params.name })
      .populate({
        path: 'posts',
        populate: {
          path: 'author',
          select: 'username handle avatar'
        }
      });
    
    if (!tag) {
      return res.status(404).json({ message: '话题不存在' });
    }

    res.json(tag.posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取热门话题（推特化体验）
router.get('/topics/trending', (req, res) => {
  // TODO: 可实现真实热门话题逻辑
  res.json([]);
});

module.exports = router; 