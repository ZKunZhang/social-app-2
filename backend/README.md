# 私密圈论坛系统 - 后端 API

基于 Node.js + Express + SQLite 构建的论坛后端服务，核心特性为"相互关注可见"的隐私保护机制。

## 📋 目录

- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [API 文档](#api-文档)
- [数据库设计](#数据库设计)
- [环境变量配置](#环境变量配置)
- [测试](#测试)

---

## 🛠 技术栈

- **框架**: Express.js 4.x
- **数据库**: SQLite 3 (better-sqlite3)
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs
- **参数验证**: express-validator
- **跨域**: cors
- **测试**: Vitest

---

## 📁 项目结构

```
backend/
├── src/
│   ├── api/                 # API 路由
│   │   ├── auth.js          # 认证路由 (注册/登录)
│   │   ├── users.js         # 用户路由 (关注/搜索/个人主页)
│   │   ├── posts.js         # 帖子路由 (增删查)
│   │   ├── feed.js          # Feed 流路由
│   │   └── index.js         # 路由总入口
│   ├── controllers/         # 控制器层
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── postController.js
│   │   └── feedController.js
│   ├── services/            # 业务逻辑层
│   │   ├── authService.js   # 认证服务
│   │   ├── userService.js   # 用户服务（关注/互关逻辑）
│   │   ├── postService.js   # 帖子服务
│   │   └── feedService.js   # Feed 流服务（核心互关查询）
│   ├── middleware/          # 中间件
│   │   ├── auth.js          # JWT 认证中间件
│   │   ├── errorHandler.js  # 错误处理
│   │   └── validator.js     # 参数验证
│   ├── db/                  # 数据库
│   │   ├── connection.js    # 数据库连接（单例）
│   │   └── init.js          # 初始化脚本
│   ├── config/              # 配置
│   │   └── index.js         # 环境配置
│   └── index.js             # 应用入口
├── tests/                   # 测试文件
├── .env.example             # 环境变量示例
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 快速开始

### 1. 安装依赖

```bash
cd backend
pnpm install
```

### 2. 配置环境变量

复制示例配置文件并修改：

```bash
cp .env.example .env
```

编辑 `.env` 文件，至少修改以下内容：

```env
JWT_SECRET=你的超级安全的密钥
DATABASE_PATH=../main.db
PORT=3000
```

### 3. 初始化数据库

```bash
pnpm db:init
```

成功后会看到：

```
✅ 用户表创建成功
✅ 关注关系表创建成功
✅ 帖子表创建成功
✨ 数据库初始化完成！
```

### 4. 启动开发服务器

```bash
pnpm dev
```

服务器将在 `http://localhost:3000` 启动。

---

## 📡 API 文档

### 基础信息

- **基础路径**: `http://localhost:3000/api`
- **认证方式**: Bearer Token (JWT)
- **请求格式**: JSON
- **响应格式**: JSON

### 认证相关

#### 1. 用户注册

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "alice",
  "password": "password123"
}
```

**响应 (201)**:
```json
{
  "message": "注册成功",
  "user": {
    "id": 1,
    "username": "alice"
  }
}
```

#### 2. 用户登录

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "alice",
  "password": "password123"
}
```

**响应 (200)**:
```json
{
  "message": "登录成功",
  "user": {
    "id": 1,
    "username": "alice"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 用户相关

#### 3. 搜索用户

```http
GET /api/users/search?q=alice
Authorization: Bearer <token>
```

**响应 (200)**:
```json
{
  "users": [
    {
      "id": 1,
      "username": "alice",
      "bio": "Hello world",
      "is_following": false,
      "is_mutual": false
    }
  ],
  "count": 1
}
```

#### 4. 获取用户信息

```http
GET /api/users/:username
Authorization: Bearer <token> (可选)
```

#### 5. 关注用户

```http
POST /api/users/:username/follow
Authorization: Bearer <token>
```

#### 6. 取消关注

```http
DELETE /api/users/:username/follow
Authorization: Bearer <token>
```

#### 7. 获取指定用户的帖子（需互关）

```http
GET /api/users/:username/posts?limit=20&offset=0
Authorization: Bearer <token>
```

### 帖子相关

#### 8. 发布帖子

```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "我的第一篇帖子",
  "content": "这是帖子内容..."
}
```

#### 9. 删除帖子

```http
DELETE /api/posts/:id
Authorization: Bearer <token>
```

### Feed 流

#### 10. 获取 Feed 流（互关好友的帖子）

```http
GET /api/feed?limit=20&offset=0
Authorization: Bearer <token>
```

**响应 (200)**:
```json
{
  "posts": [
    {
      "id": 1,
      "title": "标题",
      "content": "内容",
      "created_at": "2025-01-01T00:00:00.000Z",
      "username": "bob",
      "user_id": 2
    }
  ],
  "count": 1,
  "total": 10,
  "has_more": true
}
```

---

## 🗄️ 数据库设计

详细的数据库设计请参考 [`../docs/DATABASE_SCHEMA.md`](../docs/DATABASE_SCHEMA.md)。

### 核心表结构

1. **users** - 用户表
2. **follows** - 关注关系表（单向）
3. **posts** - 帖子表

### 核心业务逻辑

#### 互关检查（Mutual Follow）

两个用户 A 和 B 互关的条件：
- A 关注了 B **AND**
- B 关注了 A

实现方式：使用 `EXISTS` 子查询优化性能。

#### Feed 流查询

只显示与当前用户"互关"的人的帖子：

```sql
SELECT p.*, u.username
FROM posts p
INNER JOIN users u ON p.user_id = u.id
WHERE EXISTS (
  SELECT 1 FROM follows WHERE follower_id = :currentUserId AND following_id = p.user_id
)
AND EXISTS (
  SELECT 1 FROM follows WHERE follower_id = p.user_id AND following_id = :currentUserId
)
ORDER BY p.created_at DESC;
```

---

## ⚙️ 环境变量配置

| 变量名            | 说明                   | 默认值                        |
|-------------------|------------------------|-------------------------------|
| `PORT`            | 服务器端口             | `3000`                        |
| `NODE_ENV`        | 运行环境               | `development`                 |
| `JWT_SECRET`      | JWT 签名密钥           | **必须修改**                  |
| `JWT_EXPIRES_IN`  | Token 过期时间         | `7d`                          |
| `DATABASE_PATH`   | SQLite 数据库路径      | `../main.db`                  |
| `ALLOWED_ORIGINS` | CORS 允许的源（逗号分隔）| `http://localhost:5173,...` |

---

## 🧪 测试

运行单元测试：

```bash
pnpm test
```

运行测试并生成覆盖率报告：

```bash
pnpm test:coverage
```

---

## 🔒 安全性

1. **密码安全**: 使用 bcryptjs 进行密码哈希（自动加盐）
2. **SQL 注入防护**: 使用参数化查询（prepared statements）
3. **JWT 认证**: 所有需要权限的接口都验证 Token
4. **隐私保护**: 严格执行"互关可见"规则

---

## 📝 开发建议

1. **永远不要**在生产环境使用默认的 `JWT_SECRET`
2. **定期备份**数据库文件
3. **使用 HTTPS** 在生产环境中部署
4. **限流**: 生产环境建议使用 `express-rate-limit` 防止滥用

---

## 📄 许可证

MIT

---

## 👥 贡献

欢迎提交 Issue 和 Pull Request！
