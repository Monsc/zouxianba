import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, MoreVertical, Eye, Flag, CheckCircle, XCircle } from 'lucide-react';

const mockPosts = [
  {
    id: '1',
    title: '如何提高编程效率',
    author: '张三',
    content: '这是一篇关于提高编程效率的文章...',
    status: 'pending',
    reportCount: 0,
    createdAt: '2024-03-15 10:30',
    category: '技术',
  },
  {
    id: '2',
    title: '分享我的学习经验',
    author: '李四',
    content: '这是一篇学习经验分享...',
    status: 'approved',
    reportCount: 2,
    createdAt: '2024-03-15 09:15',
    category: '学习',
  },
  // 添加更多模拟数据...
];

export default function Posts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [posts, setPosts] = useState(mockPosts);

  const handleSearch = query => {
    setSearchQuery(query);
    // 实现搜索逻辑
  };

  const handleStatusChange = (postId, newStatus) => {
    setPosts(
      Array.isArray(posts)
        ? posts.map(post => (post.id === postId ? { ...post, status: newStatus } : post))
        : posts
    );
  };

  const getStatusBadge = status => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">待审核</Badge>;
      case 'approved':
        return <Badge variant="success">已通过</Badge>;
      case 'rejected':
        return <Badge variant="destructive">已拒绝</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">内容管理</h1>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="搜索内容..."
              className="pl-10"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="状态筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="pending">待审核</SelectItem>
              <SelectItem value="approved">已通过</SelectItem>
              <SelectItem value="rejected">已拒绝</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="分类筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              <SelectItem value="技术">技术</SelectItem>
              <SelectItem value="学习">学习</SelectItem>
              <SelectItem value="生活">生活</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标题</TableHead>
              <TableHead>作者</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>举报数</TableHead>
              <TableHead>发布时间</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map(post => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>{post.author}</TableCell>
                <TableCell>{post.category}</TableCell>
                <TableCell>{getStatusBadge(post.status)}</TableCell>
                <TableCell>
                  {post.reportCount > 0 ? (
                    <Badge variant="destructive">{post.reportCount}</Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{post.createdAt}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        查看详情
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(post.id, 'approved')}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        通过审核
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(post.id, 'rejected')}>
                        <XCircle className="w-4 h-4 mr-2" />
                        拒绝内容
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Flag className="w-4 h-4 mr-2" />
                        查看举报
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
