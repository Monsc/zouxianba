const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const CommentController = require('../controllers/CommentController');

// 获取评论列表
router.get('/', catchAsync(async (req, res) => {
  res.json({
    status: 'success',
    message: '评论功能正在开发中',
    data: []
  });
}));

// 创建评论
console.log("Type of handler:", typeof CommentController.createComment); // ✅ debug 语句，部署前可删
router.post('/', CommentController.createComment);

// 更新评论
console.log("Type of updateComment:", typeof CommentController.updateComment);  // 应该输出 function
router.put('/:id', auth, catchAsync(async (req, res) => {
  throw new AppError('评论功能正在开发中', 501);
}));

// 删除评论
router.delete('/:id', auth, catchAsync(async (req, res) => {
  throw new AppError('评论功能正在开发中', 501);
}));

// 获取评论详情
router.get('/:id', catchAsync(async (req, res) => {
  throw new AppError('评论功能正在开发中', 501);
}));

module.exports = router; 