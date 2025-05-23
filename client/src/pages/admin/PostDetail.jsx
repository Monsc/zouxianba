import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileText,
  MessageSquare,
  ThumbsUp,
  Eye,
  Share2,
  Flag,
  MoreVertical,
  User,
  Calendar,
  Tag,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// 模拟数据
const postData = {
  id: '1',
  title: '示例文章标题',
  content: '这是一篇示例文章的内容。这里可以包含很长的文本内容，支持富文本格式，包括图片、链接等。',
  author: {
    id: '1',
    name: '张三',
    avatar: '/avatars/1.jpg',
  },
  createdAt: '2024-03-15 14:30:00',
  updatedAt: '2024-03-16 09:15:00',
  status: 'published',
  views: 1234,
  likes: 56,
  comments: 23,
  tags: ['技术', '编程', 'React'],
  category: '技术分享',
};

const comments = [
  {
    id: '1',
    content: '这是一条评论内容',
    author: {
      id: '2',
      name: '李四',
      avatar: '/avatars/2.jpg',
    },
    createdAt: '2024-03-15 15:00:00',
    likes: 5,
  },
  {
    id: '2',
    content: '这是另一条评论内容',
    author: {
      id: '3',
      name: '王五',
      avatar: '/avatars/3.jpg',
    },
    createdAt: '2024-03-15 16:30:00',
    likes: 3,
  },
];

const relatedPosts = [
  {
    id: '2',
    title: '相关文章1',
    author: '张三',
    createdAt: '2024-03-14',
    views: 800,
  },
  {
    id: '3',
    title: '相关文章2',
    author: '李四',
    createdAt: '2024-03-13',
    views: 600,
  },
];

export default function PostDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('info');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">内容详情</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            预览
          </Button>
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            分享
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Flag className="w-4 h-4 mr-2" />
                举报
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">{postData.title}</h2>
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                {postData.author.name[0]}
              </div>
              <div>
                <p className="font-medium">{postData.author.name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(postData.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="prose max-w-none mb-4">{postData.content}</div>
            <div className="flex flex-wrap gap-2 mb-4">
              {Array.isArray(postData.tags) && postData.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {postData.views} 次浏览
              </div>
              <div className="flex items-center">
                <ThumbsUp className="w-4 h-4 mr-1" />
                {postData.likes} 个赞
              </div>
              <div className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-1" />
                {postData.comments} 条评论
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">评论列表</h3>
            <div className="space-y-4">
              {Array.isArray(comments) &&
                comments.map(comment => (
                  <div key={comment.id} className="flex space-x-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {comment.author.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{comment.author.name}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {comment.likes}
                        </Button>
                      </div>
                      <p className="mt-2">{comment.content}</p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">文章信息</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-gray-600">作者：</span>
                <span className="ml-2">{postData.author.name}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-gray-600">发布时间：</span>
                <span className="ml-2">{new Date(postData.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-gray-600">更新时间：</span>
                <span className="ml-2">{new Date(postData.updatedAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <Tag className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-gray-600">分类：</span>
                <span className="ml-2">{postData.category}</span>
              </div>
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-gray-600">状态：</span>
                <Badge
                  className="ml-2"
                  variant={postData.status === 'published' ? 'default' : 'secondary'}
                >
                  {postData.status === 'published' ? '已发布' : '草稿'}
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">相关推荐</h3>
            <div className="space-y-4">
              {relatedPosts.map(post => (
                <div key={post.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{post.title}</p>
                    <p className="text-sm text-gray-500">
                      {post.author} · {post.createdAt}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    <Eye className="w-4 h-4 inline mr-1" />
                    {post.views}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
