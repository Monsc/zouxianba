import express from 'express';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { Request, Response } from 'express';
import { catchAsync } from '../middleware/errorHandler';

const router = express.Router();

// Helper function to get date range for time filter
const getDateRange = (timeFilter: string) => {
  const now = new Date();
  switch (timeFilter) {
    case 'day':
      return new Date(now.setDate(now.getDate() - 1));
    case 'week':
      return new Date(now.setDate(now.getDate() - 7));
    case 'month':
      return new Date(now.setMonth(now.getMonth() - 1));
    case 'year':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    default:
      return new Date(0); // Beginning of time
  }
};

// Search users and posts
router.get('/', catchAsync(async (req: Request, res: Response) => {
  const { q, type } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  if (!q) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  const skip = (page - 1) * limit;

  switch (type) {
    case 'users':
      const users = await User.find({
        $or: [
          { username: { $regex: q, $options: 'i' } },
          { handle: { $regex: q, $options: 'i' } }
        ]
      })
        .select('username handle avatar isVerified')
        .skip(skip)
        .limit(limit);

      return res.json({
        users: users.map(user => {
          // user 可能是 Document 或 ObjectId，需断言
          const u = user as any;
          return {
            id: u._id,
            username: u.username,
            handle: u.handle,
            avatar: u.avatar,
            isVerified: u.isVerified
          };
        })
      });

    case 'posts':
      const postQuery: any = {
        content: { $regex: q, $options: 'i' },
        createdAt: { $gte: getDateRange('all') },
      };

      let sortOptions: any = {};
      switch (req.query.sort) {
        case 'recent':
          sortOptions = { createdAt: -1 };
          break;
        case 'popular':
          sortOptions = { likes: -1, comments: -1 };
          break;
        default:
          // For relevance, we'll use text score if available
          postQuery.$text = { $search: q };
          sortOptions = { score: { $meta: 'textScore' } };
      }

      const posts = await Post.find(postQuery)
        .populate('author', 'username handle avatar')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

      return res.json({
        posts: posts.map(post => {
          const author = post.author as any;
          return {
            id: post._id,
            content: post.content,
            user: {
              id: author._id,
              username: author.username,
              handle: author.handle,
              avatar: author.avatar,
            },
            createdAt: post.createdAt,
            likes: post.likes.length,
            comments: post.comments.length,
          };
        })
      });

    default:
      // 目前只实现 users/posts 类型，default 返回 400
      return res.status(400).json({ message: 'Invalid search type' });
  }
}));

export default router; 