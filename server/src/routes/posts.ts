import express from 'express'
import { body, validationResult } from 'express-validator'
import multer from 'multer'
import path from 'path'
import Post from '../models/Post'
import Comment from '../models/Comment'
import { auth } from '../middleware/auth'

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
    fileSize: 5 * 1024 * 1024, // 5MB
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

// 创建帖子
router.post(
  '/',
  auth,
  upload.array('images', 9),
  [
    body('content').trim().isLength({ min: 1, max: 1000 }),
  ],
  async (req: any, res: express.Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { content } = req.body
      const images = (req.files as Express.Multer.File[]).map(
        (file) => `/uploads/${file.filename}`
      )

      const post = new Post({
        author: req.user._id,
        content,
        images,
      })

      await post.save()
      await post.populate('author', 'username avatar')

      res.status(201).json(post)
    } catch (error) {
      res.status(500).json({ message: '服务器错误' })
    }
  }
)

// 获取帖子列表
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar')
      .populate('comments')

    const total = await Post.countDocuments()

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

// 获取单个帖子
router.get('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username avatar',
        },
      })

    if (!post) {
      return res.status(404).json({ message: '帖子不存在' })
    }

    res.json(post)
  } catch (error) {
    res.status(500).json({ message: '服务器错误' })
  }
})

// 点赞帖子
router.post('/:id/like', auth, async (req: any, res: express.Response) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ message: '帖子不存在' })
    }

    const likeIndex = post.likes.indexOf(req.user._id)
    if (likeIndex === -1) {
      post.likes.push(req.user._id)
    } else {
      post.likes.splice(likeIndex, 1)
    }

    await post.save()
    res.json(post)
  } catch (error) {
    res.status(500).json({ message: '服务器错误' })
  }
})

// 评论帖子
router.post(
  '/:id/comments',
  auth,
  [
    body('content').trim().isLength({ min: 1, max: 500 }),
  ],
  async (req: any, res: express.Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const post = await Post.findById(req.params.id)
      if (!post) {
        return res.status(404).json({ message: '帖子不存在' })
      }

      const comment = new Comment({
        author: req.user._id,
        post: post._id,
        content: req.body.content,
        parent: req.body.parent,
      })

      await comment.save()
      post.comments.push(comment._id)
      await post.save()

      await comment.populate('author', 'username avatar')

      res.status(201).json(comment)
    } catch (error) {
      res.status(500).json({ message: '服务器错误' })
    }
  }
)

// 删除帖子
router.delete('/:id', auth, async (req: any, res: express.Response) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ message: '帖子不存在' })
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '没有权限删除此帖子' })
    }

    await post.remove()
    res.json({ message: '帖子已删除' })
  } catch (error) {
    res.status(500).json({ message: '服务器错误' })
  }
})

export default router 