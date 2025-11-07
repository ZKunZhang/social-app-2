import { useState } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (query.trim() === '') return;

    try {
      setLoading(true);
      const response = await userAPI.searchUsers(query);
      setResults(response.data.users);
      setSearched(true);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (username, isFollowing) => {
    try {
      if (isFollowing) {
        await userAPI.unfollowUser(username);
      } else {
        await userAPI.followUser(username);
      }

      // 更新结果列表
      setResults((prev) =>
        prev.map((user) =>
          user.username === username
            ? { ...user, is_following: !isFollowing }
            : user
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || '操作失败');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container-custom py-8">
        <div className="max-w-3xl mx-auto">
          {/* 搜索框 */}
          <div className="card mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">搜索用户</h1>
            <form onSubmit={handleSearch} className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="输入用户名搜索..."
                className="input flex-1"
              />
              <button type="submit" className="btn btn-primary">
                搜索
              </button>
            </form>
          </div>

          {/* 加载状态 */}
          {loading && <Loading text="搜索中..." />}

          {/* 搜索结果 */}
          {!loading && searched && (
            <>
              {results.length === 0 ? (
                <EmptyState
                  icon="🔍"
                  title="没有找到用户"
                  description="试试其他关键词吧"
                />
              ) : (
                <div className="space-y-4">
                  {results.map((user) => (
                    <div key={user.id} className="card">
                      <div className="flex items-center justify-between">
                        <Link
                          to={`/profile/${user.username}`}
                          className="flex items-center space-x-4 flex-1 hover:opacity-80 transition-opacity"
                        >
                          <div className="w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xl">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {user.username}
                            </p>
                            {user.bio && (
                              <p className="text-sm text-gray-600 mt-1">{user.bio}</p>
                            )}
                            <div className="flex gap-2 mt-1">
                              {user.is_mutual && (
                                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                                  互关
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                        <button
                          onClick={() => handleFollow(user.username, user.is_following)}
                          className={`btn ${
                            user.is_following ? 'btn-secondary' : 'btn-primary'
                          }`}
                        >
                          {user.is_following ? '已关注' : '关注'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
