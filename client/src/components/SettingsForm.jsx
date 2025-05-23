'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { UserService } from '@/services/UserService';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Input } from '@/components/ui/input';
import { Textarea } from './Textarea';
import { LoadingSpinner } from './LoadingSpinner';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';

export const SettingsForm = () => {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    avatar: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  // 加载用户信息
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        bio: user.bio || '',
        avatar: user.avatar || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  // 处理表单输入
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 处理头像上传
  const handleAvatarUpload = async e => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const formDataObj = new FormData();
      formDataObj.append('avatar', file);
      const response = await UserService.uploadAvatar(formDataObj);
      setFormData(prev => ({ ...prev, avatar: response.avatar }));
      showToast('头像上传成功', 'success');
    } catch (error) {
      console.error('Upload avatar failed:', error);
      showToast('头像上传失败', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 验证表单
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空';
    } else if (formData.username.length < 3) {
      newErrors.username = '用户名至少需要3个字符';
    }

    if (!formData.email.trim()) {
      newErrors.email = '邮箱不能为空';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (formData.bio && formData.bio.length > 200) {
      newErrors.bio = '个人简介不能超过200个字符';
    }

    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = '密码至少需要6个字符';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次输入的密码不一致';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      const updatedUser = await UserService.updateProfile({
        username: formData.username,
        email: formData.email,
        bio: formData.bio,
        avatar: formData.avatar,
        password: formData.password || undefined,
      });
      updateUser(updatedUser);
      showToast('设置已保存', 'success');
    } catch (error) {
      console.error('Update profile failed:', error);
      showToast('保存设置失败', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 头像设置 */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">头像</label>
        <div className="flex items-center space-x-4">
          <Avatar
            src={formData.avatar}
            alt={formData.username}
            size="lg"
            className="cursor-pointer"
          />
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              id="avatar-upload"
            />
            <label
              htmlFor="avatar-upload"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
            >
              <Icon name="upload" className="w-4 h-4 mr-2" />
              更换头像
            </label>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              支持 JPG、PNG 格式，大小不超过 2MB
            </p>
          </div>
        </div>
      </div>

      {/* 基本信息 */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">基本信息</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Input
              label="用户名"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              error={errors.username}
              required
            />
          </div>
          <div>
            <Input
              label="邮箱"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              required
            />
          </div>
        </div>
        <div>
          <Textarea
            label="个人简介"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            error={errors.bio}
            maxLength={200}
          />
        </div>
      </div>

      {/* 修改密码 */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">修改密码</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Input
              label="新密码"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
            />
          </div>
          <div>
            <Input
              label="确认新密码"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <LoadingSpinner size="sm" /> : '保存设置'}
        </Button>
      </div>
    </form>
  );
};
