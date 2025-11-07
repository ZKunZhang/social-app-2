# 数据库设计文档 (Database Schema)

## 概述

本项目使用 SQLite 作为数据库，通过 `sql.js` 库（纯 JavaScript 实现）进行操作。sql.js 是 SQLite 的 WebAssembly 移植版本，无需编译原生模块，具有跨平台兼容性。

## 表结构设计

### 1. 用户表 (users)

存储所有注册用户的基本信息。

```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    bio TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
```

**字段说明：**
- `id`: 用户唯一标识符（主键）
- `username`: 用户名（唯一，用于登录和展示）
- `password_hash`: 密码哈希值（使用 bcryptjs 加密）
- `bio`: 用户简介（可选）
- `created_at`: 账户创建时间
- `updated_at`: 最后更新时间

---

### 2. 关注关系表 (follows)

存储用户之间的关注关系（单向）。

```sql
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

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_follows_mutual ON follows(follower_id, following_id);
```

**字段说明：**
- `id`: 关注关系唯一标识符
- `follower_id`: 关注者的用户ID
- `following_id`: 被关注者的用户ID
- `created_at`: 关注时间

**约束：**
- `UNIQUE(follower_id, following_id)`: 防止重复关注
- `CHECK (follower_id != following_id)`: 防止自己关注自己

---

### 3. 帖子表 (posts)

存储所有用户发布的帖子。

```sql
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

**字段说明：**
- `id`: 帖子唯一标识符
- `user_id`: 发帖用户的ID
- `title`: 帖子标题
- `content`: 帖子内容
- `created_at`: 发布时间
- `updated_at`: 最后更新时间

---

## 核心业务逻辑的SQL实现

### 1. 检查两个用户是否互关

```sql
-- 检查 userA 和 userB 是否互关
SELECT COUNT(*) as is_mutual
FROM follows f1
WHERE f1.follower_id = :userA_id
  AND f1.following_id = :userB_id
  AND EXISTS (
    SELECT 1 FROM follows f2
    WHERE f2.follower_id = :userB_id
      AND f2.following_id = :userA_id
  );
-- 返回 1 表示互关，0 表示未互关
```

### 2. 获取用户的互关好友列表

```sql
-- 获取与 userId 互关的所有用户
SELECT u.id, u.username, u.bio
FROM users u
INNER JOIN follows f1 ON u.id = f1.following_id
WHERE f1.follower_id = :userId
  AND EXISTS (
    SELECT 1 FROM follows f2
    WHERE f2.follower_id = u.id
      AND f2.following_id = :userId
  );
```

### 3. 获取 Feed 流（只显示互关用户的帖子）

```sql
-- 获取当前用户的 Feed（只包含互关好友的帖子）
SELECT
    p.id,
    p.title,
    p.content,
    p.created_at,
    u.username,
    u.id as user_id
FROM posts p
INNER JOIN users u ON p.user_id = u.id
WHERE EXISTS (
    -- 当前用户关注了发帖者
    SELECT 1 FROM follows f1
    WHERE f1.follower_id = :currentUserId
      AND f1.following_id = p.user_id
)
AND EXISTS (
    -- 发帖者也关注了当前用户（互关条件）
    SELECT 1 FROM follows f2
    WHERE f2.follower_id = p.user_id
      AND f2.following_id = :currentUserId
)
ORDER BY p.created_at DESC
LIMIT :limit OFFSET :offset;
```

### 4. 获取指定用户的帖子（需验证互关）

```sql
-- 获取用户 targetUserId 的帖子
-- 注意：调用前需在应用层先验证 currentUserId 和 targetUserId 是否互关
SELECT
    p.id,
    p.title,
    p.content,
    p.created_at,
    p.updated_at
FROM posts p
WHERE p.user_id = :targetUserId
ORDER BY p.created_at DESC
LIMIT :limit OFFSET :offset;
```

### 5. 获取用户的关注/粉丝统计

```sql
-- 获取用户的关注数
SELECT COUNT(*) as following_count
FROM follows
WHERE follower_id = :userId;

-- 获取用户的粉丝数
SELECT COUNT(*) as followers_count
FROM follows
WHERE following_id = :userId;

-- 获取互关好友数
SELECT COUNT(DISTINCT f1.following_id) as mutual_count
FROM follows f1
WHERE f1.follower_id = :userId
  AND EXISTS (
    SELECT 1 FROM follows f2
    WHERE f2.follower_id = f1.following_id
      AND f2.following_id = :userId
  );
```

---

## RESTful API 规范

基于以上数据库设计，后端需实现以下 API 端点：

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录（返回JWT）

### 用户相关
- `GET /api/users/search?q=keyword` - 搜索用户
- `GET /api/users/:username` - 获取用户信息（包括是否互关状态）
- `GET /api/users/:username/posts` - 获取指定用户的帖子（需互关）
- `POST /api/users/:username/follow` - 关注用户
- `DELETE /api/users/:username/follow` - 取消关注

### 帖子相关
- `GET /api/feed` - 获取当前用户的Feed流（互关用户的帖子）
- `POST /api/posts` - 发布新帖子
- `GET /api/posts/:id` - 获取帖子详情（需验证权限）
- `DELETE /api/posts/:id` - 删除自己的帖子

---

## 数据库性能优化建议

1. **索引优化**：已为高频查询字段创建索引
   - `users.username` - 用户搜索和登录
   - `follows(follower_id, following_id)` - 关注关系查询
   - `posts.user_id` 和 `posts.created_at` - Feed流查询

2. **查询优化**：
   - 使用 `EXISTS` 子查询而非 `JOIN` 来检查互关状态（性能更优）
   - Feed流查询使用 `LIMIT` 和 `OFFSET` 实现分页

3. **数据完整性**：
   - 使用外键约束 `ON DELETE CASCADE` 确保数据一致性
   - 使用 `CHECK` 约束防止无效数据

---

## 安全性考虑

1. **密码安全**：使用 bcryptjs 进行密码哈希（盐值自动生成）
2. **SQL注入防护**：使用参数化查询（sql.js 的 prepared statements）
3. **访问控制**：所有需要权限的API都需验证JWT Token
4. **隐私保护**：严格执行"互关可见"规则，防止未授权访问
