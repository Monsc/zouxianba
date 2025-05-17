import express, { Router } from 'express';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { auth } from '../middleware/auth';
import { Request, Response, UserDocument } from '../types/express';
import { catchAsync } from '../utils/catchAsync';

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
        users: users.map(user => ({
          id: user._id,
          username: user.username,
          handle: user.handle,
          avatar: user.avatar,
          isVerified: user.isVerified
        }))
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
        posts: posts.map(post => ({
          id: post._id,
          content: post.content,
          user: {
            id: post.author._id,
            username: post.author.username,
            handle: post.author.handle,
            avatar: post.author.avatar,
          },
          createdAt: post.createdAt,
          likes: post.likes.length,
          comments: post.comments.length,
        }))
      });

    default:
      const results = [];
      const dateRange = getDateRange(req.query.time as string);

      // Search users
      if (type === 'all' || type === 'users') {
        const users = await User.find({
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { handle: { $regex: q, $options: 'i' } },
          ],
        })
          .select('username handle avatar')
          .limit(10);

        results.push(
          ...users.map(user => ({
            id: user._id,
            type: 'user',
            user: {
              id: user._id,
              username: user.username,
              handle: user.handle,
    // Sort results by relevance (you can implement more sophisticated ranking)
    if (sort === 'relevance') {
      results.sort((a, b) => {
        if (a.type === 'user' && b.type === 'post') return -1;
        if (a.type === 'post' && b.type === 'user') return 1;
        return 0;
      });
    }

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

export default router; 