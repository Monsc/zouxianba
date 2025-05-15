import { useState } from 'react'
import PostCard from '../components/PostCard'

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

export default function Home() {
  const [posts] = useState<Post[]>([
    {
      id: '1',
      author: {
        id: '1',
        name: '张三',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
      },
      content: '今天天气真好，准备出去走走。',
      images: ['https://picsum.photos/400/300'],
      createdAt: '2024-03-20T10:00:00Z',
      likes: 42,
      comments: 5,
      shares: 2,
    },
    // 更多示例数据...
  ])

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
} 