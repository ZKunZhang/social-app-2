const express = require('express');
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/users/search?q=keyword
 * 搜索用户
 */
router.get('/search', authenticate, userController.searchUsers);

/**
 * GET /api/users/:username
 * 获取用户信息
 */
router.get('/:username', optionalAuthenticate, userController.getUserProfile);

/**
 * GET /api/users/:username/posts
 * 获取指定用户的帖子列表（需互关）
 */
router.get('/:username/posts', authenticate, postController.getUserPosts);

/**
 * POST /api/users/:username/follow
 * 关注用户
 */
router.post('/:username/follow', authenticate, userController.followUser);

/**
 * DELETE /api/users/:username/follow
 * 取消关注
 */
router.delete('/:username/follow', authenticate, userController.unfollowUser);

/**
 * GET /api/users/me/mutual-follows
 * 获取互关好友列表
 */
router.get('/me/mutual-follows', authenticate, userController.getMutualFollows);

module.exports = router;
