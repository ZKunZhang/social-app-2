# macOS 开发环境部署及调试手册

**项目**: 私密圈论坛系统
**适用系统**: macOS 11+ (Big Sur 及以上)
**最后更新**: 2025-01-06

---

## 📋 目录

1. [前置要求](#前置要求)
2. [环境准备](#环境准备)
3. [项目部署](#项目部署)
4. [启动服务](#启动服务)
5. [验证部署](#验证部署)
6. [常见问题](#常见问题)
7. [开发工具推荐](#开发工具推荐)

---

## 1. 前置要求

### 1.1 硬件要求

- **处理器**: Intel 或 Apple Silicon (M1/M2/M3)
- **内存**: 至少 8GB RAM
- **存储**: 至少 5GB 可用空间

### 1.2 软件要求

| 软件 | 最低版本 | 推荐版本 | 说明 |
|------|---------|---------|------|
| macOS | 11.0 | 14.0+ | 操作系统 |
| Node.js | 18.0 | 20.x LTS | JavaScript 运行时 |
| pnpm | 8.0 | 最新版 | 包管理器 |
| Git | 2.30 | 最新版 | 版本控制 |

---

## 2. 环境准备

### 2.1 安装 Homebrew

Homebrew 是 macOS 的包管理器。打开终端，运行：

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

安装完成后，验证：

```bash
brew --version
# 输出: Homebrew 4.x.x
```

### 2.2 安装 Node.js

使用 Homebrew 安装 Node.js LTS 版本：

```bash
brew install node@20
```

验证安装：

```bash
node --version
# 输出: v20.x.x

npm --version
# 输出: 10.x.x
```

### 2.3 安装 pnpm

pnpm 是高性能的 npm 替代品：

```bash
npm install -g pnpm
```

验证安装：

```bash
pnpm --version
# 输出: 8.x.x 或更高
```

### 2.4 安装 Git

macOS 通常自带 Git，但可以通过 Homebrew 安装最新版本：

```bash
brew install git
```

验证安装：

```bash
git --version
# 输出: git version 2.x.x
```

### 2.5 配置 Git（可选）

```bash
git config --global user.name "你的名字"
git config --global user.email "your.email@example.com"
```

---

## 3. 项目部署

### 3.1 克隆项目

选择一个工作目录（例如 `~/Projects`），然后克隆项目：

```bash
cd ~/Projects
git clone https://github.com/your-username/MutualFollow-Forum.git
cd MutualFollow-Forum
```

**或者**，如果你已有项目压缩包：

```bash
cd ~/Projects
unzip MutualFollow-Forum.zip
cd MutualFollow-Forum
```

### 3.2 查看项目结构

```bash
tree -L 2
# 或使用 ls -la
```

应该看到：

```
MutualFollow-Forum/
├── backend/          # 后端项目
├── frontend/         # 前端项目
├── docs/             # 文档
├── package.json      # 根 package.json (workspace)
└── README.md
```

### 3.3 安装所有依赖

#### 方法一：一键安装（推荐）

在项目根目录运行：

```bash
pnpm install -r
```

`-r` 参数会递归安装所有 workspace 的依赖。

#### 方法二：分别安装

```bash
# 安装后端依赖
cd backend
pnpm install

# 安装前端依赖
cd ../frontend
pnpm install

# 返回根目录
cd ..
```

---

## 4. 启动服务

### 4.1 配置后端环境变量

进入后端目录，复制环境变量示例文件：

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件（使用任意文本编辑器）：

```bash
nano .env
# 或使用 VS Code
code .env
```

**必须修改的配置**：

```env
# JWT 密钥（务必修改为随机字符串）
JWT_SECRET=your-super-secret-key-change-this-immediately

# 数据库路径
DATABASE_PATH=../main.db

# 其他配置可保持默认
PORT=3000
NODE_ENV=development
```

### 4.2 初始化数据库

在 `backend/` 目录下运行：

```bash
pnpm db:init
```

成功输出：

```
🚀 开始初始化数据库...

📝 创建用户表 (users)...
✅ 用户表创建成功

📝 创建关注关系表 (follows)...
✅ 关注关系表创建成功

📝 创建帖子表 (posts)...
✅ 帖子表创建成功

📊 数据库表列表:
   - users
   - follows
   - posts

✨ 数据库初始化完成！
📁 数据库文件位置: /Users/you/Projects/MutualFollow-Forum/main.db
```

### 4.3 启动后端服务

在 `backend/` 目录下运行：

```bash
pnpm dev
```

成功输出：

```
[nodemon] starting `node src/index.js`

========================================
🚀 私密圈 API 服务已启动
📡 服务地址: http://localhost:3000
🌍 环境: development
📁 数据库: /Users/you/Projects/MutualFollow-Forum/main.db
========================================
```

**保持此终端窗口运行**，后端服务将持续监听 3000 端口。

### 4.4 启动前端服务

**打开一个新的终端窗口**，进入前端目录：

```bash
cd ~/Projects/MutualFollow-Forum/frontend
pnpm dev
```

成功输出：

```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### 4.5 同时启动前后端（可选）

在项目根目录运行：

```bash
pnpm dev
```

这会同时启动前端和后端服务（需要先安装根目录的 `concurrently` 依赖）。

---

## 5. 验证部署

### 5.1 访问应用

打开浏览器，访问：

```
http://localhost:5173
```

应该看到登录页面。

### 5.2 测试后端 API

#### 方法一：使用浏览器

访问：

```
http://localhost:3000/api/health
```

应该返回：

```json
{
  "status": "ok",
  "message": "私密圈 API 正常运行",
  "timestamp": "2025-01-06T10:00:00.000Z"
}
```

#### 方法二：使用 curl

```bash
curl http://localhost:3000/api/health
```

#### 方法三：使用 Postman / Insomnia

导入 API 集合并测试各个端点。

### 5.3 注册测试账号

1. 在浏览器中打开 `http://localhost:5173/register`
2. 输入用户名和密码（例如：`alice` / `password123`）
3. 点击"注册"
4. 注册成功后，使用相同账号登录

### 5.4 功能测试清单

- [ ] 用户注册
- [ ] 用户登录
- [ ] 搜索用户
- [ ] 关注用户
- [ ] 查看用户主页
- [ ] 发布帖子
- [ ] 查看 Feed 流
- [ ] 删除帖子

---

## 6. 常见问题

### 6.1 端口被占用

**错误信息**：

```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案**：

查找占用端口的进程：

```bash
lsof -i :3000
```

终止进程：

```bash
kill -9 <PID>
```

或者修改后端 `.env` 文件中的 `PORT` 为其他端口（如 3001）。

### 6.2 pnpm 命令不存在

**错误信息**：

```
zsh: command not found: pnpm
```

**解决方案**：

重新安装 pnpm 并确保在 PATH 中：

```bash
npm install -g pnpm

# 如果使用 zsh，重新加载配置
source ~/.zshrc
```

### 6.3 数据库文件权限问题

**错误信息**：

```
Error: EACCES: permission denied
```

**解决方案**：

确保数据库文件有写权限：

```bash
chmod 644 main.db
```

### 6.4 Node.js 版本过低

**错误信息**：

```
SyntaxError: Unexpected token '?'
```

**解决方案**：

升级 Node.js 到 18+ 版本：

```bash
brew upgrade node@20
```

### 6.5 前端无法连接后端（CORS 错误）

**错误信息**（浏览器控制台）：

```
Access to XMLHttpRequest at 'http://localhost:3000/api/...'
has been blocked by CORS policy
```

**解决方案**：

1. 确认后端服务正在运行
2. 检查 Vite 代理配置（`frontend/vite.config.js`）
3. 检查后端 CORS 配置（`backend/src/index.js`）

### 6.6 热重载不工作

**问题**：修改代码后页面不自动刷新

**解决方案**：

- **后端**：检查 `nodemon` 是否正常工作
- **前端**：检查 Vite 服务是否正常运行
- 尝试手动刷新浏览器（Cmd + R）

---

## 7. 开发工具推荐

### 7.1 代码编辑器

**Visual Studio Code (推荐)**

安装方法：

```bash
brew install --cask visual-studio-code
```

推荐插件：

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- SQLite Viewer

### 7.2 API 测试工具

**Postman** 或 **Insomnia**

```bash
brew install --cask postman
# 或
brew install --cask insomnia
```

### 7.3 数据库查看工具

**DB Browser for SQLite**

```bash
brew install --cask db-browser-for-sqlite
```

使用方法：

1. 打开应用
2. File → Open Database
3. 选择 `main.db`
4. 可以查看和编辑数据

### 7.4 终端工具

**iTerm2 (推荐)**

```bash
brew install --cask iterm2
```

**Oh My Zsh (美化终端)**

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

---

## 8. 开发工作流

### 8.1 每日开发流程

1. **启动服务**

```bash
# 终端 1：启动后端
cd backend && pnpm dev

# 终端 2：启动前端
cd frontend && pnpm dev
```

2. **开始开发**
   - 修改代码
   - 保存文件（自动热重载）
   - 在浏览器中查看变化

3. **提交代码**

```bash
git add .
git commit -m "feat: 添加新功能"
git push
```

### 8.2 调试技巧

#### 后端调试

在代码中添加 `console.log()`：

```javascript
console.log('用户信息:', user);
```

查看终端输出。

#### 前端调试

使用浏览器开发者工具：

- **Mac**: `Cmd + Option + I`
- 查看 Console、Network、React DevTools

### 8.3 数据库操作

查看数据：

```bash
sqlite3 main.db "SELECT * FROM users;"
```

或使用 DB Browser for SQLite 图形界面。

---

## 9. 停止服务

### 9.1 停止开发服务器

在运行服务的终端窗口按 `Ctrl + C`。

### 9.2 清理进程

如果进程没有正常退出，可以手动终止：

```bash
# 查找 Node.js 进程
ps aux | grep node

# 终止进程
kill -9 <PID>
```

---

## 10. 下一步

- 阅读[后端 API 文档](../backend/README.md)
- 阅读[前端开发文档](../frontend/README.md)
- 阅读[数据库设计文档](./DATABASE_SCHEMA.md)
- 开始开发新功能

---

## 附录

### A. 快捷命令列表

```bash
# 安装依赖
pnpm install -r

# 初始化数据库
cd backend && pnpm db:init

# 启动后端
cd backend && pnpm dev

# 启动前端
cd frontend && pnpm dev

# 同时启动前后端（根目录）
pnpm dev

# 运行测试
cd backend && pnpm test

# 构建生产版本
cd frontend && pnpm build
```

### B. 目录结构速查

```
MutualFollow-Forum/
├── backend/
│   ├── src/
│   │   ├── api/            # API 路由
│   │   ├── controllers/    # 控制器
│   │   ├── services/       # 业务逻辑
│   │   ├── middleware/     # 中间件
│   │   ├── db/             # 数据库
│   │   └── index.js        # 入口文件
│   ├── tests/              # 测试
│   ├── .env                # 环境变量（需创建）
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/          # 页面组件
│   │   ├── components/     # 公共组件
│   │   ├── contexts/       # React Context
│   │   ├── services/       # API 服务
│   │   └── App.jsx         # 路由配置
│   └── package.json
└── docs/                   # 文档
```

---

**祝你开发愉快！** 🚀
