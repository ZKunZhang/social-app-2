# Ubuntu Server 生产环境部署手册

**项目**: 私密圈论坛系统
**系统**: Ubuntu 20.04/22.04 LTS
**环境**: 生产环境

---

## 1. 服务器准备

### 1.1 系统更新

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 安装必要软件

```bash
# Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# pnpm
npm install -g pnpm

# Nginx
sudo apt install -y nginx

# PM2
npm install -g pm2

# Git
sudo apt install -y git

# SQLite (可选，用于数据库查看)
sudo apt install -y sqlite3
```

**技术栈说明**：

本项目使用 **sql.js**（SQLite 的纯 JavaScript 实现），无需安装 SQLite 原生二进制文件或编译工具。sql.js 是跨平台的纯 JavaScript 解决方案，避免了 better-sqlite3 等原生模块的编译问题。

---

## 2. 部署项目

### 2.1 创建部署目录

```bash
sudo mkdir -p /var/www/forum
sudo chown -R $USER:$USER /var/www/forum
cd /var/www/forum
```

### 2.2 克隆项目

```bash
git clone <your-repo-url> .
```

### 2.3 安装依赖

```bash
# 后端
cd /var/www/forum/backend
pnpm install --production

# 前端
cd /var/www/forum/frontend
pnpm install
```

### 2.4 配置后端

```bash
cd /var/www/forum/backend
cp .env.example .env
nano .env
```

修改配置：

```env
PORT=3000
NODE_ENV=production
JWT_SECRET=<生成一个强随机密钥>
DATABASE_PATH=/var/www/forum/prod.db
```

### 2.5 初始化数据库

```bash
cd /var/www/forum/backend
pnpm db:init
```

### 2.6 构建前端

```bash
cd /var/www/forum/frontend
pnpm build
# 构建产物在 dist/ 目录
```

---

## 3. 使用 PM2 管理后端进程

### 3.1 启动后端

```bash
cd /var/www/forum/backend
pm2 start src/index.js --name "forum-api"
```

### 3.2 设置开机自启

```bash
pm2 startup
pm2 save
```

### 3.3 PM2 常用命令

```bash
pm2 list              # 查看所有进程
pm2 logs forum-api    # 查看日志
pm2 restart forum-api # 重启
pm2 stop forum-api    # 停止
pm2 delete forum-api  # 删除
```

---

## 4. 配置 Nginx

### 4.1 创建配置文件

```bash
sudo nano /etc/nginx/sites-available/forum
```

### 4.2 Nginx 配置

```nginx
# HTTP (重定向到 HTTPS)
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL 证书 (使用 Certbot 获取)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # API 反向代理 (后端)
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # React 静态文件 (前端)
    location / {
        root /var/www/forum/frontend/dist;
        try_files $uri $uri/ /index.html;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4.3 启用站点

```bash
sudo ln -s /etc/nginx/sites-available/forum /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 5. 获取 SSL 证书（Let's Encrypt）

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

自动续期：

```bash
sudo certbot renew --dry-run
```

---

## 6. 防火墙配置

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

## 7. 维护和更新

### 7.1 更新代码

```bash
cd /var/www/forum
git pull

# 更新后端
cd backend
pnpm install --production
pm2 restart forum-api

# 重新构建前端
cd ../frontend
pnpm install
pnpm build

# 重启 Nginx
sudo systemctl restart nginx
```

### 7.2 数据库备份

```bash
# 每日备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp /var/www/forum/prod.db /var/www/forum/backups/prod_$DATE.db

# 保留最近 7 天的备份
find /var/www/forum/backups/ -name "prod_*.db" -mtime +7 -delete
```

### 7.3 日志查看

```bash
# PM2 日志
pm2 logs forum-api

# Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 8. 常见问题

### 8.1 数据库初始化失败（sql.js 相关）

**错误信息**：

```
Error: Database not initialized
```

**解决方案**：

这是使用 sql.js 的正常行为。确保在使用数据库前调用了 `initDB()`：

```javascript
await initDB();  // 异步初始化
```

如果问题持续，删除数据库文件后重新运行：

```bash
cd /var/www/forum/backend
rm ../prod.db
pnpm db:init
```

### 8.2 端口被占用

**错误信息**：

```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案**：

查找占用端口的进程：

```bash
sudo lsof -i :3000
```

终止进程：

```bash
sudo kill -9 <PID>
```

或修改 `.env` 中的 `PORT` 为其他端口。

### 8.3 前端开发端口说明

**重要提示**：前端开发服务器端口已从默认的 5173 改为 5100。

如需修改，编辑 `frontend/vite.config.js`：

```javascript
export default defineConfig({
  server: {
    port: 5100,  // 修改为你需要的端口
  },
})
```

同时更新后端 `.env` 中的 CORS 配置：

```env
ALLOWED_ORIGINS=http://localhost:5100,http://localhost:3000,https://your-domain.com
```

**生产环境无需此配置**，因为前端会构建为静态文件并通过 Nginx 提供服务。

### 8.4 PM2 进程启动失败

**错误信息**：

```
Error: Cannot find module 'xxx'
```

**解决方案**：

确保在 production 模式下安装了所有依赖：

```bash
cd /var/www/forum/backend
pnpm install --production
pm2 restart forum-api
```

### 8.5 Nginx 502 Bad Gateway

**可能原因**：

1. 后端服务未启动
2. 端口配置错误
3. 防火墙阻止

**解决方案**：

```bash
# 检查后端是否运行
pm2 list

# 检查后端日志
pm2 logs forum-api

# 检查 Nginx 配置
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

### 8.6 数据库文件权限问题

**错误信息**：

```
Error: EACCES: permission denied
```

**解决方案**：

确保数据库文件有正确权限：

```bash
sudo chown -R $USER:$USER /var/www/forum
chmod 644 /var/www/forum/prod.db
```

---

## 9. 性能优化

- 使用 PM2 cluster 模式
- 启用 Nginx gzip 压缩
- 配置 CDN
- 数据库定期 VACUUM

---

**部署完成！** 访问 `https://your-domain.com` 查看应用。
