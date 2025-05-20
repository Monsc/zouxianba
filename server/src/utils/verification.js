const crypto = require('crypto');
const redis = require('../services/redis');

// 生成6位数字验证码
exports.generateVerificationCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// 存储验证码
exports.storeVerificationCode = async (email, code) => {
  const key = `verification:${email}`;
  await redis.set(key, code, 'EX', 600); // 10分钟过期
};

// 验证验证码
exports.verifyCode = async (email, code) => {
  const key = `verification:${email}`;
  const storedCode = await redis.get(key);
  
  if (!storedCode) {
    return false;
  }

  if (storedCode === code) {
    await redis.del(key); // 验证成功后删除验证码
    return true;
  }

  return false;
};

// 检查验证码发送频率
exports.checkVerificationRate = async (email) => {
  const key = `verification:rate:${email}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, 3600); // 1小时内
  }

  return count <= 5; // 每小时最多发送5次
}; 