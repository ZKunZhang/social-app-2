const { getDatabase } = require('../db/connection');

/**
 * 获取当前用户的 Feed 流
 * 只显示与当前用户互关的人的帖子
 */
function getFeed(userId, limit = 20, offset = 0) {
  const db = getDatabase();

  const posts = db.prepare(`
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
      WHERE f1.follower_id = ?
        AND f1.following_id = p.user_id
    )
    AND EXISTS (
      -- 发帖者也关注了当前用户（互关条件）
      SELECT 1 FROM follows f2
      WHERE f2.follower_id = p.user_id
        AND f2.following_id = ?
    )
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all(userId, userId, limit, offset);

  return posts;
}

/**
 * 获取 Feed 流的总数（用于分页）
 */
function getFeedCount(userId) {
  const db = getDatabase();

  const result = db.prepare(`
    SELECT COUNT(*) as total
    FROM posts p
    WHERE EXISTS (
      SELECT 1 FROM follows f1
      WHERE f1.follower_id = ?
        AND f1.following_id = p.user_id
    )
    AND EXISTS (
      SELECT 1 FROM follows f2
      WHERE f2.follower_id = p.user_id
        AND f2.following_id = ?
    )
  `).get(userId, userId);

  return result.total;
}

module.exports = {
  getFeed,
  getFeedCount,
};
