import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Shield, Key, History, LogOut } from 'lucide-react';
import TwoFactorSetup from '../components/TwoFactorSetup';
import ActiveSessions from '../components/ActiveSessions';
import SecurityLogs from '../components/SecurityLogs';

const SecuritySettings = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [showActiveSessions, setShowActiveSessions] = useState(false);
  const [showSecurityLogs, setShowSecurityLogs] = useState(false);

  const handlePasswordChange = async () => {
    // 实现密码修改逻辑
  };

  const handleLogoutAllSessions = async () => {
    try {
      setLoading(true);
      await api.post('/auth/logout-all-sessions');
      showToast('已成功注销所有会话', 'success');
      // 重新加载页面以应用更改
      window.location.reload();
    } catch (error) {
      showToast(
        error.response?.data?.message || '注销所有会话失败',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            安全设置
          </CardTitle>
          <CardDescription>
            管理您的账户安全设置和双因素认证
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 双因素认证 */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>双因素认证</Label>
              <p className="text-sm text-muted-foreground">
                为您的账户添加额外的安全保护层
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowTwoFactorSetup(true)}
            >
              {user.twoFactorEnabled ? '管理' : '启用'}
            </Button>
          </div>

          {/* 密码修改 */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>修改密码</Label>
              <p className="text-sm text-muted-foreground">
                定期更新您的密码以提高安全性
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handlePasswordChange}
            >
              修改
            </Button>
          </div>

          {/* 活动会话 */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>活动会话</Label>
              <p className="text-sm text-muted-foreground">
                查看和管理您的活动登录会话
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowActiveSessions(true)}
            >
              查看
            </Button>
          </div>

          {/* 安全日志 */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>安全日志</Label>
              <p className="text-sm text-muted-foreground">
                查看您的账户安全活动记录
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowSecurityLogs(true)}
            >
              查看
            </Button>
          </div>

          {/* 注销所有会话 */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>注销所有会话</Label>
              <p className="text-sm text-muted-foreground">
                在所有设备上注销您的账户
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleLogoutAllSessions}
              disabled={loading}
            >
              {loading ? '处理中...' : '注销所有会话'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 双因素认证设置对话框 */}
      <TwoFactorSetup
        open={showTwoFactorSetup}
        onOpenChange={setShowTwoFactorSetup}
      />

      {/* 活动会话对话框 */}
      <ActiveSessions
        open={showActiveSessions}
        onOpenChange={setShowActiveSessions}
      />

      {/* 安全日志对话框 */}
      <SecurityLogs
        open={showSecurityLogs}
        onOpenChange={setShowSecurityLogs}
      />
    </div>
  );
};

export default SecuritySettings; 