import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  ArrowPathRoundedSquareIcon,
} from '@heroicons/react/24/outline'

interface Post {
  id: string
  author: {
    id: string
    name: string
    avatar: string
  }
  content: string
  images?: string[]
  createdAt: string
  likes: number
  comments: number
  shares: number
}

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isCommented, setIsCommented] = useState(false)
  const [isShared, setIsShared] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <article className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 w-full max-w-[600px] mx-auto shadow-sm">
      {/* 头像+用户名+时间 行内紧凑 */}
      <div className="flex items-center mb-1">
        <img
          src={post.author.avatar}
          alt={post.author.name}
          className="w-10 h-10 rounded-full border border-gray-200 object-cover mr-3"
          style={{ width: 40, height: 40, minWidth: 40, minHeight: 40, maxWidth: 40, maxHeight: 40 }}
          onError={e => { (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default' }}
        />
        <Link
          to={`/profile/${post.author.id}`}
          className="font-bold text-gray-900 hover:underline text-[15px] mr-2"
        >
          {post.author.name}
        </Link>
        <span className="text-xs text-gray-400">
          {formatDate(post.createdAt)}
        </span>
      </div>

      {/* 内容 */}
      <p className="text-gray-900 mb-2 text-[15px] break-words whitespace-pre-line leading-relaxed">
        {post.content}
      </p>

      {/* 图片 */}
      {post.images && post.images.length > 0 && (
        <div className="mb-2">
          <img
            src={post.images[0]}
            alt="Post image"
            className="rounded-2xl w-full object-cover border border-gray-100 max-h-80"
            style={{ maxHeight: 320 }}
          />
        </div>
      )}

      {/* 互动按钮 横向排列紧凑 */}
      <div className="flex justify-between items-center text-gray-500 select-none mt-1">
        <button
          onClick={() => setIsLiked(!isLiked)}
          className={`flex items-center space-x-1 px-2 py-1 rounded-full hover:bg-primary-50 transition-colors text-sm ${isLiked ? 'text-primary-600 bg-primary-100' : ''}`}
        >
          <HeartIcon className="h-5 w-5" />
          <span>{post.likes}</span>
        </button>
        <button
          onClick={() => setIsCommented(!isCommented)}
          className={`flex items-center space-x-1 px-2 py-1 rounded-full hover:bg-primary-50 transition-colors text-sm ${isCommented ? 'text-primary-600 bg-primary-100' : ''}`}
        >
          <ChatBubbleLeftIcon className="h-5 w-5" />
          <span>{post.comments}</span>
        </button>
        <button
          onClick={() => setIsShared(!isShared)}
          className={`flex items-center space-x-1 px-2 py-1 rounded-full hover:bg-primary-50 transition-colors text-sm ${isShared ? 'text-primary-600 bg-primary-100' : ''}`}
        >
          <ArrowPathRoundedSquareIcon className="h-5 w-5" />
          <span>{post.shares}</span>
        </button>
      </div>
    </article>
  )
} 