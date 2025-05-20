const { 
  MAX_LOGIN_ATTEMPTS,
  LOCKOUT_DURATION
} = process.env;

const User = require('../models/User');

// 账号锁定中间件
const accountLock = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return next();
    }

    // 检查账号是否被锁定
    if (user.isLocked) {
      const lockExpires = new Date(user.lockExpires);
      if (lockExpires > new Date()) {
        const minutesLeft = Math.ceil((lockExpires - new Date()) / 1000 / 60);
        return res.status(403).json({
          error: 'Account locked',
          message: `账号已被锁定，请 ${minutesLeft} 分钟后再试`
        });
      } else {
        // 锁定已过期，重置锁定状态
        user.isLocked = false;
        user.loginAttempts = 0;
        user.lockExpires = undefined;
        await user.save();
      }
    }

    // 检查登录尝试次数
    if (user.loginAttempts >= parseInt(MAX_LOGIN_ATTEMPTS)) {
      user.isLocked = true;
      user.lockExpires = new Date(Date.now() + parseInt(LOCKOUT_DURATION) * 60 * 1000);
      await user.save();

      return res.status(403).json({
        error: 'Account locked',
        message: `登录失败次数过多，账号已被锁定 ${LOCKOUT_DURATION} 分钟`
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// 更新登录尝试次数
const updateLoginAttempts = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return next();
    }

    if (res.locals.loginSuccess) {
      // 登录成功，重置尝试次数
      user.loginAttempts = 0;
      user.isLocked = false;
      user.lockExpires = undefined;
    } else {
      // 登录失败，增加尝试次数
      user.loginAttempts += 1;
    }

    await user.save();
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  accountLock,
  updateLoginAttempts
}; 