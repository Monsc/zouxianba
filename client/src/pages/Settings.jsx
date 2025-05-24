import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { useToast } from '../hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { User, Shield, Bell, Palette, ImagePlus, X } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { Button } from '../components/Button';
import { cn } from '../lib/utils';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    handle: '',
    bio: '',
    avatar: null,
    coverImage: null,
  });
  const [preview, setPreview] = useState({
    avatar: '',
    coverImage: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        handle: user.handle || '',
        bio: user.bio || '',
        avatar: null,
        coverImage: null,
      });
      setPreview({
        avatar: user.avatar || '',
        coverImage: user.coverImage || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('请选择图片文件', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('图片大小不能超过5MB', 'error');
      return;
    }

    setFormData(prev => ({
      ...prev,
      [type]: file,
    }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(prev => ({
        ...prev,
        [type]: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('handle', formData.handle);
      data.append('bio', formData.bio);
      if (formData.avatar) {
        data.append('avatar', formData.avatar);
      }
      if (formData.coverImage) {
        data.append('coverImage', formData.coverImage);
      }

      const updatedUser = await apiService.updateProfile(data);
      updateUser(updatedUser);
      showToast('个人资料已更新');
      navigate(`/profile/${updatedUser.username}`);
    } catch (error) {
      showToast('更新失败，请稍后重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">设置</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>设置选项</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  <Link
                    to="/settings/profile"
                    className={`flex items-center gap-2 p-2 rounded-lg hover:bg-accent ${
                      currentPath === 'profile' ? 'bg-accent' : ''
                    }`}
                  >
                    <User className="w-4 h-4" />
                    个人资料
                  </Link>
                  <Link
                    to="/settings/security"
                    className={`flex items-center gap-2 p-2 rounded-lg hover:bg-accent ${
                      currentPath === 'security' ? 'bg-accent' : ''
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    安全设置
                  </Link>
                  <Link
                    to="/settings/notifications"
                    className={`flex items-center gap-2 p-2 rounded-lg hover:bg-accent ${
                      currentPath === 'notifications' ? 'bg-accent' : ''
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    通知设置
                  </Link>
                  <Link
                    to="/settings/appearance"
                    className={`flex items-center gap-2 p-2 rounded-lg hover:bg-accent ${
                      currentPath === 'appearance' ? 'bg-accent' : ''
                    }`}
                  >
                    <Palette className="w-4 h-4" />
                    外观设置
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3">
            <Outlet />
          </div>
        </div>

        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                编辑个人资料
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 封面图 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    封面图
                  </label>
                  <div className="relative h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    {preview.coverImage ? (
                      <img
                        src={preview.coverImage}
                        alt="封面预览"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImagePlus className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'coverImage')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* 头像 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    头像
                  </label>
                  <div className="relative w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    {preview.avatar ? (
                      <img
                        src={preview.avatar}
                        alt="头像预览"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImagePlus className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'avatar')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* 用户名 */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    用户名
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                {/* 用户标识 */}
                <div>
                  <label
                    htmlFor="handle"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    用户标识
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      @
                    </span>
                    <input
                      type="text"
                      id="handle"
                      name="handle"
                      value={formData.handle}
                      onChange={handleChange}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                {/* 个人简介 */}
                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    个人简介
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    maxLength={160}
                  />
                  <p className="mt-1 text-sm text-gray-500 text-right">
                    {formData.bio.length}/160
                  </p>
                </div>

                {/* 提交按钮 */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="min-w-[120px]"
                  >
                    {loading ? '保存中...' : '保存'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
