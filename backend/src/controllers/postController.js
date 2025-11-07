const postService = require('../services/postService');

/**
 * 创建帖子
 */
async function createPost(req, res, next) {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    const post = postService.createPost(userId, title, content);

    res.status(201).json({
      message: '帖子发布成功',
      post,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 获取帖子详情
 */
async function getPostById(req, res, next) {
  try {
    const { id } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    const post = postService.getPostById(parseInt(id), currentUserId);

    if (!post) {
      return res.status(404).json({
        error: 'Not Found',
        message: '帖子不存在',
      });
    }

    res.json({ post });
  } catch (error) {
    if (error.message.includes('无权访问')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: error.message,
      });
    }
    next(error);
  }
}

/**
 * 获取指定用户的帖子列表
 */
async function getUserPosts(req, res, next) {
  try {
    const { username } = req.params;
    const currentUserId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const posts = postService.getPostsByUsername(username, currentUserId, limit, offset);

    res.json({
      posts,
      count: posts.length,
    });
  } catch (error) {
    if (error.message.includes('无权访问')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: error.message,
      });
    }
    next(error);
  }
}

/**
 * 删除帖子
 */
async function deletePost(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    postService.deletePost(parseInt(id), userId);

    res.json({
      message: '帖子删除成功',
    });
  } catch (error) {
    if (error.message.includes('无权删除')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: error.message,
      });
    }
    next(error);
  }
}

/**
 * 获取我的帖子
 */
async function getMyPosts(req, res, next) {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const posts = postService.getMyPosts(userId, limit, offset);

    res.json({
      posts,
      count: posts.length,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPost,
  getPostById,
  getUserPosts,
  deletePost,
  getMyPosts,
};
