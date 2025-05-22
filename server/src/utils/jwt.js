const jwt = require('jsonwebtoken');
const config = require('../config');
const { AppError } = require('./AppError');

/**
 * 生成 JWT token
 * @param {Object} payload - token 载荷
 * @param {string} [expiresIn] - 过期时间
 * @returns {string} JWT token
 */
const generateToken = (payload, expiresIn = config.jwt.expiresIn) => {
  try {
    return jwt.sign(payload, config.jwt.secret, { expiresIn });
  } catch (error) {
    throw new AppError('Token 生成失败', 500);
  }
};

/**
 * 验证 JWT token
 * @param {string} token - JWT token
 * @returns {Object} 解码后的 token 载荷
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token 已过期', 401);
    }
    throw new AppError('无效的 Token', 401);
  }
};

module.exports = {
  generateToken,
  verifyToken
}; 