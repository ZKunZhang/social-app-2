const { getDatabase } = require('../db/connection');

/**
 * 搜索用户（按用户名模糊查询）
 */
function searchUsers(query, currentUserId, limit = 20) {
  const db = getDatabase();

  const users = db.prepare(`
    SELECT
      u.id,
      u.username,
      u.bio,
      u.created_at,
      EXISTS(
        SELECT 1 FROM follows
        WHERE follower_id = ? AND following_id = u.id
      ) as is_following,
      EXISTS(
        SELECT 1 FROM follows f1
        WHERE f1.follower_id = ?
          AND f1.following_id = u.id
          AND EXISTS(
            SELECT 1 FROM follows f2
            WHERE f2.follower_id = u.id AND f2.following_id = ?
          )
      ) as is_mutual
    FROM users u
    WHERE u.username LIKE ? AND u.id != ?
    ORDER BY u.username
    LIMIT ?
  `).all(currentUserId, currentUserId, currentUserId, `%${query}%`, currentUserId, limit);

  return users.map(user => ({
    id: user.id,
    username: user.username,
    bio: user.bio,
    created_at: user.created_at,
    is_following: Boolean(user.is_following),
    is_mutual: Boolean(user.is_mutual),
  }));
}

/**
 * 获取用户信息（包括关注状态）
 */
function getUserByUsername(username, currentUserId = null) {
  const db = getDatabase();

  let user;

  if (currentUserId) {
    // 如果有当前用户，查询关注状态
    user = db.prepare(`
      SELECT
        u.id,
        u.username,
        u.bio,
        u.created_at,
        (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
        EXISTS(
          SELECT 1 FROM follows
          WHERE follower_id = ? AND following_id = u.id
        ) as is_following,
        EXISTS(
          SELECT 1 FROM follows f1
          WHERE f1.follower_id = ?
            AND f1.following_id = u.id
            AND EXISTS(
              SELECT 1 FROM follows f2
              WHERE f2.follower_id = u.id AND f2.following_id = ?
            )
        ) as is_mutual
      FROM users u
      WHERE u.username = ?
    `).get(currentUserId, currentUserId, currentUserId, username);
  } else {
    // 公开信息
    user = db.prepare(`
      SELECT
        u.id,
        u.username,
        u.bio,
        u.created_at,
        (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count
      FROM users u
      WHERE u.username = ?
    `).get(username);
  }

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    bio: user.bio,
    created_at: user.created_at,
    following_count: user.following_count,
    followers_count: user.followers_count,
    is_following: currentUserId ? Boolean(user.is_following) : undefined,
    is_mutual: currentUserId ? Boolean(user.is_mutual) : undefined,
  };
}

/**
 * 关注用户
 */
function followUser(followerId, followingUsername) {
  const db = getDatabase();

  // 获取被关注用户的ID
  const targetUser = db.prepare('SELECT id FROM users WHERE username = ?').get(followingUsername);

  if (!targetUser) {
    throw new Error('用户不存在');
  }

  if (followerId === targetUser.id) {
    throw new Error('不能关注自己');
  }

  // 检查是否已经关注
  const existingFollow = db.prepare(`
    SELECT id FROM follows
    WHERE follower_id = ? AND following_id = ?
  `).get(followerId, targetUser.id);

  if (existingFollow) {
    throw new Error('已经关注过该用户');
  }

  // 创建关注关系
  db.prepare(`
    INSERT INTO follows (follower_id, following_id)
    VALUES (?, ?)
  `).run(followerId, targetUser.id);

  // 检查是否形成互关
  const isMutual = checkMutualFollow(followerId, targetUser.id);

  return {
    success: true,
    is_mutual: isMutual,
  };
}

/**
 * 取消关注
 */
function unfollowUser(followerId, followingUsername) {
  const db = getDatabase();

  // 获取被取消关注用户的ID
  const targetUser = db.prepare('SELECT id FROM users WHERE username = ?').get(followingUsername);

  if (!targetUser) {
    throw new Error('用户不存在');
  }

  // 删除关注关系
  const result = db.prepare(`
    DELETE FROM follows
    WHERE follower_id = ? AND following_id = ?
  `).run(followerId, targetUser.id);

  if (result.changes === 0) {
    throw new Error('未关注该用户');
  }

  return {
    success: true,
  };
}

/**
 * 检查两个用户是否互关
 */
function checkMutualFollow(userAId, userBId) {
  const db = getDatabase();

  const result = db.prepare(`
    SELECT COUNT(*) as is_mutual
    FROM follows f1
    WHERE f1.follower_id = ?
      AND f1.following_id = ?
      AND EXISTS (
        SELECT 1 FROM follows f2
        WHERE f2.follower_id = ?
          AND f2.following_id = ?
      )
  `).get(userAId, userBId, userBId, userAId);

  return result.is_mutual === 1;
}

/**
 * 获取用户的互关好友列表
 */
function getMutualFollows(userId, limit = 50) {
  const db = getDatabase();

  const mutualFollows = db.prepare(`
    SELECT u.id, u.username, u.bio
    FROM users u
    INNER JOIN follows f1 ON u.id = f1.following_id
    WHERE f1.follower_id = ?
      AND EXISTS (
        SELECT 1 FROM follows f2
        WHERE f2.follower_id = u.id
          AND f2.following_id = ?
      )
    ORDER BY f1.created_at DESC
    LIMIT ?
  `).all(userId, userId, limit);

  return mutualFollows;
}

module.exports = {
  searchUsers,
  getUserByUsername,
  followUser,
  unfollowUser,
  checkMutualFollow,
  getMutualFollows,
};
