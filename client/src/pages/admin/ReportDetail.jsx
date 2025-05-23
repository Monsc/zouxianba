import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Flag,
  User,
  Calendar,
  FileText,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';

// 模拟数据
const reportData = {
  id: '1',
  type: 'content',
  reason: '垃圾内容',
  description: '这是一条垃圾内容，包含不当信息。',
  status: 'pending',
  priority: 'high',
  createdAt: '2024-03-15 14:30:00',
  reporter: {
    id: '1',
    name: '张三',
    avatar: '/avatars/1.jpg',
  },
  target: {
    id: '1',
    type: 'post',
    title: '示例文章标题',
    content: '这是一篇示例文章的内容。',
    author: {
      id: '2',
      name: '李四',
      avatar: '/avatars/2.jpg',
    },
  },
  history: [
    {
      id: '1',
      action: 'created',
      description: '创建举报',
      operator: {
        id: '1',
        name: '张三',
        avatar: '/avatars/1.jpg',
      },
      createdAt: '2024-03-15 14:30:00',
    },
    {
      id: '2',
      action: 'assigned',
      description: '分配给管理员',
      operator: {
        id: '3',
        name: '系统',
        avatar: '/avatars/system.jpg',
      },
      createdAt: '2024-03-15 14:35:00',
    },
  ],
};

const statusOptions = [
  { value: 'pending', label: '待处理', icon: Clock },
  { value: 'processing', label: '处理中', icon: AlertTriangle },
  { value: 'resolved', label: '已解决', icon: CheckCircle2 },
  { value: 'rejected', label: '已驳回', icon: XCircle },
];

const priorityOptions = [
  { value: 'low', label: '低', color: 'bg-gray-500' },
  { value: 'medium', label: '中', color: 'bg-yellow-500' },
  { value: 'high', label: '高', color: 'bg-red-500' },
];

export default function ReportDetail() {
  const { id } = useParams();
  const [status, setStatus] = useState(reportData.status);
  const [priority, setPriority] = useState(reportData.priority);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    // 实现提交处理结果的逻辑
    console.log('提交处理结果', {
      status,
      priority,
      comment,
    });
  };

  const getStatusColor = status => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      case 'resolved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">举报详情</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleSubmit}>
            提交处理结果
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">举报信息</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <Flag className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-gray-600">举报类型：</span>
                <span className="ml-2">{reportData.type === 'content' ? '内容' : '用户'}</span>
              </div>
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-gray-600">举报原因：</span>
                <span className="ml-2">{reportData.reason}</span>
              </div>
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-gray-600">举报描述：</span>
                <span className="ml-2">{reportData.description}</span>
              </div>
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-gray-600">举报人：</span>
                <div className="ml-2 flex items-center">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mr-2">
                    {reportData.reporter.name[0]}
                  </div>
                  <span>{reportData.reporter.name}</span>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-gray-600">举报时间：</span>
                <span className="ml-2">{new Date(reportData.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">被举报内容</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-gray-600">内容类型：</span>
                <span className="ml-2">{reportData.target.type === 'post' ? '文章' : '评论'}</span>
              </div>
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-gray-600">作者：</span>
                <div className="ml-2 flex items-center">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mr-2">
                    {reportData.target.author.name[0]}
                  </div>
                  <span>{reportData.target.author.name}</span>
                </div>
              </div>
              <div>
                <p className="text-gray-600 mb-2">内容：</p>
                <div className="p-4 bg-gray-50 rounded-lg">{reportData.target.content}</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">处理记录</h3>
            <div className="space-y-4">
              {reportData.history.map(record => (
                <div key={record.id} className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    {record.operator.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{record.operator.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(record.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="secondary">{record.action}</Badge>
                    </div>
                    <p className="mt-2">{record.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">处理信息</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">处理状态</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <option.icon className="w-4 h-4 mr-2" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">优先级</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="选择优先级" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <span
                          className={option.color + ' w-2 h-2 rounded-full inline-block mr-2'}
                        />
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">处理备注</label>
                <Textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="请输入处理备注..."
                  rows={4}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
