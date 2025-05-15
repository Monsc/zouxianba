import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'
import CreatePostButton from './CreatePostButton'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1 flex justify-center w-full">
        <div className="w-full max-w-[600px] px-2 sm:px-4 py-4 pb-20">
          <Outlet />
        </div>
      </main>
      <CreatePostButton />
      {/* BottomNav 仅移动端显示 */}
      <div className="block md:hidden">
        <BottomNav />
      </div>
    </div>
  )
} 