# 私密圈论坛系统 (MutualFollow-Forum)

**一个基于"相互关注"为核心隐私边界的论坛系统**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.x-blue)](https://reactjs.org/)

---

## 📖 项目简介

私密圈是一个创新的论坛系统，与传统社交平台不同，这里强调**真实关系**和**内容隐私**：

- 🔒 **互关可见**: 内容只对相互关注的好友可见
- 🚫 **无算法推荐**: Feed 流只显示互关好友的内容
- 🎯 **专注分享**: 在小圈子里分享，拒绝陌生人打扰
- 🌟 **极简设计**: 快速、流畅、无广告

---

## ✨ 核心特性

| 特性 | 说明 |
|------|------|
| **互关机制** | 必须双向关注才能查看对方内容 |
| **隐私保护** | 帖子只对互关好友可见，严格权限控制 |
| **关注系统** | 搜索用户、关注/取消关注、实时互关状态 |
| **Feed 流** | 只显示互关好友的帖子，按时间倒序 |
| **帖子系统** | 发布、删除帖子，支持标题和长文内容 |
| **用户主页** | 查看用户信息，互关后可见帖子列表 |

---

## 🛠 技术栈

### 前端
- **框架**: React 18 + Vite 5
- **路由**: React Router v6
- **样式**: TailwindCSS 3
- **HTTP**: Axios
- **状态管理**: React Context

### 后端
- **框架**: Node.js + Express.js
- **数据库**: SQLite (better-sqlite3)
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs
- **验证**: express-validator

### 部署
- **进程管理**: PM2
- **Web服务器**: Nginx
- **SSL**: Let's Encrypt (Certbot)

---

## 📁 项目结构

```
MutualFollow-Forum/
├── backend/              # 后端 API 服务
│   ├── src/
│   │   ├── api/          # API 路由
│   │   ├── controllers/  # 控制器层
│   │   ├── services/     # 业务逻辑层
│   │   ├── middleware/   # 中间件
│   │   ├── db/           # 数据库
│   │   └── index.js      # 后端入口
│   ├── tests/            # 单元测试
│   └── package.json
├── frontend/             # 前端 React 应用
│   ├── src/
│   │   ├── pages/        # 页面组件
│   │   ├── components/   # 公共组件
│   │   ├── contexts/     # React Context
│   │   ├── services/     # API 服务
│   │   └── App.jsx       # 前端入口
│   └── package.json
├── docs/                 # 项目文档
│   ├── PRD.md            # 产品需求文档
│   ├── DATABASE_SCHEMA.md         # 数据库设计
│   ├── DEPLOYMENT_MACOS.md        # macOS 部署手册
│   ├── DEPLOYMENT_UBUNTU.md       # Ubuntu 部署手册
│   ├── ADMIN_MANUAL.md            # 管理员手册
│   ├── USER_MANUAL.md             # 用户手册
│   └── MARKETING.md               # 产品宣传手册
├── package.json          # Workspace 配置
└── README.md
```

---

## 🚀 快速开始

### 前置要求

- Node.js 18+ / 20+ LTS
- pnpm 8+
- Git

### 安装步骤

#### 1. 克隆项目

```bash
git clone https://github.com/your-org/MutualFollow-Forum.git
cd MutualFollow-Forum
```

#### 2. 安装依赖

```bash
pnpm install -r
```

#### 3. 配置后端

```bash
cd backend
cp .env.example .env
# 编辑 .env 文件，修改 JWT_SECRET
```

#### 4. 初始化数据库

```bash
cd backend
pnpm db:init
```

#### 5. 启动服务

**终端 1 - 后端**:
```bash
cd backend
pnpm dev
```

**终端 2 - 前端**:
```bash
cd frontend
pnpm dev
```

#### 6. 访问应用

打开浏览器访问: [http://localhost:5173](http://localhost:5173)

---

## 📚 文档

### 开发文档
- [后端 API 文档](./backend/README.md)
- [前端开发文档](./frontend/README.md)
- [数据库设计文档](./docs/DATABASE_SCHEMA.md)

### 部署文档
- [macOS 开发环境部署](./docs/DEPLOYMENT_MACOS.md)
- [Ubuntu 生产环境部署](./docs/DEPLOYMENT_UBUNTU.md)

### 使用文档
- [产品需求文档 (PRD)](./docs/PRD.md)
- [管理员操作手册](./docs/ADMIN_MANUAL.md)
- [用户使用手册](./docs/USER_MANUAL.md)
- [产品宣传手册](./docs/MARKETING.md)

---

## 🧪 测试

运行后端单元测试：

```bash
cd backend
pnpm test
```

---

## 🔑 核心逻辑：互关机制

### 互关定义

两个用户 A 和 B **互关**的充要条件：
- A 关注了 B **AND**
- B 关注了 A

### 隐私规则

| 场景 | 访问权限 |
|------|----------|
| 用户主页 | 任何人可访问，但帖子列表只对互关用户可见 |
| 首页 Feed | 只显示与当前用户互关的人的帖子 |
| 帖子详情 | 只有互关用户或作者本人可访问 |

---

## 🎯 API 端点

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 用户
- `GET /api/users/search?q=keyword` - 搜索用户
- `GET /api/users/:username` - 获取用户信息
- `POST /api/users/:username/follow` - 关注用户
- `DELETE /api/users/:username/follow` - 取消关注

### 帖子
- `POST /api/posts` - 发布帖子
- `GET /api/posts/:id` - 获取帖子详情
- `DELETE /api/posts/:id` - 删除帖子
- `GET /api/users/:username/posts` - 获取用户帖子列表

### Feed
- `GET /api/feed` - 获取 Feed 流（互关用户的帖子）

---

## 🔐 安全性

- ✅ 密码使用 bcryptjs 哈希存储
- ✅ JWT Token 认证
- ✅ SQL 注入防护（参数化查询）
- ✅ XSS 防护（React 自动转义）
- ✅ CORS 配置
- ✅ HTTPS 支持（生产环境）

---

## 🗺️ 路线图

### v1.0 (已完成) ✅
- 用户注册、登录
- 关注系统（关注、取消关注、互关检查）
- 帖子发布、删除
- Feed 流（只显示互关用户的帖子）
- 用户主页（互关可见）

### v1.1 (计划中)
- [ ] 编辑个人简介
- [ ] 评论功能
- [ ] 点赞功能
- [ ] 通知系统
- [ ] 图片上传

### v2.0 (未来规划)
- [ ] 私信功能
- [ ] 话题标签
- [ ] 帖子搜索
- [ ] 黑名单功能
- [ ] 多媒体支持（视频、音频）
- [ ] 移动端 App

---

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

---

## 📝 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

---

## 👥 团队

- 产品设计: [你的名字]
- 后端开发: [你的名字]
- 前端开发: [你的名字]
- 文档撰写: [你的名字]

---

## 📧 联系方式

- 项目主页: [https://github.com/your-org/MutualFollow-Forum](https://github.com/your-org/MutualFollow-Forum)
- 问题反馈: [GitHub Issues](https://github.com/your-org/MutualFollow-Forum/issues)
- 邮箱: contact@your-domain.com

---

## 🌟 Star History

如果这个项目对你有帮助，请给我们一个 ⭐️ Star！

---

**私密圈 - 你的私密社交空间** 🔒

**拒绝噪音，专注分享，只与真正的好友连接。**

---

_© 2025 私密圈团队 | Made with ❤️ in China_
