const feedService = require('../services/feedService');

/**
 * 获取 Feed 流
 */
async function getFeed(req, res, next) {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const posts = feedService.getFeed(userId, limit, offset);
    const total = feedService.getFeedCount(userId);

    res.json({
      posts,
      count: posts.length,
      total,
      has_more: offset + posts.length < total,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getFeed,
};
