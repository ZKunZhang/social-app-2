const express = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./users');
const postRoutes = require('./posts');
const feedRoutes = require('./feed');

const router = express.Router();

// 挂载各个路由模块
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/feed', feedRoutes);

// API 健康检查
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '私密圈 API 正常运行',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
