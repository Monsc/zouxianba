/**
 * 异步错误处理包装器
 * 用于统一处理异步路由处理函数中的错误
 * 
 * @param {Function} fn - 异步路由处理函数
 * @returns {Function} 包装后的中间件函数
 */
module.exports = function (fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
}; 