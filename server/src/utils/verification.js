const crypto = require('crypto');
const redis = require('../services/redis');
const { AppError } = require('./AppError');

/**
 * 生成6位数字验证码
 * @returns {string} 验证码
 */
const generateVerificationCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * 存储验证码到 Redis
 * @param {string} email - 邮箱
 * @param {string} code - 验证码
 * @param {number} [expiresIn=300] - 过期时间（秒）
 */
const storeVerificationCode = async (email, code, expiresIn = 300) => {
  try {
    const key = `verification:${email}`;
    await redis.set(key, code, 'EX', expiresIn);
  } catch (error) {
    throw new AppError('验证码存储失败', 500);
  }
};

/**
 * 验证验证码
 * @param {string} email - 邮箱
 * @param {string} code - 验证码
 * @returns {Promise<boolean>} 验证码是否有效
 */
const verifyCode = async (email, code) => {
  try {
    const key = `verification:${email}`;
    const storedCode = await redis.get(key);
    
    if (!storedCode) {
      return false;
    }

    const isValid = storedCode === code;
    if (isValid) {
      await redis.del(key);
    }

    return isValid;
  } catch (error) {
    throw new AppError('验证码验证失败', 500);
  }
};

// 检查验证码发送频率
const checkVerificationRate = async (email) => {
  const key = `verification:rate:${email}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, 3600); // 1小时内
  }

  return count <= 5; // 每小时最多发送5次
};

module.exports = {
  generateVerificationCode,
  storeVerificationCode,
  verifyCode,
  checkVerificationRate
}; 