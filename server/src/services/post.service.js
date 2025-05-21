const Post = require('../models/post.model');
const User = require('../models/user.model');
const { AppError } = require('../middlewares/errorHandler');
const redis = require('../core/redis');
const { sendNotification } = require('../utils/notification');

class PostService {
  // 创建帖子
  async createPost(userId, postData) {
    const { content, images, visibility, tags, location } = postData;

    const post = await Post.create({
      author: userId,
      content,
      images,
      visibility,
      tags,
      location,
    });

    // 处理提及的用户
    if (post.mentions && post.mentions.length > 0) {
      const mentionedUsers = await User.find({
        _id: { $in: post.mentions }
      });

      // 发送通知
      await Promise.all(
        mentionedUsers.map(user =>
          sendNotification({
            recipient: user._id,
            type: 'mention',
            postId: post._id,
            actor: userId,
          })
        )
      );
    }

    return this.getPostDetails(post);
  }

  // 获取帖子详情
  async getPostDetails(post) {
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username avatar')
      .populate('likes', 'username avatar')
      .populate('comments.author', 'username avatar');

    return {
      id: populatedPost._id,
      content: populatedPost.content,
      images: populatedPost.images,
      author: {
        id: populatedPost.author._id,
        username: populatedPost.author.username,
        avatar: populatedPost.author.avatar,
      },
      likes: populatedPost.likes.map(user => ({
        id: user._id,
        username: user.username,
        avatar: user.avatar,
      })),
      comments: populatedPost.comments.map(comment => ({
        id: comment._id,
        content: comment.content,
        author: {
          id: comment.author._id,
          username: comment.author.username,
          avatar: comment.author.avatar,
        },
        likes: comment.likes,
        createdAt: comment.createdAt,
      })),
      tags: populatedPost.tags,
      visibility: populatedPost.visibility,
      viewCount: populatedPost.viewCount,
      shareCount: populatedPost.shareCount,
      createdAt: populatedPost.createdAt,
      updatedAt: populatedPost.updatedAt,
    };
  }

  // 获取帖子列表
  async getPosts(query = {}, page = 1, limit = 20) {
    const posts = await Post.find(query)
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return Promise.all(posts.map(post => this.getPostDetails(post)));
  }

  // 获取用户时间线
  async getUserTimeline(userId, page = 1, limit = 20) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(404, '用户不存在');
    }

    const followingIds = [...user.following, userId];
    const posts = await Post.find({
      author: { $in: followingIds },
      visibility: { $in: ['public', 'followers'] },
    })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return Promise.all(posts.map(post => this.getPostDetails(post)));
  }

  // 更新帖子
  async updatePost(postId, userId, updateData) {
    const post = await Post.findOne({ _id: postId, author: userId });
    if (!post) {
      throw new AppError(404, '帖子不存在或无权修改');
    }

    const allowedUpdates = ['content', 'images', 'visibility', 'tags'];
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        post[key] = updateData[key];
      }
    });

    await post.save();
    return this.getPostDetails(post);
  }

  // 删除帖子
  async deletePost(postId, userId) {
    const post = await Post.findOne({ _id: postId, author: userId });
    if (!post) {
      throw new AppError(404, '帖子不存在或无权删除');
    }

    post.status = 'deleted';
    await post.save();
    return { message: '帖子已删除' };
  }

  // 点赞/取消点赞
  async toggleLike(postId, userId) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError(404, '帖子不存在');
    }

    await post.toggleLike(userId);

    // 发送通知
    if (post.likes.includes(userId)) {
      await sendNotification({
        recipient: post.author,
        type: 'like',
        postId: post._id,
        actor: userId,
      });
    }

    return {
      likes: post.likes,
      likeCount: post.likes.length,
    };
  }

  // 添加评论
  async addComment(postId, userId, content) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError(404, '帖子不存在');
    }

    const comment = {
      author: userId,
      content,
    };

    await post.addComment(comment);

    // 发送通知
    await sendNotification({
      recipient: post.author,
      type: 'comment',
      postId: post._id,
      actor: userId,
    });

    return this.getPostDetails(post);
  }

  // 删除评论
  async deleteComment(postId, commentId, userId) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError(404, '帖子不存在');
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      throw new AppError(404, '评论不存在');
    }

    if (comment.author.toString() !== userId.toString()) {
      throw new AppError(403, '无权删除此评论');
    }

    await post.removeComment(commentId);
    return this.getPostDetails(post);
  }

  // 搜索帖子
  async searchPosts(query, page = 1, limit = 20) {
    const posts = await Post.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .populate('author', 'username avatar')
      .skip((page - 1) * limit)
      .limit(limit);

    return Promise.all(posts.map(post => this.getPostDetails(post)));
  }

  // 获取热门帖子
  async getHotPosts(page = 1, limit = 20) {
    const posts = await Post.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    })
      .populate('author', 'username avatar')
      .sort({
        $expr: {
          $add: [
            { $size: '$likes' },
            { $multiply: [{ $size: '$comments' }, 2] },
            '$viewCount',
          ],
        },
      })
      .skip((page - 1) * limit)
      .limit(limit);

    return Promise.all(posts.map(post => this.getPostDetails(post)));
  }
}

module.exports = new PostService(); 