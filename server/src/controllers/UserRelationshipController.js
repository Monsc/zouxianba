const UserRelationship = require('../models/UserRelationship');
const User = require('../models/User');
const { AppError } = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

class UserRelationshipController {
  // 获取用户关系
  getRelationships = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { type, limit = 20 } = req.query;

    const relationships = await UserRelationship.getUserRelationships(
      userId,
      type,
      parseInt(limit)
    );

    res.status(200).json({
      status: 'success',
      data: { relationships }
    });
  });

  // 获取共同好友
  getMutualConnections = catchAsync(async (req, res) => {
    const { userId1, userId2 } = req.params;

    const mutualConnections = await UserRelationship.getMutualConnections(
      userId1,
      userId2
    );

    res.status(200).json({
      status: 'success',
      data: { mutualConnections }
    });
  });

  // 获取关系强度
  getRelationshipStrength = catchAsync(async (req, res) => {
    const { userId1, userId2 } = req.params;

    const strength = await UserRelationship.getRelationshipStrength(
      userId1,
      userId2
    );

    res.status(200).json({
      status: 'success',
      data: { strength }
    });
  });

  // 创建关系
  createRelationship = catchAsync(async (req, res) => {
    const { relatedUserId, type, metadata } = req.body;
    const userId = req.user._id;

    // 检查用户是否存在
    const relatedUser = await User.findById(relatedUserId);
    if (!relatedUser) {
      throw new AppError('用户不存在', 404);
    }

    // 检查是否已存在关系
    let relationship = await UserRelationship.findOne({
      user: userId,
      relatedUser: relatedUserId,
      type
    });

    if (relationship) {
      throw new AppError('关系已存在', 400);
    }

    // 创建关系
    relationship = await UserRelationship.create({
      user: userId,
      relatedUser: relatedUserId,
      type,
      metadata
    });

    res.status(201).json({
      status: 'success',
      data: { relationship }
    });
  });

  // 更新关系权重
  updateRelationshipWeight = catchAsync(async (req, res) => {
    const { relationshipId } = req.params;
    const { action, amount = 1 } = req.body;
    const userId = req.user._id;

    const relationship = await UserRelationship.findById(relationshipId);
    if (!relationship) {
      throw new AppError('关系不存在', 404);
    }

    // 检查权限
    if (relationship.user.toString() !== userId.toString()) {
      throw new AppError('无权操作此关系', 403);
    }

    // 更新权重
    if (action === 'increase') {
      await relationship.increaseWeight(amount);
    } else if (action === 'decrease') {
      await relationship.decreaseWeight(amount);
    } else {
      throw new AppError('无效的操作', 400);
    }

    res.status(200).json({
      status: 'success',
      data: { relationship }
    });
  });

  // 删除关系
  deleteRelationship = catchAsync(async (req, res) => {
    const { relationshipId } = req.params;
    const userId = req.user._id;

    const relationship = await UserRelationship.findById(relationshipId);
    if (!relationship) {
      throw new AppError('关系不存在', 404);
    }

    // 检查权限
    if (relationship.user.toString() !== userId.toString()) {
      throw new AppError('无权操作此关系', 403);
    }

    await relationship.remove();

    res.status(200).json({
      status: 'success',
      data: null
    });
  });

  // 获取用户关系图谱
  getUserGraph = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { depth = 2, limit = 50 } = req.query;

    const graph = {
      nodes: [],
      edges: []
    };

    // 获取用户信息
    const user = await User.findById(userId)
      .select('username avatar');
    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    // 添加中心节点
    graph.nodes.push({
      id: user._id.toString(),
      username: user.username,
      avatar: user.avatar,
      level: 0
    });

    // 递归获取关系
    await this._buildGraph(userId, graph, 0, parseInt(depth), parseInt(limit));

    res.status(200).json({
      status: 'success',
      data: { graph }
    });
  });

  // 构建关系图谱
  _buildGraph = async (userId, graph, currentDepth, maxDepth, limit) => {
    if (currentDepth >= maxDepth) return;

    // 获取用户关系
    const relationships = await UserRelationship.find({ user: userId })
      .populate('relatedUser', 'username avatar')
      .limit(limit);

    for (const rel of relationships) {
      const relatedUserId = rel.relatedUser._id.toString();

      // 添加节点
      if (!graph.nodes.some(node => node.id === relatedUserId)) {
        graph.nodes.push({
          id: relatedUserId,
          username: rel.relatedUser.username,
          avatar: rel.relatedUser.avatar,
          level: currentDepth + 1
        });
      }

      // 添加边
      graph.edges.push({
        source: userId,
        target: relatedUserId,
        type: rel.type,
        weight: rel.weight
      });

      // 递归获取下一层关系
      if (currentDepth < maxDepth - 1) {
        await this._buildGraph(relatedUserId, graph, currentDepth + 1, maxDepth, limit);
      }
    }
  };
}

module.exports = new UserRelationshipController(); 