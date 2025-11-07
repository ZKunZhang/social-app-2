import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api', // 通过 Vite 代理转发到后端
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：自动添加 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // 401 未授权：清除 token 并跳转到登录页
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== 认证 API ====================

export const authAPI = {
  // 注册
  register: (username, password) =>
    api.post('/auth/register', { username, password }),

  // 登录
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
};

// ==================== 用户 API ====================

export const userAPI = {
  // 搜索用户
  searchUsers: (query) =>
    api.get('/users/search', { params: { q: query } }),

  // 获取用户信息
  getUserProfile: (username) =>
    api.get(`/users/${username}`),

  // 关注用户
  followUser: (username) =>
    api.post(`/users/${username}/follow`),

  // 取消关注
  unfollowUser: (username) =>
    api.delete(`/users/${username}/follow`),

  // 获取互关好友列表
  getMutualFollows: () =>
    api.get('/users/me/mutual-follows'),
};

// ==================== 帖子 API ====================

export const postAPI = {
  // 创建帖子
  createPost: (title, content) =>
    api.post('/posts', { title, content }),

  // 获取帖子详情
  getPostById: (postId) =>
    api.get(`/posts/${postId}`),

  // 删除帖子
  deletePost: (postId) =>
    api.delete(`/posts/${postId}`),

  // 获取指定用户的帖子
  getUserPosts: (username, limit = 20, offset = 0) =>
    api.get(`/users/${username}/posts`, { params: { limit, offset } }),
};

// ==================== Feed API ====================

export const feedAPI = {
  // 获取 Feed 流
  getFeed: (limit = 20, offset = 0) =>
    api.get('/feed', { params: { limit, offset } }),
};

export default api;
