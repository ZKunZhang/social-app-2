const { validationResult } = require('express-validator');

/**
 * 验证结果处理中间件
 * 用于检查 express-validator 的验证结果
 */
function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: '请求参数验证失败',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value,
      })),
    });
  }

  next();
}

module.exports = { validate };
