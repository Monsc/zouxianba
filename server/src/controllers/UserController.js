const User = require('../models/User');
const AppError = require('../utils/AppError');
const { uploadToCloudflare } = require('../utils/cloudflare');

class UserController {
  // 获取用户资料
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.params.id)
        .select('-password -tokens -securityLogs')
        .populate('badges', 'type description grantedAt');

      if (!user) {
        throw new AppError(404, '用户不存在');
      }

      // 检查是否被屏蔽
      if (user.isBlocked(req.user._id)) {
        throw new AppError(403, '无法查看该用户资料');
      }

      res.json(user);
    } catch (error) {
      res.status(error.statusCode || 500).json({
        message: error.message
      });
    }
  }

  // 更新用户资料
  async updateProfile(req, res) {
    try {
      const updates = Object.keys(req.body);
      const allowedUpdates = [
        'username', 'name', 'bio', 'location', 'website',
        'privacy', 'notificationSettings'
      ];

      const isValidOperation = updates.every(update => 
        allowedUpdates.includes(update)
      );

      if (!isValidOperation) {
        throw new AppError(400, '无效的更新字段');
      }

      const user = await User.findById(req.user._id);
      updates.forEach(update => user[update] = req.body[update]);
      await user.save();

      res.json(user);
    } catch (error) {
      res.status(error.statusCode || 500).json({
        message: error.message
      });
    }
  }

  // 上传头像
  async uploadAvatar(req, res) {
    try {
      if (!req.file) {
        throw new AppError(400, '请选择要上传的图片');
      }

      const url = await uploadToCloudflare(req.file.buffer, 'avatar');
      const user = await User.findById(req.user._id);
      user.avatar = url;
      await user.save();

      res.json({ avatar: url });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        message: error.message
      });
    }
  }

  // 关联社交媒体账号
  async connectSocialAccount(req, res) {
    try {
      const { platform, accountData } = req.body;
      const user = await User.findById(req.user._id);
      
      await user.addSocialAccount(platform, accountData);
      res.json({ message: '社交媒体账号关联成功' });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        message: error.message
      });
    }
  }

  // 解除社交媒体账号关联
  async disconnectSocialAccount(req, res) {
    try {
      const { platform } = req.params;
      const user = await User.findById(req.user._id);
      
      await user.removeSocialAccount(platform);
      res.json({ message: '社交媒体账号解除关联成功' });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        message: error.message
      });
    }
  }

  // 屏蔽用户
  async blockUser(req, res) {
    try {
      const user = await User.findById(req.user._id);
      await user.blockUser(req.params.userId);
      res.json({ message: '用户已屏蔽' });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        message: error.message
      });
    }
  }

  // 取消屏蔽用户
  async unblockUser(req, res) {
    try {
      const user = await User.findById(req.user._id);
      await user.unblockUser(req.params.userId);
      res.json({ message: '已取消屏蔽用户' });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        message: error.message
      });
    }
  }

  // 获取屏蔽列表
  async getBlockedUsers(req, res) {
    try {
      const user = await User.findById(req.user._id)
        .populate('blockedUsers', 'username avatar');
      res.json(user.blockedUsers);
    } catch (error) {
      res.status(error.statusCode || 500).json({
        message: error.message
      });
    }
  }

  // 更新隐私设置
  async updatePrivacySettings(req, res) {
    try {
      const user = await User.findById(req.user._id);
      await user.updatePrivacySettings(req.body);
      res.json({ message: '隐私设置已更新' });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        message: error.message
      });
    }
  }

  // 更新通知设置
  async updateNotificationSettings(req, res) {
    try {
      const user = await User.findById(req.user._id);
      await user.updateNotificationSettings(req.body);
      res.json({ message: '通知设置已更新' });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        message: error.message
      });
    }
  }

  // 升级到高级用户
  async upgradeToPremium(req, res) {
    try {
      const { duration } = req.body;
      const user = await User.findById(req.user._id);
      await user.upgradeToPremium(duration);
      res.json({ message: '升级成功' });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        message: error.message
      });
    }
  }

  // 推荐用户（推特化体验）
  async getRecommendedUsers(req, res) {
    try {
      // TODO: 实现推荐算法，这里先返回空数组
      res.json([]);
    } catch (error) {
      res.status(error.statusCode || 500).json({
        message: error.message
      });
    }
  }
}

module.exports = new UserController(); 