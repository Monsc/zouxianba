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
import { MoreVertical, Search, UserPlus } from 'lucide-react';

const mockUsers = [
  {
    id: '1',
    username: '张三',
    email: 'zhangsan@example.com',
    role: 'user',
    status: 'active',
    lastLogin: '2024-03-15 10:30',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    username: '李四',
    email: 'lisi@example.com',
    role: 'moderator',
    status: 'active',
    lastLogin: '2024-03-15 09:15',
    createdAt: '2024-01-02',
  },
  // 添加更多模拟数据...
];

export default function Users() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState(mockUsers);

  const handleSearch = query => {
    setSearchQuery(query);
    // 实现搜索逻辑
  };

  const handleStatusChange = (userId, newStatus) => {
    setUsers(users.map(user => (user.id === userId ? { ...user, status: newStatus } : user)));
  };

  const handleRoleChange = (userId, newRole) => {
    setUsers(users.map(user => (user.id === userId ? { ...user, role: newRole } : user)));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">用户管理</h1>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          添加用户
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="搜索用户..."
              className="pl-10"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户名</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>最后登录</TableHead>
              <TableHead>注册时间</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'moderator'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.role === 'admin' ? '管理员' : user.role === 'moderator' ? '版主' : '用户'}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : user.status === 'suspended'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.status === 'active'
                      ? '正常'
                      : user.status === 'suspended'
                        ? '已封禁'
                        : '已禁用'}
                  </span>
                </TableCell>
                <TableCell>{user.lastLogin}</TableCell>
                <TableCell>{user.createdAt}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'active')}>
                        恢复正常
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'suspended')}>
                        封禁账号
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'banned')}>
                        永久禁用
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'moderator')}>
                        设为版主
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'user')}>
                        设为普通用户
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
