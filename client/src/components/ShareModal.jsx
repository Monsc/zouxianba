import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/api';
import { useToast } from '../hooks/useToast';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function ShareModal({ post, onClose }) {
  const [copied, setCopied] = useState(false);
  const [shareStats, setShareStats] = useState({
    totalShares: 0,
    platformStats: {},
    dailyStats: [],
  });
  const [showStats, setShowStats] = useState(false);
  const shareUrl = `${window.location.origin}/post/${post._id}`;
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiService.get(`/posts/${post._id}/share-stats`);
        setShareStats(response.data);
      } catch (error) {
        showToast('获取分享统计失败', 'error');
      }
    };

    fetchStats();
  }, [post._id]);

  const handleShare = async platform => {
    try {
      setLoading(true);
      await apiService.post(`/posts/${post._id}/share`, {
        platform,
        url: window.location.href,
      });
      showToast('分享成功', 'success');
      onClose();
    } catch (error) {
      showToast('分享失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const shareOptions = [
    {
      name: '复制链接',
      icon: '🔗',
      action: async () => {
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          handleShare('copy');
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      },
    },
    {
      name: '微信',
      icon: '💬',
      action: () => {
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
        window.open(qrCodeUrl, '_blank');
        handleShare('wechat');
      },
    },
    {
      name: '微博',
      icon: '🌐',
      action: () => {
        const text = `${post.content.substring(0, 100)}... ${shareUrl}`;
        const url = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
        handleShare('weibo');
      },
    },
    {
      name: 'QQ',
      icon: '💫',
      action: () => {
        const url = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.content)}`;
        window.open(url, '_blank');
        handleShare('qq');
      },
    },
    {
      name: 'QQ空间',
      icon: '🌟',
      action: () => {
        const url = `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.content)}`;
        window.open(url, '_blank');
        handleShare('qzone');
      },
    },
    {
      name: '抖音',
      icon: '🎵',
      action: () => {
        const url = `https://www.douyin.com/share?url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank');
        handleShare('douyin');
      },
    },
    {
      name: '快手',
      icon: '📱',
      action: () => {
        const url = `https://www.kuaishou.com/share?url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank');
        handleShare('kuaishou');
      },
    },
    {
      name: '小红书',
      icon: '📖',
      action: () => {
        const url = `https://www.xiaohongshu.com/share?url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank');
        handleShare('xiaohongshu');
      },
    },
    {
      name: '豆瓣',
      icon: '📚',
      action: () => {
        const url = `https://www.douban.com/share/service?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.content)}`;
        window.open(url, '_blank');
        handleShare('douban');
      },
    },
  ];

  const chartData = {
    labels: Object.keys(shareStats.platformStats),
    datasets: [
      {
        data: Object.values(shareStats.platformStats),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
        ],
      },
    ],
  };

  const dailyChartData = {
    labels: shareStats.dailyStats.map(stat => stat.date),
    datasets: [
      {
        label: '每日分享数',
        data: shareStats.dailyStats.map(stat => stat.count),
        backgroundColor: '#36A2EB',
      },
    ],
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-twitter-gray-900 rounded-2xl w-full max-w-md mx-4 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="p-4 border-b border-twitter-gray-200 dark:border-twitter-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">分享</h2>
              <button
                onClick={() => setShowStats(!showStats)}
                className="text-twitter-blue hover:underline"
              >
                {showStats ? '返回' : '查看数据'}
              </button>
            </div>
          </div>

          {showStats ? (
            <div className="p-4">
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-4">分享统计</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-twitter-gray-50 dark:bg-twitter-gray-800 p-4 rounded-xl">
                    <p className="text-sm text-twitter-gray-500">总分享次数</p>
                    <p className="text-2xl font-bold">{shareStats.totalShares}</p>
                  </div>
                  <div className="bg-twitter-gray-50 dark:bg-twitter-gray-800 p-4 rounded-xl">
                    <p className="text-sm text-twitter-gray-500">今日分享</p>
                    <p className="text-2xl font-bold">
                      {shareStats.dailyStats[shareStats.dailyStats.length - 1]?.count || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold mb-4">平台分布</h3>
                <div className="h-64">
                  <Pie data={chartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">每日趋势</h3>
                <div className="h-64">
                  <Bar
                    data={dailyChartData}
                    options={{
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* 分享预览 */}
              <div className="p-4 border-b border-twitter-gray-200 dark:border-twitter-gray-800">
                <div className="flex space-x-3">
                  <img
                    src={post.author.avatar}
                    alt={post.author.username}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">{post.author.username}</span>
                      <span className="text-twitter-gray-500">@{post.author.handle}</span>
                    </div>
                    <p className="mt-1 text-sm line-clamp-2">{post.content}</p>
                    {post.media && post.media.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {post.media.slice(0, 2).map((media, index) => (
                          <img
                            key={index}
                            src={media.url}
                            alt=""
                            className="w-full h-20 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 分享统计 */}
              <div className="p-4 border-b border-twitter-gray-200 dark:border-twitter-gray-800">
                <div className="flex items-center justify-between text-sm text-twitter-gray-500">
                  <span>总分享次数：{shareStats.totalShares}</span>
                  <div className="flex space-x-4">
                    {Object.entries(shareStats.platformStats)
                      .slice(0, 3)
                      .map(([platform, count]) => (
                        <span key={platform}>
                          {platform}: {count}
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              {/* 分享选项 */}
              <div className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  {shareOptions.map(option => (
                    <button
                      key={option.name}
                      onClick={option.action}
                      className="flex flex-col items-center justify-center p-4 rounded-xl hover:bg-twitter-gray-100 dark:hover:bg-twitter-gray-800 transition-colors"
                    >
                      <span className="text-2xl mb-2">{option.icon}</span>
                      <span className="text-sm">{option.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 复制成功提示 */}
          <AnimatePresence>
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-twitter-gray-900 text-white px-4 py-2 rounded-full"
              >
                链接已复制
              </motion.div>
            )}
          </AnimatePresence>

          {/* 取消按钮 */}
          <div className="p-4 border-t border-twitter-gray-200 dark:border-twitter-gray-800">
            <button
              onClick={onClose}
              className="w-full py-2 text-twitter-blue font-bold hover:bg-twitter-blue/10 rounded-full transition-colors"
            >
              取消
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ShareModal;
