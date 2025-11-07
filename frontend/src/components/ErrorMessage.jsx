export default function ErrorMessage({ message, retry }) {
  return (
    <div className="card bg-red-50 border border-red-200">
      <div className="flex items-start space-x-3">
        <svg
          className="w-6 h-6 text-red-600 flex-shrink-0"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <p className="text-red-800 font-medium">出错了</p>
          <p className="text-red-700 mt-1">{message}</p>
          {retry && (
            <button
              onClick={retry}
              className="mt-3 text-red-600 hover:text-red-800 underline"
            >
              重试
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
