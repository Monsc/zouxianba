import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Shield } from 'lucide-react';

const TwoFactorVerification = ({ open, onOpenChange, tempToken }) => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('totp');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [backupCode, setBackupCode] = useState('');

  const handleVerify = async () => {
    try {
      setLoading(true);
      const response = await api.post('/auth/verify-2fa', {
        tempToken,
        token: activeTab === 'totp' ? token : undefined,
        backupCode: activeTab === 'backup' ? backupCode : undefined
      });

      login(response.data.token, response.data.user);
      showToast('验证成功', 'success');
      onOpenChange(false);
      navigate('/');
    } catch (error) {
      showToast(
        error.response?.data?.message || '验证失败，请重试',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            双因素认证
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="totp">验证码</TabsTrigger>
            <TabsTrigger value="backup">备用码</TabsTrigger>
          </TabsList>

          <TabsContent value="totp">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>请输入验证码</Label>
                <Input
                  type="text"
                  placeholder="输入6位验证码"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  maxLength={6}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleVerify}
                disabled={loading || token.length !== 6}
              >
                验证
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="backup">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>请输入备用码</Label>
                <Input
                  type="text"
                  placeholder="输入备用码"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleVerify}
                disabled={loading || !backupCode}
              >
                验证
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default TwoFactorVerification; 