const bcrypt = require('bcryptjs');
const { AppError } = require('./AppError');

/**
 * 加密密码
 * @param {string} password - 原始密码
 * @returns {Promise<string>} 加密后的密码
 */
const hash = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new AppError('密码加密失败', 500);
  }
};

/**
 * 验证密码
 * @param {string} password - 原始密码
 * @param {string} hashedPassword - 加密后的密码
 * @returns {Promise<boolean>} 密码是否匹配
 */
const compare = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new AppError('密码验证失败', 500);
  }
};

module.exports = {
  hash,
  compare
}; 