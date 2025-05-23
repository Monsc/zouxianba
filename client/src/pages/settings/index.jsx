import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/services/api';
import { toast } from 'react-hot-toast';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/common/Button';
import FormInput from '@/components/common/FormInput';
import ImageUpload from '@/components/common/ImageUpload';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useForm } from 'react-hook-form';

const SettingsPage = () => {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
    },
  });

  // 处理个人资料更新
  const handleProfileUpdate = async data => {
    try {
      setLoading(true);
      await updateProfile(data);
      toast.success('个人资料更新成功');
    } catch (err) {
      toast.error(err.message || '更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理头像上传
  const handleAvatarUpload = async file => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('avatar', file);
      await api.post('/users/avatar', formData);
      toast.success('头像更新成功');
    } catch (err) {
      toast.error('头像上传失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理密码修改
  const handlePasswordChange = async data => {
    try {
      setLoading(true);
      await api.put('/users/password', data);
      toast.success('密码修改成功');
    } catch (err) {
      toast.error(err.message || '密码修改失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: '个人资料' },
    { id: 'security', label: '账号安全' },
    { id: 'notifications', label: '通知设置' },
    { id: 'privacy', label: '隐私设置' },
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          {/* 设置页面标题 */}
          <div className="px-6 py-4 border-b">
            <h1 className="text-2xl font-bold text-gray-900">设置</h1>
          </div>

          {/* 设置页面内容 */}
          <div className="flex">
            {/* 侧边栏导航 */}
            <div className="w-64 border-r">
              <nav className="p-4">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg mb-1 ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* 设置内容区域 */}
            <div className="flex-1 p-6">
              <LoadingOverlay isLoading={loading}>
                {activeTab === 'profile' && (
                  <form onSubmit={handleSubmit(handleProfileUpdate)} className="space-y-6">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 mb-4">个人资料</h2>

                      {/* 头像上传 */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">头像</label>
                        <ImageUpload
                          value={user?.avatar}
                          onChange={handleAvatarUpload}
                          maxSize={2}
                          className="w-32 h-32"
                        />
                      </div>

                      {/* 用户名 */}
                      <FormInput
                        label="用户名"
                        name="username"
                        register={register}
                        required
                        error={errors.username}
                        rules={{
                          required: '请输入用户名',
                          minLength: {
                            value: 3,
                            message: '用户名长度至少为3个字符',
                          },
                        }}
                      />

                      {/* 邮箱 */}
                      <FormInput
                        label="邮箱"
                        name="email"
                        type="email"
                        register={register}
                        required
                        error={errors.email}
                        rules={{
                          required: '请输入邮箱',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: '请输入有效的邮箱地址',
                          },
                        }}
                      />

                      {/* 个人简介 */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          个人简介
                        </label>
                        <textarea
                          {...register('bio')}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                          placeholder="介绍一下自己吧..."
                        />
                      </div>

                      <div className="mt-6">
                        <Button type="submit" loading={loading}>
                          保存更改
                        </Button>
                      </div>
                    </div>
                  </form>
                )}

                {activeTab === 'security' && (
                  <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-6">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 mb-4">修改密码</h2>

                      <FormInput
                        label="当前密码"
                        name="currentPassword"
                        type="password"
                        register={register}
                        required
                        error={errors.currentPassword}
                        rules={{
                          required: '请输入当前密码',
                        }}
                      />

                      <FormInput
                        label="新密码"
                        name="newPassword"
                        type="password"
                        register={register}
                        required
                        error={errors.newPassword}
                        rules={{
                          required: '请输入新密码',
                          minLength: {
                            value: 6,
                            message: '密码长度至少为6个字符',
                          },
                        }}
                      />

                      <FormInput
                        label="确认新密码"
                        name="confirmPassword"
                        type="password"
                        register={register}
                        required
                        error={errors.confirmPassword}
                        rules={{
                          required: '请确认新密码',
                          validate: value =>
                            value === watch('newPassword') || '两次输入的密码不一致',
                        }}
                      />

                      <div className="mt-6">
                        <Button type="submit" loading={loading}>
                          修改密码
                        </Button>
                      </div>
                    </div>
                  </form>
                )}

                {activeTab === 'notifications' && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">通知设置</h2>
                    {/* 通知设置表单 */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">新关注通知</h3>
                          <p className="text-sm text-gray-500">当有新用户关注你时通知</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">点赞通知</h3>
                          <p className="text-sm text-gray-500">当有人点赞你的帖子时通知</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">评论通知</h3>
                          <p className="text-sm text-gray-500">当有人评论你的帖子时通知</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">隐私设置</h2>
                    {/* 隐私设置表单 */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">个人资料可见性</h3>
                          <p className="text-sm text-gray-500">控制谁可以查看你的个人资料</p>
                        </div>
                        <select className="mt-1 block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md">
                          <option>所有人</option>
                          <option>仅关注者</option>
                          <option>仅自己</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">帖子可见性</h3>
                          <p className="text-sm text-gray-500">控制谁可以查看你的帖子</p>
                        </div>
                        <select className="mt-1 block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md">
                          <option>所有人</option>
                          <option>仅关注者</option>
                          <option>仅自己</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">允许评论</h3>
                          <p className="text-sm text-gray-500">控制谁可以评论你的帖子</p>
                        </div>
                        <select className="mt-1 block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md">
                          <option>所有人</option>
                          <option>仅关注者</option>
                          <option>仅自己</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </LoadingOverlay>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
