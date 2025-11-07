const authService = require('../services/authService');

/**
 * 用户注册
 */
async function register(req, res, next) {
  try {
    const { username, password } = req.body;

    const user = authService.register(username, password);

    res.status(201).json({
      message: '注册成功',
      user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 用户登录
 */
async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    const result = authService.login(username, password);

    res.json({
      message: '登录成功',
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
};
