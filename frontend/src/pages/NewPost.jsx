import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postAPI } from '../services/api';
import Navbar from '../components/Navbar';

export default function NewPost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (title.trim() === '' || content.trim() === '') {
      setError('标题和内容不能为空');
      return;
    }

    try {
      setLoading(true);
      await postAPI.createPost(title, content);
      navigate('/'); // 发布成功后跳转到首页
    } catch (err) {
      setError(err.response?.data?.message || '发布失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container-custom py-8">
        <div className="max-w-3xl mx-auto">
          <div className="card">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">发布新帖子</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  标题
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="给你的帖子起个标题..."
                  className="input"
                  maxLength={200}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {title.length} / 200
                </p>
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  内容
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="分享你的想法..."
                  className="input min-h-[300px] resize-y"
                  maxLength={10000}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {content.length} / 10000
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>提示：</strong>你的帖子只会对与你互关的好友可见。
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex-1"
                >
                  {loading ? '发布中...' : '发布帖子'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn btn-secondary"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
