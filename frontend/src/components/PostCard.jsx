import { Link } from 'react-router-dom';

export default function PostCard({ post, showAuthor = true, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return '刚刚';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} 分钟前`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} 小时前`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} 天前`;

    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      {/* 作者信息 */}
      {showAuthor && (
        <div className="flex items-center justify-between mb-3">
          <Link
            to={`/profile/${post.username}`}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {post.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{post.username}</p>
              <p className="text-sm text-gray-500">{formatDate(post.created_at)}</p>
            </div>
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(post.id)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              删除
            </button>
          )}
        </div>
      )}

      {/* 帖子内容 */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {post.title}
        </h3>
        <p className="text-gray-700 whitespace-pre-wrap line-clamp-3">
          {post.content}
        </p>
      </div>

      {/* 时间（如果不显示作者） */}
      {!showAuthor && (
        <p className="text-sm text-gray-500 mt-3">{formatDate(post.created_at)}</p>
      )}
    </div>
  );
}
