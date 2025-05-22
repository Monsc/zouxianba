const UserTag = require('../models/UserTag');
const User = require('../models/User');
const { AppError } = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

class UserTagController {
  // 创建标签
  createTag = catchAsync(async (req, res) => {
    const { name, description, category } = req.body;
    const userId = req.user._id;

    // 检查标签是否已存在
    let tag = await UserTag.findOne({ name });
    if (tag) {
      throw new AppError('标签已存在', 400);
    }

    // 创建新标签
    tag = await UserTag.create({
      name,
      description,
      category,
      createdBy: userId
    });

    // 将创建者添加为标签用户
    await tag.addUser(userId);

    res.status(201).json({
      status: 'success',
      data: { tag }
    });
  });

  // 获取标签列表
  getTags = catchAsync(async (req, res) => {
    const { category, page = 1, limit = 20 } = req.query;
    const query = category ? { category } : {};

    const tags = await UserTag.find(query)
      .sort({ count: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'username avatar');

    const total = await UserTag.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        tags,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  });

  // 获取热门标签
  getPopularTags = catchAsync(async (req, res) => {
    const { limit = 10 } = req.query;
    const tags = await UserTag.getPopularTags(parseInt(limit));

    res.status(200).json({
      status: 'success',
      data: { tags }
    });
  });

  // 获取用户标签
  getUserTags = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const tags = await UserTag.find({ users: userId })
      .sort({ count: -1 });

    res.status(200).json({
      status: 'success',
      data: { tags }
    });
  });

  // 添加用户标签
  addUserTag = catchAsync(async (req, res) => {
    const { tagId } = req.params;
    const userId = req.user._id;

    const tag = await UserTag.findById(tagId);
    if (!tag) {
      throw new AppError('标签不存在', 404);
    }

    await tag.addUser(userId);

    res.status(200).json({
      status: 'success',
      data: { tag }
    });
  });

  // 移除用户标签
  removeUserTag = catchAsync(async (req, res) => {
    const { tagId } = req.params;
    const userId = req.user._id;

    const tag = await UserTag.findById(tagId);
    if (!tag) {
      throw new AppError('标签不存在', 404);
    }

    await tag.removeUser(userId);

    res.status(200).json({
      status: 'success',
      data: { tag }
    });
  });

  // 搜索标签
  searchTags = catchAsync(async (req, res) => {
    const { q: query, limit = 10 } = req.query;

    const tags = await UserTag.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit));

    res.status(200).json({
      status: 'success',
      data: { tags }
    });
  });

  // 验证标签
  verifyTag = catchAsync(async (req, res) => {
    const { tagId } = req.params;

    const tag = await UserTag.findById(tagId);
    if (!tag) {
      throw new AppError('标签不存在', 404);
    }

    tag.isVerified = true;
    await tag.save();

    res.status(200).json({
      status: 'success',
      data: { tag }
    });
  });

  // 获取标签用户
  getTagUsers = catchAsync(async (req, res) => {
    const { tagId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const tag = await UserTag.findById(tagId)
      .populate({
        path: 'users',
        select: 'username avatar bio',
        options: {
          skip: (page - 1) * limit,
          limit: parseInt(limit)
        }
      });

    if (!tag) {
      throw new AppError('标签不存在', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        users: tag.users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: tag.count,
          pages: Math.ceil(tag.count / limit)
        }
      }
    });
  });
}

module.exports = new UserTagController(); 