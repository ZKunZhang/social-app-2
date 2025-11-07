const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../db/connection');
const config = require('../config');

/**
 * 用户注册
 */
function register(username, password) {
  const db = getDatabase();

  // 检查用户名是否已存在
  const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);

  if (existingUser) {
    throw new Error('用户名已被占用');
  }

  // 对密码进行哈希
  const passwordHash = bcrypt.hashSync(password, 10);

  // 插入新用户
  const result = db.prepare(`
    INSERT INTO users (username, password_hash)
    VALUES (?, ?)
  `).run(username, passwordHash);

  return {
    id: result.lastInsertRowid,
    username,
  };
}

/**
 * 用户登录
 */
function login(username, password) {
  const db = getDatabase();

  // 查找用户
  const user = db.prepare('SELECT id, username, password_hash FROM users WHERE username = ?').get(username);

  if (!user) {
    throw new Error('用户名或密码错误');
  }

  // 验证密码
  const isPasswordValid = bcrypt.compareSync(password, user.password_hash);

  if (!isPasswordValid) {
    throw new Error('用户名或密码错误');
  }

  // 生成 JWT
  const token = jwt.sign(
    { id: user.id, username: user.username },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  return {
    user: {
      id: user.id,
      username: user.username,
    },
    token,
  };
}

module.exports = {
  register,
  login,
};
