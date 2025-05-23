import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { LogOut, Globe, Smartphone, Monitor } from 'lucide-react';
import apiService from '../services/api';

export const ActiveSessions = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/auth/sessions');
      setSessions(response.data);
    } catch (error) {
      showToast('获取会话列表失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutSession = async sessionId => {
    try {
      setLoading(true);
      await apiService.post(`/auth/sessions/${sessionId}/logout`);
      showToast('会话已注销', 'success');
      fetchSessions();
    } catch (error) {
      showToast('注销会话失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAllSessions = async () => {
    try {
      setLoading(true);
      await apiService.post('/auth/sessions/logout-all');
      showToast('所有会话已注销', 'success');
      fetchSessions();
    } catch (error) {
      showToast('注销所有会话失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = deviceType => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">活跃会话</h3>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={loading}>
              <LogOut className="w-4 h-4 mr-2" />
              注销所有会话
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认注销所有会话</AlertDialogTitle>
              <AlertDialogDescription>
                这将注销您在所有设备上的登录状态。您需要重新登录才能继续使用。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogoutAllSessions}>确认</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {sessions.length === 0 ? (
        <Alert>
          <AlertDescription>暂无活跃会话</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-2">
          {sessions.map(session => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                {getDeviceIcon(session.deviceType)}
                <div>
                  <p className="font-medium">{session.deviceName}</p>
                  <p className="text-sm text-muted-foreground">
                    {session.location} · {session.lastActive}
                  </p>
                </div>
              </div>
              {session.current && <span className="text-sm text-muted-foreground">当前会话</span>}
              {!session.current && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLogoutSession(session.id)}
                  disabled={loading}
                >
                  注销
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
