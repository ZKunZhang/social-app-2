const initSqlJs = require('sql.js');
const fs = require('fs');
const config = require('../config');

let db = null;
let SQL = null;

/**
 * 初始化 SQL.js
 */
async function initDB() {
  if (!SQL) {
    SQL = await initSqlJs();
  }

  if (!db) {
    const dbPath = config.database.path;

    // 如果数据库文件存在，从文件加载
    if (fs.existsSync(dbPath)) {
      const buffer = fs.readFileSync(dbPath);
      db = new SQL.Database(buffer);
    } else {
      // 创建新数据库
      db = new SQL.Database();
    }

    // 启用外键约束
    db.run('PRAGMA foreign_keys = ON');
  }

  return db;
}

/**
 * 获取数据库实例（同步版本 - 用于已初始化的情况）
 */
function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return db;
}

/**
 * 保存数据库到文件
 */
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(config.database.path, buffer);
  }
}

/**
 * 关闭数据库连接
 */
function closeDatabase() {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
  }
}

/**
 * 扩展 db 对象以支持 better-sqlite3 兼容的 prepare 方法
 */
function extendDatabase(database) {
  // 保存原始的 prepare 方法
  const originalPrepare = database.prepare.bind(database);

  // 重写 prepare 方法以兼容 better-sqlite3 的 API
  database.prepare = function(sql) {
    const stmt = originalPrepare(sql);

    return {
      run: function(...params) {
        stmt.bind(params);
        stmt.step();
        const changes = database.getRowsModified();
        stmt.reset();

        // 保存到文件
        saveDatabase();

        // 获取最后插入的 ID
        let lastInsertRowid = 0;
        try {
          const result = database.exec("SELECT last_insert_rowid() as id");
          if (result.length > 0 && result[0].values && result[0].values.length > 0) {
            lastInsertRowid = result[0].values[0][0];
          }
        } catch (e) {
          // 忽略错误
        }

        return {
          changes,
          lastInsertRowid
        };
      },
      get: function(...params) {
        stmt.bind(params);
        const result = stmt.step() ? stmt.getAsObject() : null;
        stmt.reset();
        return result;
      },
      all: function(...params) {
        stmt.bind(params);
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.reset();
        return results;
      }
    };
  };

  return database;
}

module.exports = {
  initDB,
  getDatabase,
  saveDatabase,
  closeDatabase,
  extendDatabase
};
