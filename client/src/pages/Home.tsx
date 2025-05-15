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
    {
      id: '2',
      author: {
        id: '2',
        name: '李四',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
      },
      content: '刚看完一本好书，推荐给大家！',
      images: ['https://picsum.photos/400/301'],
      createdAt: '2024-03-19T15:30:00Z',
      likes: 15,
      comments: 3,
      shares: 1,
    },
    {
      id: '3',
      author: {
        id: '3',
        name: '王五',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
      },
      content: '分享一张我拍的风景照。',
      images: ['https://picsum.photos/400/302'],
      createdAt: '2024-03-18T08:20:00Z',
      likes: 30,
      comments: 8,
      shares: 4,
    },
    {
      id: '4',
      author: {
        id: '4',
        name: '小明',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
      },
      content: '今天学习了React，感觉很有趣！',
      images: [],
      createdAt: '2024-03-17T12:00:00Z',
      likes: 18,
      comments: 2,
      shares: 0,
    },
    {
      id: '5',
      author: {
        id: '5',
        name: '小红',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
      },
      content: '午饭吃了什么？大家推荐下附近的美食吧！',
      images: ['https://picsum.photos/400/303'],
      createdAt: '2024-03-16T11:45:00Z',
      likes: 25,
      comments: 6,
      shares: 3,
    },
    {
      id: '6',
      author: {
        id: '6',
        name: '程序猿',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6',
      },
      content: '写代码遇到bug，在线等，挺急的。',
      images: [],
      createdAt: '2024-03-15T09:10:00Z',
      likes: 12,
      comments: 7,
      shares: 1,
    },
  ])

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
} 