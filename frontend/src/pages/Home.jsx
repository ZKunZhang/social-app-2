import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { feedAPI } from '../services/api';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await feedAPI.getFeed();
      setPosts(response.data.posts);
    } catch (err) {
      setError(err.response?.data?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container-custom py-8">
        <div className="max-w-3xl mx-auto">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">首页 Feed</h1>
            <p className="text-gray-600 mt-2">
              这里只显示与你互关的好友的帖子
            </p>
          </div>

          {/* 加载状态 */}
          {loading && <Loading />}

          {/* 错误状态 */}
          {error && <ErrorMessage message={error} retry={loadFeed} />}

          {/* 内容区域 */}
          {!loading && !error && (
            <>
              {posts.length === 0 ? (
                <EmptyState
                  icon="🔒"
                  title="你的 Feed 流是空的"
                  description="你还没有互关的好友，或者他们还没有发帖。去「搜索」页面关注一些人吧！"
                  action={
                    <Link to="/search" className="btn btn-primary">
                      去搜索用户
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} showAuthor={true} />
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
