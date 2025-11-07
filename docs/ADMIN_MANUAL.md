# 管理系统操作手册

**项目**: 私密圈论坛系统
**角色**: 系统管理员

---

## 重要说明

**本项目未包含图形化的后台管理系统**。所有管理操作必须通过直接操作 SQLite 数据库或使用命令行工具完成。

---

## 1. 数据库直接操作

### 1.1 连接数据库

**开发环境**:
```bash
sqlite3 main.db
```

**生产环境**:
```bash
sqlite3 /var/www/forum/prod.db
```

### 1.2 常用 SQL 命令

#### 查看所有用户

```sql
SELECT id, username, created_at FROM users;
```

#### 查看用户详情

```sql
SELECT * FROM users WHERE username = 'alice';
```

#### 删除违规用户

```sql
-- 先查看用户信息
SELECT * FROM users WHERE username = 'baduser';

-- 删除用户（会自动删除关联的帖子和关注关系）
DELETE FROM users WHERE username = 'baduser';
```

#### 查看所有帖子

```sql
SELECT p.id, p.title, u.username, p.created_at
FROM posts p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC
LIMIT 20;
```

#### 删除违规帖子

```sql
-- 先查看帖子内容
SELECT * FROM posts WHERE id = 123;

-- 删除帖子
DELETE FROM posts WHERE id = 123;
```

#### 查看关注关系

```sql
SELECT
    u1.username as follower,
    u2.username as following
FROM follows f
JOIN users u1 ON f.follower_id = u1.id
JOIN users u2 ON f.following_id = u2.id;
```

#### 查看用户统计

```sql
-- 总用户数
SELECT COUNT(*) as total_users FROM users;

-- 总帖子数
SELECT COUNT(*) as total_posts FROM posts;

-- 总关注关系数
SELECT COUNT(*) as total_follows FROM follows;

-- 最活跃用户（发帖数）
SELECT u.username, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
GROUP BY u.id
ORDER BY post_count DESC
LIMIT 10;
```

---

## 2. 用户管理

### 2.1 封禁用户（软删除）

如果需要保留用户数据但禁止登录，可以修改密码：

```sql
UPDATE users
SET password_hash = 'BANNED'
WHERE username = 'baduser';
```

### 2.2 重置用户密码

生成新的密码哈希（使用 Node.js）：

```bash
node -e "console.log(require('bcryptjs').hashSync('newpassword123', 10))"
```

然后更新数据库：

```sql
UPDATE users
SET password_hash = '<生成的哈希值>'
WHERE username = 'alice';
```

---

## 3. 数据库维护

### 3.1 数据库备份

```bash
# 备份
cp /var/www/forum/prod.db /var/www/forum/backups/prod_$(date +%Y%m%d).db

# 压缩备份
gzip /var/www/forum/backups/prod_$(date +%Y%m%d).db
```

### 3.2 数据库恢复

```bash
# 停止后端服务
pm2 stop forum-api

# 恢复数据库
cp /var/www/forum/backups/prod_20250106.db /var/www/forum/prod.db

# 重启服务
pm2 start forum-api
```

### 3.3 数据库优化

```bash
sqlite3 /var/www/forum/prod.db "VACUUM;"
```

### 3.4 数据库完整性检查

```bash
sqlite3 /var/www/forum/prod.db "PRAGMA integrity_check;"
```

---

## 4. 日志管理

### 4.1 查看 PM2 日志

```bash
pm2 logs forum-api --lines 100
```

### 4.2 查看 Nginx 访问日志

```bash
sudo tail -f /var/log/nginx/access.log
```

### 4.3 查看 Nginx 错误日志

```bash
sudo tail -f /var/log/nginx/error.log
```

---

## 5. 系统监控

### 5.1 查看进程状态

```bash
pm2 status
```

### 5.2 查看系统资源

```bash
pm2 monit
```

### 5.3 查看数据库文件大小

```bash
ls -lh /var/www/forum/prod.db
```

---

## 6. 紧急处理

### 6.1 服务器响应缓慢

1. 检查数据库文件大小
2. 运行 `VACUUM` 优化数据库
3. 重启 PM2 进程：`pm2 restart forum-api`
4. 检查服务器资源：`top` 或 `htop`

### 6.2 数据库损坏

1. 停止服务
2. 从备份恢复数据库
3. 运行完整性检查
4. 重启服务

### 6.3 大量垃圾内容

```sql
-- 批量删除某时间段的帖子
DELETE FROM posts
WHERE created_at BETWEEN '2025-01-01' AND '2025-01-02';

-- 批量删除包含关键词的帖子
DELETE FROM posts
WHERE content LIKE '%垃圾关键词%';
```

---

## 7. 使用 DB Browser for SQLite（图形界面）

下载：https://sqlitebrowser.org/

1. 打开 DB Browser
2. File → Open Database
3. 选择 `prod.db`
4. 可视化查看和编辑数据

---

**安全提示**:
- 所有数据库操作前务必备份
- 谨慎使用 DELETE 命令
- 定期监控数据库大小和性能
