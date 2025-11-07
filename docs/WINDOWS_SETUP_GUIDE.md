# ⚠️ 重要：Windows 环境 better-sqlite3 安装指南

## 当前问题

在 Windows 系统上，`better-sqlite3` 需要编译原生 C++ 模块，但 pnpm 10.x 默认阻止构建脚本运行。

## ✅ 解决方案（按推荐顺序）

### 🎯 方案 1：安装 Visual Studio Build Tools（推荐）

这是**一劳永逸**的解决方案。

#### 步骤 1：下载安装器

访问：https://visualstudio.microsoft.com/zh-hans/downloads/

向下滚动找到「Visual Studio 2022 生成工具」并下载

#### 步骤 2：安装必要组件

1. 运行安装器
2. 选择「使用 C++ 的桌面开发」
3. 右侧确保勾选：
   - MSVC v143 - VS 2022 C++ x64/x86 生成工具
   - Windows 10/11 SDK
4. 点击「安装」（大约 6-8 GB，需要 10-15 分钟）

#### 步骤 3：重新安装项目依赖

```bash
cd C:\Users\admin\Company\github\MutualFollow-Forum\backend

# 删除现有的 node_modules
rm -rf node_modules

# 重新安装（这次会自动构建）
pnpm install --config.ignore-scripts=false
```

#### 步骤 4：验证

```bash
# 应该能成功运行
node src/db/init.js
```

---

### 🚀 方案 2：使用 windows-build-tools（自动化）

#### 步骤 1：安装 windows-build-tools

**以管理员身份**打开 PowerShell，运行：

```powershell
npm install --global windows-build-tools
```

这会自动安装：
- Python 2.7
- Visual Studio Build Tools

**注意**：这个过程可能需要 30-60 分钟

#### 步骤 2：重新安装依赖

```bash
cd C:\Users\admin\Company\github\MutualFollow-Forum\backend
rm -rf node_modules
pnpm install --config.ignore-scripts=false
```

---

### 🔧 方案 3：手动构建（高级用户）

如果你已经安装了 Visual Studio Build Tools：

```bash
cd C:\Users\admin\Company\github\MutualFollow-Forum\backend

# 进入 better-sqlite3 目录
cd node_modules/.pnpm/better-sqlite3@9.2.2/node_modules/better-sqlite3

# 手动构建
npx node-gyp rebuild

# 返回backend目录
cd ../../../../..

# 测试
node src/db/init.js
```

---

### 💡 方案 4：使用 Yarn 替代 pnpm（临时方案）

Yarn 对构建脚本的处理更宽松：

```bash
# 安装 Yarn
npm install -g yarn

cd C:\Users\admin\Company\github\MutualFollow-Forum\backend

# 删除 pnpm 文件
rm -rf node_modules pnpm-lock.yaml

# 使用 Yarn 安装
yarn install

# 初始化数据库
yarn db:init

# 启动开发服务器
yarn dev
```

---

## ❌ 方案 5：使用纯 JS 替代品（不推荐）

如果上述所有方案都失败，可以使用不需要编译的 SQLite 库：

### 5.1 使用 sql.js

编辑 `backend/package.json`：

```json
{
  "dependencies": {
    "sql.js": "^1.8.0"
  }
}
```

**缺点**：
- 需要重写所有数据库代码
- 性能比 better-sqlite3 差
- 不是即插即用

---

## 🎓 验证安装成功

安装完成后，运行以下命令验证：

```bash
cd C:\Users\admin\Company\github\MutualFollow-Forum\backend

# 初始化数据库
node src/db/init.js
```

**成功输出**：

```
🚀 开始初始化数据库...

📝 创建用户表 (users)...
✅ 用户表创建成功

📝 创建关注关系表 (follows)...
✅ 关注关系表创建成功

📝 创建帖子表 (posts)...
✅ 帖子表创建成功

✨ 数据库初始化完成！
```

---

## 🐛 常见错误排查

### 错误 1：`MSBUILD : error MSB3428`

**原因**：未安装 Visual Studio Build Tools

**解决**：安装方案 1 或方案 2

### 错误 2：`Python not found`

**原因**：缺少 Python 2.7

**解决**：
```bash
npm install --global --production windows-build-tools
```

### 错误 3：`node-gyp not found`

**解决**：
```bash
npm install -g node-gyp
```

---

## 📞 仍然无法解决？

1. 检查 Node.js 版本：`node --version`（建议使用 18.x 或 20.x LTS）
2. 检查是否以管理员身份运行
3. 重启电脑后重试
4. 查看详细错误日志：`C:\Users\admin\AppData\Local\npm-cache\_logs\`

---

## ⏱️ 时间估算

| 方案 | 时间 | 难度 |
|------|------|------|
| 方案 1（推荐） | 20-30 分钟 | ⭐⭐ |
| 方案 2 | 30-60 分钟 | ⭐ |
| 方案 3 | 5-10 分钟 | ⭐⭐⭐ |
| 方案 4 | 5 分钟 | ⭐ |

---

**推荐操作流程**：

1. ✅ 先尝试**方案 1**（安装 Visual Studio Build Tools）
2. ✅ 如果不想安装大文件，尝试**方案 4**（使用 Yarn）
3. ✅ 如果都失败，联系我提供远程协助

---

_创建日期：2025-01-07_
