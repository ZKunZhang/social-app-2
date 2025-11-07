const { initDB, extendDatabase, saveDatabase } = require('./connection');

/**
 * 数据库初始化脚本
 * 创建所有必要的表和索引
 */

async function initialize() {
  console.log('🚀 开始初始化数据库...\n');

  try {
    // 初始化数据库
    const db = await initDB();
    extendDatabase(db);

    // 1. 创建用户表
    console.log('📝 创建用户表 (users)...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        bio TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);`);
    console.log('✅ 用户表创建成功\n');

    // 2. 创建关注关系表
    console.log('📝 创建关注关系表 (follows)...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS follows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        follower_id INTEGER NOT NULL,
        following_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(follower_id, following_id),
        CHECK (follower_id != following_id)
      );
    `);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_follows_mutual ON follows(follower_id, following_id);`);
    console.log('✅ 关注关系表创建成功\n');

    // 3. 创建帖子表
    console.log('📝 创建帖子表 (posts)...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);`);
    console.log('✅ 帖子表创建成功\n');

    // 保存数据库
    saveDatabase();

    // 验证表是否创建成功
    const result = db.exec(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name;
    `);

    console.log('📊 数据库表列表:');
    if (result.length > 0 && result[0].values) {
      result[0].values.forEach(row => {
        console.log(`   - ${row[0]}`);
      });
    }

    console.log('\n✨ 数据库初始化完成！');
    console.log(`📁 数据库文件位置: ${require('../config').database.path}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    process.exit(1);
  }
}

// 运行初始化
initialize();
