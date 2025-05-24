const express = require('express');
const router = express.Router();
const userService = require('../../services/user.service');
const { authMiddleware, checkRole } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/validator');
const { upload } = require('../../middlewares/upload');

// 具体路由应放在参数路由之前
// 用户注册
router.post('/register',
  validate({
    body: {
      email: { type: 'email', required: true },
      username: { type: 'string', required: true, min: 3, max: 30 },
      password: { type: 'string', required: true, min: 6 },
    },
  }),
  async (req, res, next) => {
    try {
      const user = await userService.register(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }
);

// 用户登录
router.post('/login',
  validate({
    body: {
      email: { type: 'email', required: true },
      password: { type: 'string', required: true },
    },
  }),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await userService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// 获取当前用户信息
router.get('/me',
  authMiddleware,
  async (req, res, next) => {
    try {
      const user = await userService.getUserProfile(req.user);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

// 更新用户资料
router.patch('/me',
  authMiddleware,
  upload.single('avatar'),
  validate({
    body: {
      username: { type: 'string', optional: true, min: 3, max: 30 },
      bio: { type: 'string', optional: true, max: 160 },
    },
  }),
  async (req, res, next) => {
    try {
      const updateData = {
        ...req.body,
        avatar: req.file ? req.file.path : undefined,
      };
      const user = await userService.updateProfile(req.user._id, updateData);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

// 搜索用户
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
      const users = await userService.searchUsers(query, page, limit);
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
);

// 管理员接口：获取所有用户
router.get('/',
  authMiddleware,
  checkRole('admin'),
  validate({
    query: {
      page: { type: 'number', optional: true, min: 1 },
      limit: { type: 'number', optional: true, min: 1, max: 50 },
    },
  }),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const users = await userService.getAllUsers(page, limit);
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
);

// 管理员接口：更新用户状态
router.patch('/:userId/status',
  authMiddleware,
  checkRole('admin'),
  validate({
    body: {
      status: { type: 'string', required: true, enum: ['active', 'inactive', 'banned'] },
    },
  }),
  async (req, res, next) => {
    try {
      const user = await userService.updateUserStatus(req.params.userId, req.body.status);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

// 关注用户
router.post('/:userId/follow',
  authMiddleware,
  async (req, res, next) => {
    try {
      const result = await userService.followUser(req.user._id, req.params.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// 取消关注
router.delete('/:userId/follow',
  authMiddleware,
  async (req, res, next) => {
    try {
      const result = await userService.unfollowUser(req.user._id, req.params.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// 获取用户关注列表
router.get('/:userId/following',
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
      const following = await userService.getFollowing(req.params.userId, page, limit);
      res.json(following);
    } catch (error) {
      next(error);
    }
  }
);

// 获取用户粉丝列表
router.get('/:userId/followers',
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
      const followers = await userService.getFollowers(req.params.userId, page, limit);
      res.json(followers);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router; 