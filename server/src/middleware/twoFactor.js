const { TWO_FACTOR_ENABLED } = process.env;
const User = require('../models/User');

// 检查是否需要双因素认证
const requireTwoFactor = async (req, res, next) => {
  if (TWO_FACTOR_ENABLED !== 'true') {
    return next();
  }

  const user = await User.findById(req.user.id);
  if (!user.twoFactorEnabled) {
    return next();
  }

  // 如果已经验证过双因素认证，直接通过
  if (req.session.twoFactorVerified) {
    return next();
  }

  // 返回需要双因素认证的响应
  return res.status(403).json({
    error: 'Two-factor authentication required',
    message: '需要双因素认证',
    requiresTwoFactor: true
  });
};

// 验证双因素认证码
const verifyTwoFactor = async (req, res, next) => {
  const { token, backupCode } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      error: 'User not found',
      message: '用户不存在'
    });
  }

  let isValid = false;

  // 尝试使用备用码
  if (backupCode) {
    isValid = await user.verifyBackupCode(backupCode);
  } else if (token) {
    // 验证 TOTP 码
    isValid = user.verifyTwoFactorToken(token);
  }

  if (!isValid) {
    return res.status(401).json({
      error: 'Invalid two-factor code',
      message: '无效的双因素认证码'
    });
  }

  // 标记为已验证
  req.session.twoFactorVerified = true;
  next();
};

// 启用双因素认证
const enableTwoFactor = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const { secret, token } = req.body;

    // 验证提供的 token
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token
    });

    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid token',
        message: '无效的验证码'
      });
    }

    // 启用双因素认证
    user.twoFactorEnabled = true;
    user.twoFactorSecret = secret;
    await user.save();

    res.json({
      message: '双因素认证已启用',
      backupCodes: user.twoFactorBackupCodes
    });
  } catch (error) {
    next(error);
  }
};

// 禁用双因素认证
const disableTwoFactor = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const { token } = req.body;

    // 验证提供的 token
    const isValid = user.verifyTwoFactorToken(token);

    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid token',
        message: '无效的验证码'
      });
    }

    // 禁用双因素认证
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorBackupCodes = [];
    await user.save();

    res.json({
      message: '双因素认证已禁用'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requireTwoFactor,
  verifyTwoFactor,
  enableTwoFactor,
  disableTwoFactor
}; 