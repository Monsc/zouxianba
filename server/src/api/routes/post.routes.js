const express = require('express');
const router = express.Router();
const postService = require('../../services/post.service');
const { authMiddleware, checkRole, checkOwnership } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/validator');
const { upload } = require('../../middlewares/upload');
const Post = require('../../models/post.model');

// 创建帖子
router.post('/',
  authMiddleware,
  upload.array('images', 9),
  validate({
    body: {
      content: { type: 'string', required: true, max: 10000 },
      visibility: { type: 'string', optional: true, enum: ['public', 'private', 'followers'] },
      tags: { type: 'array', optional: true, items: { type: 'string' } },
      location: {
        type: 'object',
        optional: true,
        properties: {
          type: { type: 'string', enum: ['Point'] },
          coordinates: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2 },
        },
      },
    },
  }),
  async (req, res, next) => {
    try {
      const postData = {
        ...req.body,
        images: req.files?.map(file => ({
          url: file.path,
          width: file.width,
          height: file.height,
          size: file.size,
          type: file.mimetype,
        })),
      };
      const post = await postService.createPost(req.user._id, postData);
      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  }
);

// 获取帖子列表
router.get('/',
  authMiddleware,
  validate({
    query: {
      page: { type: 'number', optional: true, min: 1 },
      limit: { type: 'number', optional: true, min: 1, max: 50 },
    },
  }),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const posts = await postService.getPosts({}, page, limit);
      res.json(posts);
    } catch (error) {
      next(error);
    }
  }
);

// 获取用户时间线
router.get('/timeline',
  authMiddleware,
  validate({
    query: {
      page: { type: 'number', optional: true, min: 1 },
      limit: { type: 'number', optional: true, min: 1, max: 50 },
    },
  }),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const posts = await postService.getUserTimeline(req.user._id, page, limit);
      res.json(posts);
    } catch (error) {
      next(error);
    }
  }
);

// 获取帖子详情
router.get('/:postId',
  authMiddleware,
  async (req, res, next) => {
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) {
        throw new AppError(404, '帖子不存在');
      }
      await post.incrementViewCount();
      const postDetails = await postService.getPostDetails(post);
      res.json(postDetails);
    } catch (error) {
      next(error);
    }
  }
);

// 更新帖子
router.patch('/:postId',
  authMiddleware,
  checkOwnership(Post),
  upload.array('images', 9),
  validate({
    body: {
      content: { type: 'string', optional: true, max: 10000 },
      visibility: { type: 'string', optional: true, enum: ['public', 'private', 'followers'] },
      tags: { type: 'array', optional: true, items: { type: 'string' } },
    },
  }),
  async (req, res, next) => {
    try {
      const updateData = {
        ...req.body,
        images: req.files?.map(file => ({
          url: file.path,
          width: file.width,
          height: file.height,
          size: file.size,
          type: file.mimetype,
        })),
      };
      const post = await postService.updatePost(req.params.postId, req.user._id, updateData);
      res.json(post);
    } catch (error) {
      next(error);
    }
  }
);

// 删除帖子
router.delete('/:postId',
  authMiddleware,
  checkOwnership(Post),
  async (req, res, next) => {
    try {
      const result = await postService.deletePost(req.params.postId, req.user._id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// 点赞/取消点赞
router.post('/:postId/like',
  authMiddleware,
  async (req, res, next) => {
    try {
      const result = await postService.toggleLike(req.params.postId, req.user._id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// 添加评论
router.post('/:postId/comments',
  authMiddleware,
  validate({
    body: {
      content: { type: 'string', required: true, max: 1000 },
    },
  }),
  async (req, res, next) => {
    try {
      const post = await postService.addComment(req.params.postId, req.user._id, req.body.content);
      res.json(post);
    } catch (error) {
      next(error);
    }
  }
);

// 删除评论
router.delete('/:postId/comments/:commentId',
  authMiddleware,
  async (req, res, next) => {
    try {
      const post = await postService.deleteComment(
        req.params.postId,
        req.params.commentId,
        req.user._id
      );
      res.json(post);
    } catch (error) {
      next(error);
    }
  }
);

// 搜索帖子
router.get('/search',
  authMiddleware,
  validate({
    query: {
      q: { type: 'string', required: true },
      page: { type: 'number', optional: true, min: 1 },
      limit: { type: 'number', optional: true, min: 1, max: 50 },
    },
  }),
  async (req, res, next) => {
    try {
      const { q: query, page = 1, limit = 20 } = req.query;
      const posts = await postService.searchPosts(query, page, limit);
      res.json(posts);
    } catch (error) {
      next(error);
    }
  }
);

// 获取热门帖子
router.get('/hot',
  authMiddleware,
  validate({
    query: {
      page: { type: 'number', optional: true, min: 1 },
      limit: { type: 'number', optional: true, min: 1, max: 50 },
    },
  }),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const posts = await postService.getHotPosts(page, limit);
      res.json(posts);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router; 