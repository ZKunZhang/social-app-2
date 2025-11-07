const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validator');

const router = express.Router();

/**
 * POST /api/auth/register
 * 用户注册
 */
router.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('用户名长度必须在 3-30 个字符之间')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('用户名只能包含字母、数字和下划线'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('密码长度至少为 6 个字符'),
  ],
  validate,
  authController.register
);

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空'),
  ],
  validate,
  authController.login
);

module.exports = router;
