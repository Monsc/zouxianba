import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

// 模拟数据
const stats = {
  users: {
    total: 1234,
    active: 789,
    new: 56,
    growth: 12.5,
  },
  content: {
    posts: 5678,
    comments: 12345,
    likes: 34567,
    growth: 8.3,
  },
  engagement: {
    dailyActive: 432,
    avgTime: '15分钟',
    bounceRate: '35%',
    growth: -2.1,
  },
  traffic: {
    total: 9876,
    unique: 5432,
    pageviews: 23456,
    growth: 15.7,
  },
};

const timeRanges = [
  { value: 'today', label: '今天' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'year', label: '今年' },
  { value: 'custom', label: '自定义' },
];

const StatCard = ({ title, value, icon: Icon, growth, trend }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {growth !== undefined && (
          <div className="flex items-center mt-2">
            {trend === 'up' ? (
              <ArrowUp className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm ml-1 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(growth)}%
            </span>
          </div>
        )}
      </div>
      <div className="p-3 bg-gray-100 rounded-full">
        <Icon className="w-6 h-6 text-gray-600" />
      </div>
    </div>
  </Card>
);

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('week');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">数据分析</h1>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择时间范围" />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </Button>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.isArray(stats.users) &&
          stats.users.map((user, index) => (
            <StatCard
              key={index}
              title={`总用户数`}
              value={user.total}
              icon={Users}
              growth={user.growth}
              trend="up"
            />
          ))}
        {Array.isArray(stats.content) &&
          stats.content.map((content, index) => (
            <StatCard
              key={index}
              title={`内容总数`}
              value={content.posts}
              icon={FileText}
              growth={content.growth}
              trend="up"
            />
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">用户增长趋势</h3>
          <div className="h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
            图表区域
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">内容发布趋势</h3>
          <div className="h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
            图表区域
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">用户活跃度</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">日活跃用户</span>
              <span className="font-medium">{stats.engagement.dailyActive}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">平均使用时长</span>
              <span className="font-medium">{stats.engagement.avgTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">跳出率</span>
              <span className="font-medium">{stats.engagement.bounceRate}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">内容互动</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">评论数</span>
              <span className="font-medium">{stats.content.comments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">点赞数</span>
              <span className="font-medium">{stats.content.likes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">互动率</span>
              <span className="font-medium">
                {((stats.content.likes / stats.content.posts) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">流量统计</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">总访问量</span>
              <span className="font-medium">{stats.traffic.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">独立访客</span>
              <span className="font-medium">{stats.traffic.unique}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">页面浏览量</span>
              <span className="font-medium">{stats.traffic.pageviews}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
