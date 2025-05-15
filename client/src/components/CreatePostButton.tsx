import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

export default function CreatePostButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-20 bg-primary-600 text-white rounded-full p-4 hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 z-30 shadow-none"
        style={{ boxShadow: 'none' }}
      >
        <PlusIcon className="h-6 w-6" />
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/20" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6 w-full border border-gray-100">
            {user ? (
              <>
                <Dialog.Title className="text-lg font-medium mb-4 text-gray-900">
                  说点什么？
                </Dialog.Title>
                <form className="space-y-4">
                  <div>
                    <textarea
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 focus:border-primary-400 focus:ring-primary-400 text-gray-900"
                      rows={4}
                      placeholder="分享你的想法..."
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                    >
                      发布
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <Dialog.Title className="text-lg font-medium mb-4 text-gray-900 text-center">
                  请先登录或注册
                </Dialog.Title>
                <div className="flex justify-center space-x-4">
                  <Link
                    to="/login"
                    className="px-6 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2 rounded-md bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100 transition-colors"
                  >
                    注册
                  </Link>
                </div>
              </>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  )
} 