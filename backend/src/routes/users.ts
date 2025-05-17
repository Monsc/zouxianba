import express, { Request, Response } from 'express';
const { body, validationResult } = require('express-validator');
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import User from '../models/User';
import Post from '../models/Post';
import { auth, checkRole } from '../middleware/auth';
// import Notification from '../models/Notification'; // 如有通知功能可解开

// Extend Request type to include user
interface AuthRequest extends Request {
  user: any;
}

const router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req: Request, file: any, cb: (error: Error | null, destination: string) => void) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req: Request, file: any, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req: Request, file: any, cb: FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('只允许上传图片文件！'));
  },
});

// 获取用户信息
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取用户帖子
router.get('/:id/posts', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const posts = await Post.find({ author: req.params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar')
      .populate('comments');
    const total = await Post.countDocuments({ author: req.params.id });
    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新用户信息（支持 bio/avatar）
router.put('/:id', auth, upload.single('avatar'), [
  body('username').optional().trim().isLength({ min: 3 }).escape(),
  body('email').optional().isEmail().normalizeEmail(),
], async (req: any, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const userFromToken = req.user;
    if (userFromToken._id.toString() !== req.params.id) {
      res.status(403).json({ message: '没有权限修改此用户信息' });
      return;
    }
    const updates: any = {};
    if (req.body.username) updates.username = req.body.username;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.bio) updates.bio = req.body.bio;
    if ((req as any).file) updates.avatar = `/api/uploads/${(req as any).file.filename}`;
    const user = await User.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 管理员：获取所有用户
router.get('/', auth, checkRole(['admin']) as any, async (req: any, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const users = await User.find()
      .select('-password')
      .skip(skip)
      .limit(limit);
    const total = await User.countDocuments();
    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 管理员：更新用户角色
router.put(
  '/:id/role',
  auth,
  checkRole(['admin']) as any,
  body('role').isIn(['user', 'verified', 'admin']),
  async (req: any, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      const user = await User.findByIdAndUpdate(req.params.id, { $set: { role: req.body.role } }, { new: true }).select('-password');
      if (!user) {
        res.status(404).json({ message: '用户不存在' });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: '服务器错误' });
    }
  }
);

// 关注用户
router.post('/:id/follow', auth, async (req: any, res: Response): Promise<void> => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }
    if (targetUser._id.toString() === req.user._id.toString()) {
      res.status(400).json({ message: '不能关注自己' });
      return;
    }
    if (!(targetUser as any).followers) (targetUser as any).followers = [];
    if (!req.user.following) req.user.following = [];
    if ((targetUser as any).followers.includes(req.user._id)) {
      res.status(400).json({ message: '已关注' });
      return;
    }
    (targetUser as any).followers.push(req.user._id);
    await targetUser.save();
    // 可选：同步添加到当前用户的 following
    // req.user.following.push(targetUser._id)
    // await req.user.save()
    // 生成通知（如有 Notification 模型可解开）
    // await Notification.create({
    //   user: targetUser._id,
    //   type: 'follow',
    //   from: req.user._id,
    // });
    res.json({ message: '关注成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error instanceof Error ? error.message : String(error) });
  }
});

export default router; 