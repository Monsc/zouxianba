import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

function ProfileEdit({ onClose }) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(user.avatar);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    username: user.username,
    handle: user.handle,
    bio: user.bio || '',
    location: user.location || '',
    website: user.website || '',
    birthdate: user.birthdate || '',
    gender: user.gender || '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    // 验证文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过 5MB');
      return;
    }

    // 创建预览
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    // 上传头像
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetchApi('/api/users/avatar', {
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.avatar) {
        updateUser({ ...user, avatar: response.data.avatar });
        toast.success('头像更新成功');
      }
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      toast.error('头像上传失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetchApi('/api/users/profile', {
        method: 'PUT',
        data: formData,
      });

      if (response.data) {
        updateUser({ ...user, ...response.data });
        toast.success('个人资料更新成功');
        onClose();
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error('个人资料更新失败');
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
          className="bg-white dark:bg-twitter-gray-900 rounded-2xl w-full max-w-md mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="p-4 border-b border-twitter-gray-200 dark:border-twitter-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">编辑个人资料</h2>
              <button
                onClick={onClose}
                className="text-twitter-blue hover:underline"
              >
                取消
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4">
            {/* 头像上传 */}
            <div className="mb-6">
              <div className="relative w-24 h-24 mx-auto">
                <img
                  src={previewUrl}
                  alt="头像预览"
                  className="w-full h-full rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={handleAvatarClick}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm">更换头像</span>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {/* 基本信息 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-twitter-gray-700 dark:text-twitter-gray-300 mb-1">
                  用户名
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-twitter-gray-300 dark:border-twitter-gray-700 rounded-lg focus:ring-2 focus:ring-twitter-blue focus:border-transparent dark:bg-twitter-gray-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-twitter-gray-700 dark:text-twitter-gray-300 mb-1">
                  账号
                </label>
                <input
                  type="text"
                  name="handle"
                  value={formData.handle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-twitter-gray-300 dark:border-twitter-gray-700 rounded-lg focus:ring-2 focus:ring-twitter-blue focus:border-transparent dark:bg-twitter-gray-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-twitter-gray-700 dark:text-twitter-gray-300 mb-1">
                  个人简介
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-twitter-gray-300 dark:border-twitter-gray-700 rounded-lg focus:ring-2 focus:ring-twitter-blue focus:border-transparent dark:bg-twitter-gray-800"
                  maxLength="160"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-twitter-gray-700 dark:text-twitter-gray-300 mb-1">
                  所在地
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-twitter-gray-300 dark:border-twitter-gray-700 rounded-lg focus:ring-2 focus:ring-twitter-blue focus:border-transparent dark:bg-twitter-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-twitter-gray-700 dark:text-twitter-gray-300 mb-1">
                  个人网站
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-twitter-gray-300 dark:border-twitter-gray-700 rounded-lg focus:ring-2 focus:ring-twitter-blue focus:border-transparent dark:bg-twitter-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-twitter-gray-700 dark:text-twitter-gray-300 mb-1">
                  生日
                </label>
                <input
                  type="date"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-twitter-gray-300 dark:border-twitter-gray-700 rounded-lg focus:ring-2 focus:ring-twitter-blue focus:border-transparent dark:bg-twitter-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-twitter-gray-700 dark:text-twitter-gray-300 mb-1">
                  性别
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-twitter-gray-300 dark:border-twitter-gray-700 rounded-lg focus:ring-2 focus:ring-twitter-blue focus:border-transparent dark:bg-twitter-gray-800"
                >
                  <option value="">不显示</option>
                  <option value="male">男</option>
                  <option value="female">女</option>
                  <option value="other">其他</option>
                </select>
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-twitter-blue text-white font-bold rounded-full hover:bg-twitter-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ProfileEdit; 