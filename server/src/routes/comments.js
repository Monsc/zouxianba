const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { createComment, updateComment } = require('../controllers/CommentController');

// 获取评论列表
router.get('/', catchAsync(async (req, res) => {
  res.json({
    status: 'success',
    message: '评论功能正在开发中',
    data: []
  });
}));

// 创建评论
console.log('createComment type:', typeof createComment); // function
console.log('updateComment type:', typeof updateComment); // function

router.post('/', createComment);

// 更新评论
router.put('/:id', updateComment);

// 删除评论
router.delete('/:id', auth, catchAsync(async (req, res) => {
  throw new AppError('评论功能正在开发中', 501);
}));

// 获取评论详情
router.get('/:id', catchAsync(async (req, res) => {
  throw new AppError('评论功能正在开发中', 501);
}));

module.exports = router; 