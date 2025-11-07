const userService = require('../services/userService');

/**
 * 搜索用户
 */
async function searchUsers(req, res, next) {
  try {
    const { q } = req.query;
    const currentUserId = req.user.id;

    if (!q || q.trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: '搜索关键词不能为空',
      });
    }

    const users = userService.searchUsers(q, currentUserId);

    res.json({
      users,
      count: users.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 获取用户信息
 */
async function getUserProfile(req, res, next) {
  try {
    const { username } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    const user = userService.getUserByUsername(username, currentUserId);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: '用户不存在',
      });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
}

/**
 * 关注用户
 */
async function followUser(req, res, next) {
  try {
    const { username } = req.params;
    const followerId = req.user.id;

    const result = userService.followUser(followerId, username);

    res.json({
      message: '关注成功',
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 取消关注
 */
async function unfollowUser(req, res, next) {
  try {
    const { username } = req.params;
    const followerId = req.user.id;

    const result = userService.unfollowUser(followerId, username);

    res.json({
      message: '取消关注成功',
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 获取互关好友列表
 */
async function getMutualFollows(req, res, next) {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;

    const mutualFollows = userService.getMutualFollows(userId, limit);

    res.json({
      mutual_follows: mutualFollows,
      count: mutualFollows.length,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  searchUsers,
  getUserProfile,
  followUser,
  unfollowUser,
  getMutualFollows,
};
