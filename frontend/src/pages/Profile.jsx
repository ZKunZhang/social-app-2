import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userAPI, postAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();

  const [userInfo, setUserInfo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postsError, setPostsError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  const loadUserInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userAPI.getUserProfile(username);
      setUserInfo(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || '加载用户信息失败');
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      setPostsError(null);
      const response = await postAPI.getUserPosts(username);
      setPosts(response.data.posts);
    } catch (err) {
      setPostsError(err.response?.data?.message || '加载帖子失败');
    }
  };

  useEffect(() => {
    loadUserInfo();
  }, [username]);

  useEffect(() => {
    if (userInfo) {
      // 只有互关或者是自己的主页才加载帖子
      if (isOwnProfile || userInfo.is_mutual) {
        loadPosts();
      }
    }
  }, [userInfo, username]);

  const handleFollow = async () => {
    try {
      setActionLoading(true);
      if (userInfo.is_following) {
        await userAPI.unfollowUser(username);
      } else {
        await userAPI.followUser(username);
      }
      // 重新加载用户信息
      await loadUserInfo();
    } catch (err) {
      alert(err.response?.data?.message || '操作失败');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('确定要删除这篇帖子吗？')) return;

    try {
      await postAPI.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      alert(err.response?.data?.message || '删除失败');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container-custom py-8">
          <ErrorMessage message={error} retry={loadUserInfo} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container-custom py-8">
        <div className="max-w-3xl mx-auto">
          {/* 用户信息卡片 */}
          <div className="card mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-3xl">
                    {userInfo.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {userInfo.username}
                  </h1>
                  {userInfo.bio && (
                    <p className="text-gray-600 mt-1">{userInfo.bio}</p>
                  )}
                  <div className="flex gap-4 mt-3 text-sm text-gray-600">
                    <span>
                      <strong>{userInfo.following_count}</strong> 关注
                    </span>
                    <span>
                      <strong>{userInfo.followers_count}</strong> 粉丝
                    </span>
                  </div>
                </div>
              </div>

              {!isOwnProfile && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleFollow}
                    disabled={actionLoading}
                    className={`btn ${
                      userInfo.is_following ? 'btn-secondary' : 'btn-primary'
                    }`}
                  >
                    {userInfo.is_following ? '已关注' : '关注'}
                  </button>
                  {userInfo.is_mutual && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded text-center">
                      互关
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 帖子列表 */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {isOwnProfile ? '我的帖子' : `${username} 的帖子`}
            </h2>
          </div>

          {isOwnProfile || userInfo.is_mutual ? (
            <>
              {postsError ? (
                <ErrorMessage message={postsError} retry={loadPosts} />
              ) : posts.length === 0 ? (
                <EmptyState
                  icon="📝"
                  title="还没有发布任何帖子"
                  description={
                    isOwnProfile
                      ? '发布你的第一篇帖子，与互关好友分享吧！'
                      : '这位用户还没有发布任何内容'
                  }
                />
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={{ ...post, username }}
                      showAuthor={false}
                      onDelete={isOwnProfile ? handleDeletePost : null}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="card bg-gray-100 text-center py-12">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                帖子已锁定
              </h3>
              <p className="text-gray-600">
                你们需要相互关注才能查看对方的帖子
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
