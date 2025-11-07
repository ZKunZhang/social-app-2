const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * JWT 认证中间件
 * 验证请求头中的 Bearer Token
 */
function authenticate(req, res, next) {
  try {
    // 从请求头获取 token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: '未提供认证令牌',
      });
    }

    const token = authHeader.substring(7); // 移除 "Bearer " 前缀

    // 验证 token
    const decoded = jwt.verify(token, config.jwt.secret);

    // 将用户信息附加到请求对象
    req.user = {
      id: decoded.id,
      username: decoded.username,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: '无效的认证令牌',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: '认证令牌已过期',
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: '认证过程发生错误',
    });
  }
}

/**
 * 可选认证中间件
 * 如果有 token 则验证，没有则继续（用于某些公开但可能需要用户信息的接口）
 */
function optionalAuthenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret);

    req.user = {
      id: decoded.id,
      username: decoded.username,
    };

    next();
  } catch (error) {
    // 即使 token 无效，也继续处理请求（作为未认证用户）
    next();
  }
}

module.exports = {
  authenticate,
  optionalAuthenticate,
};
