export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">页面未找到</p>
      <a href="/" className="px-6 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors">返回首页</a>
    </div>
  )
} 