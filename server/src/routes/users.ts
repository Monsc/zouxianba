import express from 'express'
import { body, validationResult } from 'express-validator'
import multer from 'multer'
import path from 'path'
import User from '../models/User'
import Post from '../models/Post'
import { auth, checkRole } from '../middleware/auth'

const router = express.Router()

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (extname && mimetype) {
      return cb(null, true)
    }
    cb(new Error('只允许上传图片文件！'))
  },
})

// 获取用户信息
router.get('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: '服务器错误' })
  }
})

// 获取用户帖子
router.get('/:id/posts', async (req: express.Request, res: express.Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const posts = await Post.find({ author: req.params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar')
      .populate('comments')

    const total = await Post.countDocuments({ author: req.params.id })

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    })
  } catch (error) {
    res.status(500).json({ message: '服务器错误' })
  }
})

// 更新用户信息
router.put(
  '/:id',
  auth,
  upload.single('avatar'),
  [
    body('username').optional().trim().isLength({ min: 3 }).escape(),
    body('email').optional().isEmail().normalizeEmail(),
  ],
  async (req: any, res: express.Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      if (req.user._id.toString() !== req.params.id) {
        return res.status(403).json({ message: '没有权限修改此用户信息' })
      }

      const updates: any = {}
      if (req.body.username) updates.username = req.body.username
      if (req.body.email) updates.email = req.body.email
      if (req.file) updates.avatar = `/uploads/${req.file.filename}`

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true }
      ).select('-password')

      res.json(user)
    } catch (error) {
      res.status(500).json({ message: '服务器错误' })
    }
  }
)

// 管理员：获取所有用户
router.get('/', auth, checkRole(['admin']), async (req: express.Request, res: express.Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const users = await User.find()
      .select('-password')
      .skip(skip)
      .limit(limit)

    const total = await User.countDocuments()

    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    })
  } catch (error) {
    res.status(500).json({ message: '服务器错误' })
  }
})

// 管理员：更新用户角色
router.put(
  '/:id/role',
  auth,
  checkRole(['admin']),
  [
    body('role').isIn(['user', 'verified', 'admin']),
  ],
  async (req: any, res: express.Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: { role: req.body.role } },
        { new: true }
      ).select('-password')

      if (!user) {
        return res.status(404).json({ message: '用户不存在' })
      }

      res.json(user)
    } catch (error) {
      res.status(500).json({ message: '服务器错误' })
    }
  }
)

export default router 