import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'

export default function BottomNav() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 block md:hidden overflow-hidden">
      <div className="mx-auto w-full max-w-[600px] px-0">
        <div className="flex justify-around items-center h-14">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center ${
              isActive('/') ? 'text-primary-600' : 'text-gray-400'
            } hover:bg-primary-50 hover:text-primary-700 transition-colors rounded-full w-12 h-12`}
          >
            <HomeIcon className="h-7 w-7" style={{ width: 28, height: 28 }} />
          </Link>

          <Link
            to="/search"
            className={`flex flex-col items-center justify-center ${
              isActive('/search') ? 'text-primary-600' : 'text-gray-400'
            } hover:bg-primary-50 hover:text-primary-700 transition-colors rounded-full w-12 h-12`}
          >
            <MagnifyingGlassIcon className="h-7 w-7" style={{ width: 28, height: 28 }} />
          </Link>

          <Link
            to="/notifications"
            className={`flex flex-col items-center justify-center ${
              isActive('/notifications') ? 'text-primary-600' : 'text-gray-400'
            } hover:bg-primary-50 hover:text-primary-700 transition-colors rounded-full w-12 h-12`}
          >
            <BellIcon className="h-7 w-7" style={{ width: 28, height: 28 }} />
          </Link>

          <Link
            to="/messages"
            className={`flex flex-col items-center justify-center ${
              isActive('/messages') ? 'text-primary-600' : 'text-gray-400'
            } hover:bg-primary-50 hover:text-primary-700 transition-colors rounded-full w-12 h-12`}
          >
            <ChatBubbleLeftRightIcon className="h-7 w-7" style={{ width: 28, height: 28 }} />
          </Link>
        </div>
      </div>
    </nav>
  )
} 