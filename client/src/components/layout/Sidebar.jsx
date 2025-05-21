import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  HomeIcon,
  FireIcon,
  UserGroupIcon,
  BookmarkIcon,
  HashtagIcon,
} from '@heroicons/react/outline';

const Sidebar = () => {
  const router = useRouter();
  const { pathname } = router;

  const navItems = [
    { name: '首页', href: '/', icon: HomeIcon },
    { name: '热门', href: '/hot', icon: FireIcon },
    { name: '关注', href: '/following', icon: UserGroupIcon },
    { name: '收藏', href: '/bookmarks', icon: BookmarkIcon },
  ];

  const trendingTopics = [
    { name: '技术讨论', count: '1.2k' },
    { name: '生活分享', count: '856' },
    { name: '学习交流', count: '654' },
    { name: '职场经验', count: '432' },
  ];

  return (
    <aside className="w-64 space-y-8">
      {/* Navigation */}
      <nav>
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Trending Topics */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">热门话题</h3>
        <ul className="space-y-3">
          {trendingTopics.map((topic) => (
            <li key={topic.name}>
              <Link
                href={`/topic/${topic.name}`}
                className="flex items-center justify-between text-gray-700 hover:text-primary"
              >
                <div className="flex items-center space-x-2">
                  <HashtagIcon className="h-4 w-4" />
                  <span>{topic.name}</span>
                </div>
                <span className="text-sm text-gray-500">{topic.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="text-sm text-gray-500">
        <p>© 2024 走线吧</p>
        <div className="mt-2 space-x-2">
          <Link href="/about" className="hover:text-gray-700">
            关于我们
          </Link>
          <Link href="/privacy" className="hover:text-gray-700">
            隐私政策
          </Link>
          <Link href="/terms" className="hover:text-gray-700">
            使用条款
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 