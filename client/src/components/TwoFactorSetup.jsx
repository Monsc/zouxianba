import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import apiService from '../services/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Shield, Key } from 'lucide-react';

export const TwoFactorSetup = ({ open, onOpenChange }) => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCode, setBackupCode] = useState('');

  useEffect(() => {
    if (open && !user.twoFactorEnabled) {
      fetchSetupData();
    }
  }, [open, user.twoFactorEnabled]);

  const fetchSetupData = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/auth/2fa/setup');
      setSetupData(response.data);
    } catch (error) {
      showToast('获取双因素认证设置失败', 'error');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      setLoading(true);
      const response = await apiService.post('/auth/2fa/enable');
      showToast('两步验证已启用', 'success');
      updateUser({ ...user, twoFactorEnabled: true });
    } catch (error) {
      showToast(error.response?.data?.message || '启用两步验证失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setLoading(true);
      await apiService.post('/auth/2fa/disable', { code: verificationCode });
      showToast('两步验证已禁用', 'success');
      updateUser({ ...user, twoFactorEnabled: false });
      setVerificationCode('');
    } catch (error) {
      showToast(error.response?.data?.message || '禁用两步验证失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyBackupCode = async () => {
    try {
      setLoading(true);
      await apiService.post('/auth/2fa/verify-backup', {
        code: backupCode,
      });
      showToast('备用码验证成功', 'success');
      onOpenChange(false);
    } catch (error) {
      showToast(error.response?.data?.message || '备用码验证失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            双因素认证设置
          </DialogTitle>
          <DialogDescription>
            {user.twoFactorEnabled ? '管理您的双因素认证设置' : '为您的账户添加额外的安全保护层'}
          </DialogDescription>
        </DialogHeader>

        {user.twoFactorEnabled ? (
          <div className="space-y-4">
            <Alert>
              <Shield className="w-4 h-4 mr-2" />
              <AlertDescription>双因素认证已启用，您的账号受到额外保护</AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>验证码</Label>
              <Input
                type="text"
                placeholder="输入验证码"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value)}
              />
            </div>

            <Button
              variant="destructive"
              onClick={handleDisable2FA}
              disabled={loading || !verificationCode}
              className="w-full"
            >
              {loading ? '处理中...' : '禁用双因素认证'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {setupData ? (
              <>
                <div className="space-y-2">
                  <Label>扫描二维码</Label>
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <img src={setupData.qrCode} alt="2FA QR Code" className="w-48 h-48" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>备用码</Label>
                  <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
                    {setupData.backupCodes.map((code, index) => (
                      <code key={index} className="p-2 bg-background rounded text-sm font-mono">
                        {code}
                      </code>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    请保存这些备用码，在无法使用验证器时可以使用它们登录
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>验证码</Label>
                  <Input
                    type="text"
                    placeholder="输入验证码"
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleEnable2FA}
                  disabled={loading || !verificationCode}
                  className="w-full"
                >
                  {loading ? '处理中...' : '启用双因素认证'}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <Key className="w-4 h-4 mr-2" />
                  <AlertDescription>
                    您需要安装一个验证器应用（如 Google Authenticator 或 Microsoft
                    Authenticator）来使用双因素认证
                  </AlertDescription>
                </Alert>

                <Button onClick={fetchSetupData} disabled={loading} className="w-full">
                  {loading ? '加载中...' : '开始设置'}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
