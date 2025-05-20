import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

function Settings({ onClose }) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    theme: 'system', // system, light, dark
    language: 'zh-CN',
    notifications: {
      mentions: true,
      replies: true,
      follows: true,
      likes: true,
      shares: true,
      messages: true,
      email: false,
    },
    privacy: {
      showOnlineStatus: true,
      showReadReceipts: true,
      allowTagging: true,
      allowMessages: 'everyone', // everyone, followers, none
      showActivity: true,
    },
    content: {
      autoplayVideos: true,
      showSensitiveContent: false,
      showTrends: true,
      showRecommendations: true,
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetchApi('/api/users/settings');
      if (response.data) {
        setSettings(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      toast.error('加载设置失败');
    }
  };

  const handleChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetchApi('/api/users/settings', {
        method: 'PUT',
        data: settings,
      });

      if (response.data) {
        updateUser({ ...user, settings: response.data });
        toast.success('设置已保存');
        onClose();
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
      toast.error('保存设置失败');
    } finally {
      setLoading(false);
    }
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
          className="bg-white dark:bg-twitter-gray-900 rounded-2xl w-full max-w-2xl mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="p-4 border-b border-twitter-gray-200 dark:border-twitter-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">设置</h2>
              <button
                onClick={onClose}
                className="text-twitter-blue hover:underline"
              >
                关闭
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4">
            {/* 主题设置 */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4">外观</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-twitter-gray-700 dark:text-twitter-gray-300 mb-1">
                    主题
                  </label>
                  <select
                    value={settings.theme}
                    onChange={(e) => handleChange('theme', 'theme', e.target.value)}
                    className="w-full px-3 py-2 border border-twitter-gray-300 dark:border-twitter-gray-700 rounded-lg focus:ring-2 focus:ring-twitter-blue focus:border-transparent dark:bg-twitter-gray-800"
                  >
                    <option value="system">跟随系统</option>
                    <option value="light">浅色</option>
                    <option value="dark">深色</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 通知设置 */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4">通知</h3>
              <div className="space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-twitter-gray-700 dark:text-twitter-gray-300">
                      {key === 'mentions' && '提及'}
                      {key === 'replies' && '回复'}
                      {key === 'follows' && '新关注'}
                      {key === 'likes' && '点赞'}
                      {key === 'shares' && '分享'}
                      {key === 'messages' && '私信'}
                      {key === 'email' && '邮件通知'}
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleChange('notifications', key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-twitter-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-twitter-blue/20 rounded-full peer dark:bg-twitter-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-twitter-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-twitter-gray-600 peer-checked:bg-twitter-blue"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* 隐私设置 */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4">隐私</h3>
              <div className="space-y-4">
                {Object.entries(settings.privacy).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-twitter-gray-700 dark:text-twitter-gray-300">
                      {key === 'showOnlineStatus' && '显示在线状态'}
                      {key === 'showReadReceipts' && '显示已读回执'}
                      {key === 'allowTagging' && '允许被标记'}
                      {key === 'showActivity' && '显示活动状态'}
                    </label>
                    {key === 'allowMessages' ? (
                      <select
                        value={value}
                        onChange={(e) => handleChange('privacy', key, e.target.value)}
                        className="px-3 py-1 border border-twitter-gray-300 dark:border-twitter-gray-700 rounded-lg focus:ring-2 focus:ring-twitter-blue focus:border-transparent dark:bg-twitter-gray-800"
                      >
                        <option value="everyone">所有人</option>
                        <option value="followers">仅关注者</option>
                        <option value="none">不允许</option>
                      </select>
                    ) : (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => handleChange('privacy', key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-twitter-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-twitter-blue/20 rounded-full peer dark:bg-twitter-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-twitter-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-twitter-gray-600 peer-checked:bg-twitter-blue"></div>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 内容设置 */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4">内容</h3>
              <div className="space-y-4">
                {Object.entries(settings.content).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-twitter-gray-700 dark:text-twitter-gray-300">
                      {key === 'autoplayVideos' && '自动播放视频'}
                      {key === 'showSensitiveContent' && '显示敏感内容'}
                      {key === 'showTrends' && '显示热门话题'}
                      {key === 'showRecommendations' && '显示推荐内容'}
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleChange('content', key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-twitter-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-twitter-blue/20 rounded-full peer dark:bg-twitter-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-twitter-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-twitter-gray-600 peer-checked:bg-twitter-blue"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-twitter-blue text-white font-bold rounded-full hover:bg-twitter-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '保存中...' : '保存设置'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default Settings; 