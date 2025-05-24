import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/common/Button';
import FormInput from '@/components/common/FormInput';
import ImageUpload from '@/components/common/ImageUpload';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useForm } from 'react-hook-form';
import { User, Lock, Bell, Shield, ChevronRight } from 'lucide-react';

const tabs = [
  { id: 'profile', label: '个人资料', icon: User },
  { id: 'security', label: '账号安全', icon: Lock },
  { id: 'notifications', label: '通知设置', icon: Bell },
  { id: 'privacy', label: '隐私设置', icon: Shield },
];

const SettingsPage = () => {
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

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8 px-2 md:px-0">
        <div className="bg-white dark:bg-background rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden">
          {/* 左侧分栏导航 */}
          <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-accent/30">
            <nav className="flex md:flex-col gap-1 md:gap-0">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center w-full px-6 py-4 md:py-3 text-base font-medium transition-colors
                      ${activeTab === tab.id
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'hover:bg-accent/50 text-muted-foreground'}
                    `}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.label}
                    {activeTab === tab.id && <ChevronRight className="ml-auto w-4 h-4 text-primary" />}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* 右侧内容区 */}
          <section className="flex-1 p-6 md:p-10">
            <LoadingOverlay isLoading={loading}>
              <div className="max-w-xl mx-auto space-y-8">
                {activeTab === 'profile' && (
                  <form onSubmit={handleSubmit(handleProfileUpdate)} className="space-y-6 bg-accent/30 rounded-xl p-6 shadow">
                    <h2 className="text-lg font-bold mb-4">个人资料</h2>
                    {/* 头像上传 */}
                    <div className="mb-6 flex items-center gap-6">
                      <ImageUpload
                        value={user?.avatar}
                        onChange={handleAvatarUpload}
                        maxSize={2}
                        className="w-20 h-20 rounded-full border border-border shadow"
                      />
                      <div className="text-muted-foreground">点击头像更换</div>
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
                        minLength: { value: 3, message: '用户名长度至少为3个字符' },
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
                    <div>
                      <label className="block text-sm font-medium mb-2">个人简介</label>
                      <textarea
                        {...register('bio')}
                        rows={4}
                        className="w-full px-3 py-2 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                        placeholder="介绍一下自己吧..."
                      />
                    </div>
                    <div className="pt-2 flex gap-4">
                      <Button type="submit" loading={loading} className="w-32">保存更改</Button>
                    </div>
                  </form>
                )}
                {activeTab === 'security' && (
                  <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-6 bg-accent/30 rounded-xl p-6 shadow">
                    <h2 className="text-lg font-bold mb-4">修改密码</h2>
                    <FormInput
                      label="当前密码"
                      name="currentPassword"
                      type="password"
                      register={register}
                      required
                      error={errors.currentPassword}
                      rules={{ required: '请输入当前密码' }}
                    />
                    <FormInput
                      label="新密码"
                      name="newPassword"
                      type="password"
                      register={register}
                      required
                      error={errors.newPassword}
                      rules={{ required: '请输入新密码' }}
                    />
                    <div className="pt-2 flex gap-4">
                      <Button type="submit" loading={loading} className="w-32">保存密码</Button>
                    </div>
                  </form>
                )}
                {activeTab === 'notifications' && (
                  <div className="bg-accent/30 rounded-xl p-6 shadow">
                    <h2 className="text-lg font-bold mb-4">通知设置</h2>
                    <div className="text-muted-foreground">（此处可扩展通知相关设置...）</div>
                  </div>
                )}
                {activeTab === 'privacy' && (
                  <div className="bg-accent/30 rounded-xl p-6 shadow">
                    <h2 className="text-lg font-bold mb-4">隐私设置</h2>
                    <div className="text-muted-foreground">（此处可扩展隐私相关设置...）</div>
                  </div>
                )}
              </div>
            </LoadingOverlay>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
