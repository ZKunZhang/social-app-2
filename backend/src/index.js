const express = require('express');
const cors = require('cors');
const config = require('./config');
const apiRoutes = require('./api');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { initDB, extendDatabase, closeDatabase } = require('./db/connection');

const app = express();

// ==================== 中间件配置 ====================

// CORS 配置
app.use(cors({
  origin: function (origin, callback) {
    // 允许没有 origin 的请求（如移动应用或 Postman）
    if (!origin) return callback(null, true);

    if (config.cors.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: Origin not allowed'));
    }
  },
  credentials: true,
}));

// Body 解析
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志（仅开发环境）
if (config.server.env === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ==================== 路由 ====================

// API 路由
app.use('/api', apiRoutes);

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: '私密圈 API',
    version: '1.0.0',
    description: '基于相互关注的私密论坛系统',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      posts: '/api/posts',
      feed: '/api/feed',
    },
  });
});

// ==================== 错误处理 ====================

// 404 处理
app.use(notFound);

// 全局错误处理
app.use(errorHandler);

// ==================== 启动服务器 ====================

const PORT = config.server.port;

async function startServer() {
  try {
    // 初始化数据库
    console.log('📦 正在初始化数据库...');
    const db = await initDB();
    extendDatabase(db);
    console.log('✅ 数据库初始化成功\n');

    // 启动服务器
    app.listen(PORT, () => {
      console.log('\n========================================');
      console.log('🚀 私密圈 API 服务已启动');
      console.log(`📡 服务地址: http://localhost:${PORT}`);
      console.log(`🌍 环境: ${config.server.env}`);
      console.log(`📁 数据库: ${config.database.path}`);
      console.log('========================================\n');
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 启动服务器
startServer();

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n👋 正在关闭服务器...');
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 正在关闭服务器...');
  closeDatabase();
  process.exit(0);
});

module.exports = app;
