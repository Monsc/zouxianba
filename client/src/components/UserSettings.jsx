import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserService } from '@/services/UserService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Switch } from './Switch';
import { Select } from './Select';
import { LoadingSpinner } from './LoadingSpinner';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';

export const UserSettings = () => {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // 加载设置
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const data = await UserService.getUserSettings();
        setSettings(data);
      } catch (error) {
        console.error('Fetch settings failed:', error);
        showToast('加载设置失败', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // 更新设置
  const handleUpdateSettings = async updates => {
    if (!settings) return;

    try {
      setIsSaving(true);
      const updated = await UserService.updateUserSettings(updates);
      setSettings(updated);
      showToast('设置已更新', 'success');
    } catch (error) {
      console.error('Update settings failed:', error);
      showToast('更新设置失败', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // 更新个人信息
  const handleUpdateProfile = async data => {
    try {
      setIsSaving(true);
      const updated = await UserService.updateProfile(data);
      updateUser(updated);
      showToast('个人信息已更新', 'success');
    } catch (error) {
      console.error('Update profile failed:', error);
      showToast('更新个人信息失败', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // 修改密码
  const handleChangePassword = async data => {
    try {
      setIsSaving(true);
      await UserService.changePassword(data);
      showToast('密码已修改', 'success');
    } catch (error) {
      console.error('Change password failed:', error);
      showToast('修改密码失败', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // 删除账户
  const handleDeleteAccount = async () => {
    if (!window.confirm('确定要删除账户吗？此操作不可撤销。')) return;

    try {
      setIsSaving(true);
      await UserService.deleteAccount();
      showToast('账户已删除', 'success');
      router.push('/');
    } catch (error) {
      console.error('Delete account failed:', error);
      showToast('删除账户失败', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {/* 标签页 */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('profile')}
          className={cn(
            'px-4 py-2 text-sm font-medium',
            activeTab === 'profile'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          )}
        >
          个人信息
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={cn(
            'px-4 py-2 text-sm font-medium',
            activeTab === 'notifications'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          )}
        >
          通知设置
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={cn(
            'px-4 py-2 text-sm font-medium',
            activeTab === 'privacy'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          )}
        >
          隐私设置
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={cn(
            'px-4 py-2 text-sm font-medium',
            activeTab === 'account'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          )}
        >
          账户设置
        </button>
      </div>

      {/* 个人信息 */}
      {activeTab === 'profile' && (
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">个人信息</h3>
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="用户名"
                value={settings.username}
                onChange={e => handleUpdateSettings({ username: e.target.value })}
              />
              <Textarea
                label="个人简介"
                value={settings.bio || ''}
                onChange={e => handleUpdateSettings({ bio: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">外观设置</h3>
            {/* 这里可以添加外观设置相关内容 */}
          </div>
        </div>
      )}

      {/* 通知设置 */}
      {activeTab === 'notifications' && (
        <div className="p-6 space-y-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">通知设置</h3>
          {/* 这里可以添加通知设置相关内容 */}
        </div>
      )}

      {/* 隐私设置 */}
      {activeTab === 'privacy' && (
        <div className="p-6 space-y-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">隐私设置</h3>
          {/* 这里可以添加隐私设置相关内容 */}
        </div>
      )}

      {/* 账户设置 */}
      {activeTab === 'account' && (
        <div className="p-6 space-y-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">账户设置</h3>
          <Button onClick={handleDeleteAccount} disabled={isSaving} variant="destructive">
            {isSaving ? <LoadingSpinner size="sm" /> : '删除账户'}
          </Button>
        </div>
      )}
    </div>
  );
};
