const Post = require('../models/Post');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { sendNotification } = require('../utils/notification');

class PostController {
  // 创建帖子
  async createPost(req, res, next) {
    try {
      const { content, images, visibility, tags } = req.body;
      const post = await Post.create({
        author: req.user.id,
        content,
        images,
        visibility,
        hashtags: tags
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
              actor: req.user._id,
            })
          )
        );
      }

      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  }

  // 获取帖子详情
  async getPost(req, res, next) {
    try {
      const post = await Post.findById(req.params.id)
        .populate('author', 'username avatar')
        .populate('likes', 'username avatar')
        .populate('comments.author', 'username avatar')
        .populate('reposts.user', 'username avatar');

      if (!post) {
        throw new AppError(404, '帖子不存在');
      }

      // 增加浏览量
      post.viewCount += 1;
      await post.save();

      res.json(post);
    } catch (error) {
      next(error);
    }
  }

  // 编辑帖子
  async updatePost(req, res, next) {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        throw new AppError(404, '帖子不存在');
      }

      if (post.author.toString() !== req.user._id.toString()) {
        throw new AppError(403, '无权编辑此帖子');
      }

      const { content, images, visibility, tags } = req.body;
      
      // 保存编辑历史
      await post.addEditHistory(req.user._id, post.content);

      post.content = content;
      post.images = images;
      post.visibility = visibility;
      post.hashtags = tags;
      post.updatedAt = new Date();

      await post.save();
      res.json(post);
    } catch (error) {
      next(error);
    }
  }

  // 删除帖子
  async deletePost(req, res, next) {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        throw new AppError(404, '帖子不存在');
      }

      if (post.author.toString() !== req.user._id.toString()) {
        throw new AppError(403, '无权删除此帖子');
      }

      await post.remove();
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // 转发帖子
  async repost(req, res, next) {
    try {
      const { content } = req.body;
      const originalPost = await Post.findById(req.params.id);
      if (!originalPost) {
        throw new AppError(404, '原帖子不存在');
      }

      const repost = await Post.create({
        author: req.user._id,
        content,
        originalPost: originalPost._id,
        reposts: [{
          user: req.user._id,
          content,
          createdAt: new Date()
        }]
      });

      originalPost.repostCount += 1;
      await originalPost.save();

      // 发送通知
      await sendNotification({
        recipient: originalPost.author,
        type: 'repost',
        postId: originalPost._id,
        actor: req.user._id,
      });

      res.status(201).json(repost);
    } catch (error) {
      next(error);
    }
  }

  // 收藏/取消收藏帖子
  async toggleBookmark(req, res, next) {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        throw new AppError(404, '帖子不存在');
      }

      await post.toggleBookmark(req.user._id);
      res.json({
        isBookmarked: post.bookmarks.includes(req.user._id),
        bookmarkCount: post.bookmarkCount
      });
    } catch (error) {
      next(error);
    }
  }

  // 举报帖子
  async reportPost(req, res, next) {
    try {
      const { reason } = req.body;
      const post = await Post.findById(req.params.id);
      if (!post) {
        throw new AppError(404, '帖子不存在');
      }

      await post.addReport(req.user._id, reason);
      res.json({
        message: '举报成功',
        reportCount: post.reportCount
      });
    } catch (error) {
      next(error);
    }
  }

  // 置顶/取消置顶帖子
  async togglePin(req, res, next) {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        throw new AppError(404, '帖子不存在');
      }

      if (post.author.toString() !== req.user._id.toString()) {
        throw new AppError(403, '无权置顶此帖子');
      }

      await post.togglePin();
      res.json({
        isPinned: post.isPinned,
        pinnedAt: post.pinnedAt
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取帖子编辑历史
  async getEditHistory(req, res, next) {
    try {
      const post = await Post.findById(req.params.id)
        .populate('editHistory.editedBy', 'username avatar');
      if (!post) {
        throw new AppError(404, '帖子不存在');
      }

      res.json(post.editHistory);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PostController(); 