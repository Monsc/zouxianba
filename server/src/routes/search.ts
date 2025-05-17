import express from 'express';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { auth } from '../middleware/auth';

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
router.get('/', auth, async (req, res) => {
  try {
    const { q, type = 'all', sort = 'relevance', time = 'all' } = req.query;
    const query = q as string;

    if (!query) {
      return res.json([]);
    }

    const results = [];
    const dateRange = getDateRange(time as string);

    // Search users
    if (type === 'all' || type === 'users') {
      const users = await User.find({
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { handle: { $regex: query, $options: 'i' } },
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
            avatar: user.avatar,
          },
        }))
      );
    }

    // Search posts
    if (type === 'all' || type === 'posts') {
      const postQuery: any = {
        content: { $regex: query, $options: 'i' },
        createdAt: { $gte: dateRange },
      };

      let sortOptions: any = {};
      switch (sort) {
        case 'recent':
          sortOptions = { createdAt: -1 };
          break;
        case 'popular':
          sortOptions = { likes: -1, comments: -1 };
          break;
        default:
          // For relevance, we'll use text score if available
          postQuery.$text = { $search: query };
          sortOptions = { score: { $meta: 'textScore' } };
      }

      const posts = await Post.find(postQuery)
        .populate('author', 'username handle avatar')
        .sort(sortOptions)
        .limit(10);

      results.push(
        ...posts.map(post => ({
          id: post._id,
          type: 'post',
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
      );
    }

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