/**
 * 异步错误处理包装器
 * 用于统一处理异步函数中的错误
 * @param {Function} fn - 异步函数
 * @returns {Function} 包装后的函数
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = { catchAsync }; 