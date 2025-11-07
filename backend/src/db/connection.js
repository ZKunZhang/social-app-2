const Database = require('better-sqlite3');
const config = require('../config');

let db = null;

/**
 * 获取数据库实例（单例模式）
 */
function getDatabase() {
  if (!db) {
    db = new Database(config.database.path, {
      verbose: config.server.env === 'development' ? console.log : null,
    });

    // 启用外键约束
    db.pragma('foreign_keys = ON');

    // 优化性能设置
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
  }

  return db;
}

/**
 * 关闭数据库连接
 */
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  getDatabase,
  closeDatabase,
};
