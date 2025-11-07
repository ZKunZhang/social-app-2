import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">私</span>
            </div>
            <span className="text-xl font-bold text-gray-900">私密圈</span>
          </Link>

          {/* 导航链接 */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-6">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                首页
              </Link>
              <Link
                to="/search"
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                搜索
              </Link>
              <Link
                to="/new-post"
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                发帖
              </Link>
              <Link
                to={`/profile/${user.username}`}
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                我的主页
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
              >
                退出登录
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="btn btn-outline">
                登录
              </Link>
              <Link to="/register" className="btn btn-primary">
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
