const express = require('express');
const feedController = require('../controllers/feedController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/feed
 * 获取当前用户的 Feed 流（互关用户的帖子）
 */
router.get('/', authenticate, feedController.getFeed);

module.exports = router;
