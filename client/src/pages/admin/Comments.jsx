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
import { Search, MoreVertical, Eye, Flag, CheckCircle, XCircle, Trash2 } from 'lucide-react';

const mockComments = [
  {
    id: '1',
    content: '这篇文章写得很好，对我帮助很大！',
    author: '张三',
    postTitle: '如何提高编程效率',
    status: 'pending',
    reportCount: 0,
    createdAt: '2024-03-15 10:30',
    isReply: false,
  },
  {
    id: '2',
    content: '感谢分享，学到了很多！',
    author: '李四',
    postTitle: '分享我的学习经验',
    status: 'approved',
    reportCount: 2,
    createdAt: '2024-03-15 09:15',
    isReply: true,
    parentComment: '这篇文章写得很好，对我帮助很大！',
  },
  // 添加更多模拟数据...
];

export default function Comments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [comments, setComments] = useState(mockComments);

  const handleSearch = query => {
    setSearchQuery(query);
    // 实现搜索逻辑
  };

  const handleStatusChange = (commentId, newStatus) => {
    setComments(
      comments.map(comment =>
        comment.id === commentId ? { ...comment, status: newStatus } : comment
      )
    );
  };

  const handleDelete = commentId => {
    setComments(comments.filter(comment => comment.id !== commentId));
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
        <h1 className="text-2xl font-bold">评论管理</h1>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="搜索评论..."
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
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>评论内容</TableHead>
              <TableHead>作者</TableHead>
              <TableHead>所属文章</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>举报数</TableHead>
              <TableHead>发布时间</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(comments) &&
              comments.map(comment => (
                <TableRow key={comment.id}>
                  <TableCell>
                    <div className="space-y-1">
                      {comment.isReply && (
                        <p className="text-sm text-gray-500">回复: {comment.parentComment}</p>
                      )}
                      <p className="font-medium">{comment.content}</p>
                    </div>
                  </TableCell>
                  <TableCell>{comment.author}</TableCell>
                  <TableCell>{comment.postTitle}</TableCell>
                  <TableCell>{getStatusBadge(comment.status)}</TableCell>
                  <TableCell>
                    {comment.reportCount > 0 ? (
                      <Badge variant="destructive">{comment.reportCount}</Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{comment.createdAt}</TableCell>
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
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(comment.id, 'approved')}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          通过审核
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(comment.id, 'rejected')}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          拒绝评论
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Flag className="w-4 h-4 mr-2" />
                          查看举报
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(comment.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          删除评论
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
