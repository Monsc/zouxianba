import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, FileText, MessageSquare, TrendingUp, AlertCircle, Clock } from 'lucide-react';

const stats = [
  {
    title: '总用户数',
    value: '12,345',
    change: '+12%',
    icon: Users,
    color: 'text-blue-500',
  },
  {
    title: '总内容数',
    value: '45,678',
    change: '+8%',
    icon: FileText,
    color: 'text-green-500',
  },
  {
    title: '总评论数',
    value: '89,012',
    change: '+15%',
    icon: MessageSquare,
    color: 'text-purple-500',
  },
  {
    title: '日活跃用户',
    value: '3,456',
    change: '+5%',
    icon: TrendingUp,
    color: 'text-orange-500',
  },
];

const recentActivities = [
  {
    type: '新用户注册',
    user: '张三',
    time: '10分钟前',
    icon: Users,
  },
  {
    type: '新内容发布',
    user: '李四',
    time: '30分钟前',
    icon: FileText,
  },
  {
    type: '违规内容举报',
    user: '王五',
    time: '1小时前',
    icon: AlertCircle,
  },
  {
    type: '系统更新',
    user: '系统',
    time: '2小时前',
    icon: Clock,
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">仪表盘</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                <p className="text-sm text-green-500 mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 最近活动 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">最近活动</h2>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-gray-50">
                <activity.icon className="h-5 w-5 text-gray-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.type}</p>
                <p className="text-sm text-gray-500">
                  {activity.user} · {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 系统状态 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">系统状态</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">CPU 使用率</span>
              <span className="text-sm font-medium">45%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">内存使用率</span>
              <span className="text-sm font-medium">60%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">磁盘使用率</span>
              <span className="text-sm font-medium">75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">安全状态</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">防火墙状态</span>
              <span className="text-sm font-medium text-green-500">正常</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">SSL 证书</span>
              <span className="text-sm font-medium text-green-500">有效</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">最后安全扫描</span>
              <span className="text-sm font-medium">2小时前</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">可疑登录尝试</span>
              <span className="text-sm font-medium text-red-500">3次</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
