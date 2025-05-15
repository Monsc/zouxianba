import { Link } from 'react-router-dom'
import { Menu } from '@headlessui/react'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'

export default function Header() {
  const { user } = useAuth()
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="mx-auto w-full max-w-[600px] flex items-center justify-between h-14 px-2 sm:px-4">
        {/* 左侧：Logo + 登录/注册或头像 */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-xl font-bold text-primary-600">
            走线吧
          </Link>
          {!user ? (
            <>
              <Link to="/login" className="text-primary-600 px-3 py-1 rounded hover:bg-primary-50">登录</Link>
              <Link to="/register" className="ml-2 text-primary-600 px-3 py-1 rounded hover:bg-primary-50">注册</Link>
            </>
          ) : (
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="h-7 w-7 rounded-full object-cover border border-gray-200" />
                ) : (
                  <UserCircleIcon className="h-7 w-7 text-gray-400 hover:text-primary-600 transition-colors" />
                )}
              </Menu.Button>
              <Menu.Items className="absolute left-0 mt-2 w-44 bg-white border border-gray-100 rounded-md py-1 shadow-lg z-10">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/profile"
                      className={`$${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
                    >
                      个人中心
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/settings"
                      className={`$${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
                    >
                      设置
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`$${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm text-gray-700`}
                      onClick={() => window.location.href = '/login'}
                    >
                      退出登录
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          )}
        </div>
        {/* 右侧预留空间 */}
        <div></div>
      </div>
    </header>
  )
} 