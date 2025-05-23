import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Search,
  Filter,
  Download,
  RefreshCw,
  User,
  Settings,
  FileText,
  Shield,
  AlertTriangle,
  Info,
} from 'lucide-react';

// 模拟数据
const logs = [
  {
    id: '1',
    type: 'user',
    action: 'login',
    description: '用户登录',
    operator: {
      id: '1',
      name: '张三',
      avatar: '/avatars/1.jpg',
    },
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: '2024-03-15 14:30:00',
    status: 'success',
  },
  {
    id: '2',
    type: 'system',
    action: 'config',
    description: '修改系统配置',
    operator: {
      id: '2',
      name: '管理员',
      avatar: '/avatars/admin.jpg',
    },
    ip: '192.168.1.2',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: '2024-03-15 15:00:00',
    status: 'success',
  },
  {
    id: '3',
    type: 'content',
    action: 'delete',
    description: '删除内容',
    operator: {
      id: '2',
      name: '管理员',
      avatar: '/avatars/admin.jpg',
    },
    ip: '192.168.1.2',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: '2024-03-15 15:30:00',
    status: 'success',
  },
  {
    id: '4',
    type: 'security',
    action: 'failed_login',
    description: '登录失败',
    operator: {
      id: '3',
      name: '未知用户',
      avatar: '/avatars/unknown.jpg',
    },
    ip: '192.168.1.3',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: '2024-03-15 16:00:00',
    status: 'error',
  },
];

const typeOptions = [
  { value: 'all', label: '全部类型', icon: Info },
  { value: 'user', label: '用户操作', icon: User },
  { value: 'system', label: '系统操作', icon: Settings },
  { value: 'content', label: '内容操作', icon: FileText },
  { value: 'security', label: '安全操作', icon: Shield },
];

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'success', label: '成功' },
  { value: 'error', label: '失败' },
  { value: 'warning', label: '警告' },
];

export default function SystemLogs() {
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  const getTypeIcon = type => {
    const option = typeOptions.find(opt => opt.value === type);
    return option?.icon || Info;
  };

  const getStatusColor = status => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">系统日志</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出日志
          </Button>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                className="pl-10"
                placeholder="搜索日志..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择类型" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <option.icon className="w-4 h-4 mr-2" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>操作类型</TableHead>
                <TableHead>操作描述</TableHead>
                <TableHead>操作人</TableHead>
                <TableHead>IP地址</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map(log => {
                const TypeIcon = getTypeIcon(log.type);
                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <TypeIcon className="w-4 h-4 mr-2 text-gray-500" />
                        {typeOptions.find(opt => opt.value === log.type)?.label}
                      </div>
                    </TableCell>
                    <TableCell>{log.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mr-2">
                          {log.operator.name[0]}
                        </div>
                        {log.operator.name}
                      </div>
                    </TableCell>
                    <TableCell>{log.ip}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(log.status)} variant="secondary">
                        {log.status === 'success'
                          ? '成功'
                          : log.status === 'error'
                            ? '失败'
                            : '警告'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
