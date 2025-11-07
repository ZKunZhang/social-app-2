/**
 * 全局错误处理中间件
 */
function errorHandler(err, req, res, next) {
  console.error('❌ 错误:', err);

  // 数据库错误
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({
      error: 'Bad Request',
      message: '违反数据库约束条件',
      details: err.message,
    });
  }

  // 验证错误（express-validator）
  if (err.type === 'validation') {
    return res.status(400).json({
      error: 'Validation Error',
      message: '请求参数验证失败',
      details: err.errors,
    });
  }

  // 默认服务器错误
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || '服务器内部错误',
  });
}

/**
 * 404 处理中间件
 */
function notFound(req, res) {
  res.status(404).json({
    error: 'Not Found',
    message: `路由 ${req.method} ${req.path} 不存在`,
  });
}

module.exports = {
  errorHandler,
  notFound,
};
