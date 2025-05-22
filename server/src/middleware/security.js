const security = (req, res, next) => {
  // 中间件逻辑
  next();
};
 
module.exports = security; 