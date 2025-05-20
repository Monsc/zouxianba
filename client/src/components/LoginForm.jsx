import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Shield } from 'lucide-react';
import TwoFactorVerification from './TwoFactorVerification';

const LoginForm = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post('/auth/login', {
        email,
        password
      });

      // 检查是否需要双因素认证
      if (response.data.requiresTwoFactor) {
        setTempToken(response.data.tempToken);
        setShow2FA(true);
        return;
      }

      // 正常登录流程
      login(response.data.token, response.data.user);
      showToast('登录成功', 'success');
      navigate('/');
    } catch (error) {
      showToast(
        error.response?.data?.message || '登录失败，请重试',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">邮箱</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">密码</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? '登录中...' : '登录'}
        </Button>
      </form>

      <TwoFactorVerification
        open={show2FA}
        onOpenChange={setShow2FA}
        tempToken={tempToken}
      />
    </div>
  );
};

export default LoginForm; 