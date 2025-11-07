# Windows 环境 better-sqlite3 安装问题修复指南

## 问题描述

pnpm 10.x 在 Windows 上默认阻止运行构建脚本，导致 better-sqlite3 无法编译原生模块。

## 快速解决方案（推荐）

### 方案 1：使用 npm 替代 pnpm（最简单）

```bash
# 删除 pnpm 安装的 node_modules
cd backend
rm -rf node_modules

# 使用 npm 安装
npm install

# 初始化数据库
npm run db:init

# 启动服务
npm run dev
```

### 方案 2：安装 Windows Build Tools

1. **以管理员身份**打开 PowerShell

2. 安装 windows-build-tools：

```powershell
npm install --global windows-build-tools
```

这会自动安装：
- Python 2.7
- Visual Studio Build Tools

3. 安装完成后，重新安装依赖：

```bash
cd backend
pnpm install --force
```

### 方案 3：安装 Visual Studio Build Tools（手动）

1. 下载并安装 [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/)

2. 在安装时选择"使用 C++ 的桌面开发"

3. 重新安装依赖：

```bash
cd backend
pnpm install --force
```

### 方案 4：降级 pnpm（临时方案）

```bash
# 全局降级到 pnpm 8.x
npm install -g pnpm@8

# 重新安装
cd backend
pnpm install
```

## 验证安装

运行以下命令测试：

```bash
cd backend
node src/db/init.js
```

成功会看到：
```
✨ 数据库初始化完成！
```

## 如果上述方案都不行

作为最后的选择，可以使用纯 JavaScript 的 SQLite 实现（无需编译）：

1. 修改 `backend/package.json`：

```json
{
  "dependencies": {
    "sql.js": "^1.8.0"  // 替代 better-sqlite3
  }
}
```

2. 修改数据库连接代码（需要适配 sql.js 的 API）

---

**推荐优先尝试方案 1（使用 npm），这是最简单快速的解决方案。**
