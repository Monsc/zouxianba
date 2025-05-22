const User = require('../models/User');
const Post = require('../models/Post');
const Tag = require('../models/Tag');
const { AppError } = require('../middleware/errorHandler');

class SearchController {
  // 综合搜索
  async search(req, res, next) {
    try {
      const { q: query, type = 'all', page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      let results = {
        users: [],
        posts: [],
        tags: []
      };

      // 根据类型执行搜索
      if (type === 'all' || type === 'users') {
        results.users = await this.searchUsers(query, skip, limit);
      }

      if (type === 'all' || type === 'posts') {
        results.posts = await this.searchPosts(query, skip, limit);
      }

      if (type === 'all' || type === 'tags') {
        results.tags = await this.searchTags(query, skip, limit);
      }

      res.json(results);
    } catch (error) {
      next(error);
    }
  }

  // 搜索用户
  async searchUsers(query, skip = 0, limit = 20) {
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } }
      ]
    })
      .select('username avatar bio followers following')
      .skip(skip)
      .limit(limit);

    return users.map(user => ({
      id: user._id,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      followersCount: user.followers.length,
      followingCount: user.following.length
    }));
  }

  // 搜索帖子
  async searchPosts(query, skip = 0, limit = 20) {
    const posts = await Post.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .populate('author', 'username avatar')
      .skip(skip)
      .limit(limit);

    return posts.map(post => ({
      id: post._id,
      content: post.content,
      images: post.images,
      author: {
        id: post.author._id,
        username: post.author.username,
        avatar: post.author.avatar
      },
      likes: post.likes.length,
      comments: post.comments.length,
      createdAt: post.createdAt
    }));
  }

  // 搜索话题
  async searchTags(query, skip = 0, limit = 20) {
    const tags = await Tag.find({
      name: { $regex: query, $options: 'i' }
    })
      .sort({ count: -1 })
      .skip(skip)
      .limit(limit);

    return tags.map(tag => ({
      id: tag._id,
      name: tag.name,
      count: tag.count
    }));
  }

  // 获取搜索建议
  async getSuggestions(req, res, next) {
    try {
      const { q: query, type = 'all' } = req.query;
      const limit = 5;

      let suggestions = {
        users: [],
        posts: [],
        tags: []
      };

      // 根据类型获取建议
      if (type === 'all' || type === 'users') {
        suggestions.users = await this.searchUsers(query, 0, limit);
      }

      if (type === 'all' || type === 'posts') {
        suggestions.posts = await this.searchPosts(query, 0, limit);
      }

      if (type === 'all' || type === 'tags') {
        suggestions.tags = await this.searchTags(query, 0, limit);
      }

      res.json(suggestions);
    } catch (error) {
      next(error);
    }
  }

  // 获取热门搜索
  async getTrending(req, res, next) {
    try {
      const limit = 10;

      // 获取热门话题
      const trendingTags = await Tag.find()
        .sort({ count: -1 })
        .limit(limit);

      // 获取热门用户
      const trendingUsers = await User.find()
        .sort({ followers: -1 })
        .limit(limit)
        .select('username avatar followers');

      res.json({
        tags: trendingTags.map(tag => ({
          id: tag._id,
          name: tag.name,
          count: tag.count
        })),
        users: trendingUsers.map(user => ({
          id: user._id,
          username: user.username,
          avatar: user.avatar,
          followersCount: user.followers.length
        }))
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SearchController(); 