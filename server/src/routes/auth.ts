import express from 'express'
import { body, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import { auth } from '../middleware/auth'

const router = express.Router()

// 注册
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3 }).escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { username, email, password } = req.body

      // 检查用户是否已存在
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      })

      if (existingUser) {
        return res.status(400).json({
          message: '用户名或邮箱已被注册',
        })
      }

      // 创建新用户
      const user = new User({
        username,
        email,
        password,
      })

      await user.save()

      // 生成 token
      const token = jwt.sign(
        { _id: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        {
          expiresIn: '7d',
        }
      )

      res.status(201).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      })
    } catch (error) {
      res.status(500).json({ message: '服务器错误' })
    }
  }
)

// 登录
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists(),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { email, password } = req.body

      // 查找用户
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(401).json({ message: '邮箱或密码错误' })
      }

      // 验证密码
      const isMatch = await user.comparePassword(password)
      if (!isMatch) {
        return res.status(401).json({ message: '邮箱或密码错误' })
      }

      // 生成 token
      const token = jwt.sign(
        { _id: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        {
          expiresIn: '7d',
        }
      )

      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      })
    } catch (error) {
      res.status(500).json({ message: '服务器错误' })
    }
  }
)

// 获取当前用户信息
router.get('/me', auth, async (req: any, res: express.Response) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: '服务器错误' })
  }
})

export default router 