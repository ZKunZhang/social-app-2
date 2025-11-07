const { describe, it, expect, beforeAll, afterAll, beforeEach } = require('vitest');
const Database = require('better-sqlite3');
const userService = require('../src/services/userService');
const authService = require('../src/services/authService');

// 使用内存数据库进行测试
let db;
let testUsers = [];

// 初始化测试数据库
function initTestDatabase() {
  db = new Database(':memory:');
  db.pragma('foreign_keys = ON');

  // 创建表
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      bio TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE follows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      follower_id INTEGER NOT NULL,
      following_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(follower_id, following_id),
      CHECK (follower_id != following_id)
    );

    CREATE INDEX idx_follows_follower ON follows(follower_id);
    CREATE INDEX idx_follows_following ON follows(following_id);
  `);
}

// 模拟 getDatabase 函数
beforeAll(() => {
  initTestDatabase();

  // 替换真实的 getDatabase
  const connection = require('../src/db/connection');
  connection.getDatabase = () => db;

  // 创建测试用户
  const bcrypt = require('bcryptjs');
  const users = ['alice', 'bob', 'charlie', 'david'];

  users.forEach(username => {
    const result = db.prepare(`
      INSERT INTO users (username, password_hash, bio)
      VALUES (?, ?, ?)
    `).run(username, bcrypt.hashSync('password123', 10), `Hello, I'm ${username}`);

    testUsers.push({
      id: result.lastInsertRowid,
      username,
    });
  });
});

afterAll(() => {
  if (db) {
    db.close();
  }
});

beforeEach(() => {
  // 清空关注关系表
  db.prepare('DELETE FROM follows').run();
});

describe('userService - 关注功能测试', () => {
  it('应该能够成功关注一个用户', () => {
    const alice = testUsers[0];
    const bob = testUsers[1];

    const result = userService.followUser(alice.id, bob.username);

    expect(result.success).toBe(true);
    expect(result.is_mutual).toBe(false); // 此时未互关

    // 验证数据库中的记录
    const follow = db.prepare(`
      SELECT * FROM follows
      WHERE follower_id = ? AND following_id = ?
    `).get(alice.id, bob.id);

    expect(follow).toBeDefined();
  });

  it('应该能够取消关注', () => {
    const alice = testUsers[0];
    const bob = testUsers[1];

    // 先关注
    userService.followUser(alice.id, bob.username);

    // 取消关注
    const result = userService.unfollowUser(alice.id, bob.username);

    expect(result.success).toBe(true);

    // 验证数据库中已删除
    const follow = db.prepare(`
      SELECT * FROM follows
      WHERE follower_id = ? AND following_id = ?
    `).get(alice.id, bob.id);

    expect(follow).toBeUndefined();
  });

  it('不应该能够关注自己', () => {
    const alice = testUsers[0];

    expect(() => {
      userService.followUser(alice.id, alice.username);
    }).toThrow('不能关注自己');
  });

  it('不应该能够重复关注同一用户', () => {
    const alice = testUsers[0];
    const bob = testUsers[1];

    userService.followUser(alice.id, bob.username);

    expect(() => {
      userService.followUser(alice.id, bob.username);
    }).toThrow('已经关注过该用户');
  });

  it('不应该能够取消未关注的用户', () => {
    const alice = testUsers[0];
    const bob = testUsers[1];

    expect(() => {
      userService.unfollowUser(alice.id, bob.username);
    }).toThrow('未关注该用户');
  });
});

