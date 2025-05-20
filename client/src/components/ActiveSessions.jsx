import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogOut, Globe, Smartphone, Monitor } from 'lucide-react';
import { api } from '@/services/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ActiveSessions = ({ open, onOpenChange }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (open) {
      fetchSessions();
    }
  }, [open]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me/sessions');
      setSessions(response.data.sessions);
    } catch (error) {
      showToast('获取活动会话失败', 'error');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutSession = async (token) => {
    try {
      await api.delete(`/auth/me/sessions/${token}`);
      showToast('会话已注销', 'success');
      fetchSessions();
    } catch (error) {
      showToast('注销会话失败', 'error');
    }
  };

  const getDeviceIcon = (device) => {
    if (device.toLowerCase().includes('mobile')) {
      return <Smartphone className="w-4 h-4" />;
    } else if (device.toLowerCase().includes('tablet')) {
      return <Monitor className="w-4 h-4" />;
    } else {
      return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut className="w-5 h-5" />
            活动会话
          </DialogTitle>
          <DialogDescription>
            查看和管理您的活动登录会话
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {sessions.length === 0 ? (
            <Alert>
              <LogOut className="w-4 h-4 mr-2" />
              <AlertDescription>
                当前没有活动会话
              </AlertDescription>
            </Alert>
          ) : (
            sessions.map((session) => (
              <div
                key={session.token}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-muted rounded-full">
                    {getDeviceIcon(session.device)}
                  </div>
                  <div>
                    <p className="font-medium">{session.device}</p>
                    <p className="text-sm text-muted-foreground">
                      IP: {session.ip}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      最后活动: {new Date(session.lastActive).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleLogoutSession(session.token)}
                >
                  注销
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActiveSessions; 