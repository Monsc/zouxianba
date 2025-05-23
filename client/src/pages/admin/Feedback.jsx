import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MessageSquare,
  Filter,
  Search,
  Check,
  X,
  Star,
  StarHalf,
  StarOff,
  Reply,
  Trash2,
} from 'lucide-react';

// 模拟数据
const feedbacks = [
  {
    id: '1',
    user: {
      id: '1',
      name: '张三',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    },
    type: 'bug',
    title: '无法上传图片',
    content: '在发布帖子时，点击上传图片按钮没有反应，请检查。',
    status: 'pending',
    priority: 'high',
    rating: 4,
    createdAt: '2024-03-15 14:30',
    updatedAt: '2024-03-15 14:30',
  },
  {
    id: '2',
    user: {
      id: '2',
      name: '李四',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    },
    type: 'feature',
    title: '希望添加夜间模式',
    content: '建议添加夜间模式功能，保护用户视力。',
    status: 'in_progress',
    priority: 'medium',
    rating: 5,
    createdAt: '2024-03-14 10:15',
    updatedAt: '2024-03-15 09:20',
  },
  {
    id: '3',
    user: {
      id: '3',
      name: '王五',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    },
    type: 'suggestion',
    title: '优化搜索功能',
    content: '建议优化搜索功能，增加高级筛选选项。',
    status: 'resolved',
    priority: 'low',
    rating: 3,
    createdAt: '2024-03-13 16:45',
    updatedAt: '2024-03-14 11:30',
  },
];

const feedbackTypes = [
  { value: 'bug', label: '问题反馈' },
  { value: 'feature', label: '功能建议' },
  { value: 'suggestion', label: '优化建议' },
  { value: 'other', label: '其他' },
];

const statusTypes = [
  { value: 'pending', label: '待处理' },
  { value: 'in_progress', label: '处理中' },
  { value: 'resolved', label: '已解决' },
  { value: 'closed', label: '已关闭' },
];

const priorityTypes = [
  { value: 'high', label: '高优先级' },
  { value: 'medium', label: '中优先级' },
  { value: 'low', label: '低优先级' },
];

const RatingStars = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />);
    } else if (i - 0.5 <= rating) {
      stars.push(<StarHalf key={i} className="w-4 h-4 text-yellow-400 fill-current" />);
    } else {
      stars.push(<StarOff key={i} className="w-4 h-4 text-gray-300" />);
    }
  }
  return <div className="flex space-x-1">{stars}</div>;
};

export default function Feedback() {
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isReplying, setIsReplying] = useState(false);
  const [reply, setReply] = useState('');

  const handleReply = id => {
    setSelectedFeedback(id);
    setIsReplying(true);
  };

  const handleSubmitReply = () => {
    // 实现提交回复的逻辑
    console.log('提交回复', reply);
    setIsReplying(false);
    setReply('');
  };

  const handleDelete = id => {
    // 实现删除反馈的逻辑
    console.log('删除反馈', id);
  };

  const handleStatusChange = (id, status) => {
    // 实现更新状态的逻辑
    console.log('更新状态', id, status);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">用户反馈</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            筛选
          </Button>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input placeholder="搜索反馈..." className="pl-10 w-[200px]" />
          </div>
        </div>
      </div>

      <Card className="p-6">
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>标题</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>优先级</TableHead>
                <TableHead>评分</TableHead>
                <TableHead>时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(feedbacks) &&
                feedbacks.map(feedback => (
                  <TableRow key={feedback.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <img
                          src={feedback.user.avatar}
                          alt={feedback.user.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span>{feedback.user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {feedbackTypes.find(t => t.value === feedback.type)?.label}
                    </TableCell>
                    <TableCell>{feedback.title}</TableCell>
                    <TableCell>
                      <Select
                        value={feedback.status}
                        onValueChange={value => handleStatusChange(feedback.id, value)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(statusTypes) &&
                            statusTypes.map(status => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          feedback.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : feedback.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {priorityTypes.find(p => p.value === feedback.priority)?.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <RatingStars rating={feedback.rating} />
                    </TableCell>
                    <TableCell>{feedback.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleReply(feedback.id)}
                        >
                          <Reply className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(feedback.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {isReplying && (
        <Card className="p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">回复反馈</h2>
          <Textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            placeholder="请输入回复内容..."
            rows={4}
          />
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsReplying(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitReply}>提交回复</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