describe('userService - 互关检查测试', () => {
  it('应该正确判断两个用户是否互关', () => {
    const alice = testUsers[0];
    const bob = testUsers[1];

    // 初始状态：未互关
    expect(userService.checkMutualFollow(alice.id, bob.id)).toBe(false);

    // Alice 关注 Bob
    userService.followUser(alice.id, bob.username);
    expect(userService.checkMutualFollow(alice.id, bob.id)).toBe(false);

    // Bob 也关注 Alice（形成互关）
    userService.followUser(bob.id, alice.username);
    expect(userService.checkMutualFollow(alice.id, bob.id)).toBe(true);
    expect(userService.checkMutualFollow(bob.id, alice.id)).toBe(true);

    // Bob 取消关注 Alice（破坏互关）
    userService.unfollowUser(bob.id, alice.username);
    expect(userService.checkMutualFollow(alice.id, bob.id)).toBe(false);
  });
});

describe('userService - 获取用户信息测试', () => {
  it('应该能够获取用户的基本信息', () => {
    const alice = testUsers[0];

    const user = userService.getUserByUsername(alice.username);

    expect(user).toBeDefined();
    expect(user.username).toBe(alice.username);
    expect(user.bio).toBe(`Hello, I'm ${alice.username}`);
    expect(user.following_count).toBeDefined();
    expect(user.followers_count).toBeDefined();
  });

  it('应该能够获取用户信息并包含关注状态', () => {
    const alice = testUsers[0];
    const bob = testUsers[1];

    // Alice 关注 Bob
    userService.followUser(alice.id, bob.username);

    // Alice 查看 Bob 的信息
    const bobInfo = userService.getUserByUsername(bob.username, alice.id);

    expect(bobInfo.is_following).toBe(true);
    expect(bobInfo.is_mutual).toBe(false);

    // Bob 也关注 Alice
    userService.followUser(bob.id, alice.username);

    // 再次查看，应该显示互关
    const bobInfoMutual = userService.getUserByUsername(bob.username, alice.id);
    expect(bobInfoMutual.is_mutual).toBe(true);
  });

  it('查询不存在的用户应该返回 null', () => {
    const user = userService.getUserByUsername('nonexistent');
    expect(user).toBeNull();
  });
});

describe('userService - 搜索用户测试', () => {
  it('应该能够通过用户名搜索用户', () => {
    const alice = testUsers[0];

    // 搜索包含 "bob" 的用户
    const results = userService.searchUsers('bob', alice.id);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].username).toContain('bob');
  });

  it('搜索结果应该包含关注状态', () => {
    const alice = testUsers[0];
    const bob = testUsers[1];

    // Alice 关注 Bob
    userService.followUser(alice.id, bob.username);

    const results = userService.searchUsers('bob', alice.id);
    const bobResult = results.find(u => u.username === bob.username);

    expect(bobResult.is_following).toBe(true);
    expect(bobResult.is_mutual).toBe(false);
  });

  it('搜索结果不应该包含当前用户自己', () => {
    const alice = testUsers[0];

    const results = userService.searchUsers('alice', alice.id);

    const selfResult = results.find(u => u.id === alice.id);
    expect(selfResult).toBeUndefined();
  });
});

describe('userService - 获取互关好友列表测试', () => {
  it('应该能够获取所有互关的好友', () => {
    const alice = testUsers[0];
    const bob = testUsers[1];
    const charlie = testUsers[2];

    // Alice 和 Bob 互关
    userService.followUser(alice.id, bob.username);
    userService.followUser(bob.id, alice.username);

    // Alice 和 Charlie 互关
    userService.followUser(alice.id, charlie.username);
    userService.followUser(charlie.id, alice.username);

    const mutualFollows = userService.getMutualFollows(alice.id);

    expect(mutualFollows.length).toBe(2);
    expect(mutualFollows.map(u => u.username)).toContain(bob.username);
    expect(mutualFollows.map(u => u.username)).toContain(charlie.username);
  });

  it('单向关注不应该出现在互关列表中', () => {
    const alice = testUsers[0];
    const david = testUsers[3];

    // Alice 关注 David（单向）
    userService.followUser(alice.id, david.username);

    const mutualFollows = userService.getMutualFollows(alice.id);

    expect(mutualFollows.find(u => u.username === david.username)).toBeUndefined();
  });
});
