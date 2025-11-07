const { getDatabase } = require('../db/connection');
const { checkMutualFollow } = require('./userService');

/**
 * 创建新帖子
 */
function createPost(userId, title, content) {
  const db = getDatabase();

  const result = db.prepare(`
    INSERT INTO posts (user_id, title, content)
    VALUES (?, ?, ?)
  `).run(userId, title, content);

  return {
    id: result.lastInsertRowid,
    user_id: userId,
    title,
    content,
    created_at: new Date().toISOString(),
  };
}

/**
 * 获取帖子详情（需验证权限）
 */
function getPostById(postId, currentUserId = null) {
  const db = getDatabase();

  const post = db.prepare(`
    SELECT
      p.id,
      p.title,
      p.content,
      p.created_at,
      p.updated_at,
      p.user_id,
      u.username
    FROM posts p
    INNER JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `).get(postId);

  if (!post) {
    return null;
  }

  // 如果请求者不是作者，需要检查是否互关
  if (currentUserId && currentUserId !== post.user_id) {
    const isMutual = checkMutualFollow(currentUserId, post.user_id);
    if (!isMutual) {
      throw new Error('无权访问此帖子：你们需要相互关注');
    }
  }

  return post;
}

/**
 * 获取指定用户的帖子列表（需验证互关）
 */
function getPostsByUsername(username, currentUserId, limit = 20, offset = 0) {
  const db = getDatabase();

  // 先获取目标用户
  const targetUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);

  if (!targetUser) {
    throw new Error('用户不存在');
  }

  // 如果不是查看自己的帖子，需要验证互关
  if (currentUserId !== targetUser.id) {
    const isMutual = checkMutualFollow(currentUserId, targetUser.id);
    if (!isMutual) {
      throw new Error('无权访问：你们需要相互关注才能查看对方的帖子');
    }
  }

  // 获取帖子列表
  const posts = db.prepare(`
    SELECT
      p.id,
      p.title,
      p.content,
      p.created_at,
      p.updated_at
    FROM posts p
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all(targetUser.id, limit, offset);

  return posts;
}

/**
 * 删除帖子（仅作者可删除）
 */
function deletePost(postId, userId) {
  const db = getDatabase();

  // 先检查帖子是否存在且属于当前用户
  const post = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(postId);

  if (!post) {
    throw new Error('帖子不存在');
  }

  if (post.user_id !== userId) {
    throw new Error('无权删除此帖子');
  }

  // 删除帖子
  db.prepare('DELETE FROM posts WHERE id = ?').run(postId);

  return { success: true };
}

/**
 * 获取用户自己的所有帖子
 */
function getMyPosts(userId, limit = 20, offset = 0) {
  const db = getDatabase();

  const posts = db.prepare(`
    SELECT
      p.id,
      p.title,
      p.content,
      p.created_at,
      p.updated_at
    FROM posts p
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all(userId, limit, offset);

  return posts;
}

module.exports = {
  createPost,
  getPostById,
  getPostsByUsername,
  deletePost,
  getMyPosts,
};
