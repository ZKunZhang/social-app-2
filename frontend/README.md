# 私密圈论坛系统 - 前端

基于 React + Vite + TailwindCSS 构建的现代化单页应用（SPA）。

## 📋 技术栈

- **框架**: React 18
- **构建工具**: Vite 5
- **路由**: React Router v6
- **样式**: TailwindCSS 3
- **HTTP 客户端**: Axios
- **包管理器**: pnpm

## 📁 项目结构

```
frontend/
├── src/
│   ├── pages/              # 页面组件
│   │   ├── Login.jsx       # 登录页
│   │   ├── Register.jsx    # 注册页
│   │   ├── Home.jsx        # 首页 Feed 流
│   │   ├── Search.jsx      # 用户搜索页
│   │   ├── NewPost.jsx     # 发布帖子页
│   │   └── Profile.jsx     # 用户主页
│   ├── components/         # 公共组件
│   │   ├── Navbar.jsx      # 导航栏
│   │   ├── PostCard.jsx    # 帖子卡片
│   │   ├── Loading.jsx     # 加载状态
│   │   ├── ErrorMessage.jsx # 错误提示
│   │   └── EmptyState.jsx  # 空状态
│   ├── contexts/           # React Context
│   │   └── AuthContext.jsx # 认证上下文
│   ├── hooks/              # 自定义 Hooks
│   │   └── useApi.js       # API 调用 Hook
│   ├── services/           # API 服务
│   │   └── api.js          # Axios 实例和 API 封装
│   ├── App.jsx             # 路由配置
│   ├── main.jsx            # 应用入口
│   └── index.css           # 全局样式
├── public/                 # 静态资源
├── index.html              # HTML 模板
├── vite.config.js          # Vite 配置
├── tailwind.config.js      # TailwindCSS 配置
├── postcss.config.js       # PostCSS 配置
└── package.json
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd frontend
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm dev
```

应用将在 `http://localhost:5173` 启动。

**注意**：请确保后端服务已在 `http://localhost:3000` 启动。

### 3. 构建生产版本

```bash
pnpm build
```

构建产物将输出到 `dist/` 目录。

### 4. 预览生产构建

```bash
pnpm preview
```

## 🔧 配置说明

### Vite 代理配置

前端通过 Vite 的代理功能将 `/api` 请求转发到后端服务器，避免开发环境的跨域问题：

```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
```

### TailwindCSS 自定义

项目使用自定义的主题色：

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: { ... } // 蓝色主题
    }
  }
}
```

可以根据需要在 `tailwind.config.js` 中修改主题色。

## 🎨 核心功能

### 认证系统

- **注册**: 用户名 + 密码（密码至少 6 位）
- **登录**: 获取 JWT Token
- **自动认证**: Token 存储在 localStorage，自动附加到 API 请求头
- **Token 过期**: 自动跳转到登录页

### 页面路由

| 路径 | 页面 | 权限 |
|------|------|------|
| `/login` | 登录 | 公开 |
| `/register` | 注册 | 公开 |
| `/` | 首页 Feed | 需登录 |
| `/search` | 搜索用户 | 需登录 |
| `/new-post` | 发布帖子 | 需登录 |
| `/profile/:username` | 用户主页 | 需登录 |

### 核心特性

1. **互关可见**
   - 首页只显示互关好友的帖子
   - 用户主页：未互关时帖子被锁定

2. **关注系统**
   - 搜索用户
   - 一键关注/取消关注
   - 实时显示互关状态

3. **帖子系统**
   - 发布带标题和内容的帖子
   - 查看互关好友的帖子
   - 删除自己的帖子

## 🔐 安全性

- **JWT 认证**: 所有 API 请求自动附加 Token
- **路由守卫**: 未登录用户无法访问私有路由
- **XSS 防护**: React 自动转义输出
- **CORS**: 通过 Vite 代理处理跨域

## 📱 响应式设计

项目使用 TailwindCSS 的响应式工具类，支持：
- 桌面端（lg: 1024px+）
- 平板（md: 768px+）
- 移动端（默认）

## 🎯 最佳实践

1. **组件复用**: 公共组件放在 `components/` 目录
2. **状态管理**: 使用 React Context 管理全局状态
3. **API 封装**: 统一在 `services/api.js` 中管理
4. **错误处理**: 使用 ErrorMessage 组件统一显示错误
5. **加载状态**: 使用 Loading 组件提升用户体验

## 📝 开发建议

1. 使用 React DevTools 调试组件
2. 使用浏览器的网络面板检查 API 请求
3. 修改 TailwindCSS 配置后重启开发服务器

---

## 📄 许可证

MIT
