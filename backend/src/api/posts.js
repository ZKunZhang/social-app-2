const express = require('express');
const { body } = require('express-validator');
const postController = require('../controllers/postController');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

/**
 * POST /api/posts
 * 创建新帖子
 */
router.post(
  '/',
  authenticate,
  [
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('标题长度必须在 1-200 个字符之间'),
    body('content')
      .trim()
      .isLength({ min: 1, max: 10000 })
      .withMessage('内容长度必须在 1-10000 个字符之间'),
  ],
  validate,
  postController.createPost
);

/**
 * GET /api/posts/:id
 * 获取帖子详情
 */
router.get('/:id', optionalAuthenticate, postController.getPostById);

/**
 * DELETE /api/posts/:id
 * 删除帖子
 */
router.delete('/:id', authenticate, postController.deletePost);

/**
 * GET /api/posts/me/posts
 * 获取我的帖子列表
 */
router.get('/me/posts', authenticate, postController.getMyPosts);

module.exports = router;
