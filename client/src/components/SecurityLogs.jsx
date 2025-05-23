import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import apiService from '../services/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { History, Shield, LogOut, Key, User } from 'lucide-react';
import { formatSecurityLog } from '../utils/security';

const SecurityLogs = ({ open, onOpenChange }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (open) {
      fetchLogs();
    }
  }, [open]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/auth/me/security-logs');
      setLogs(response.data.logs.map(formatSecurityLog));
    } catch (error) {
      showToast('获取安全日志失败', 'error');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = action => {
    switch (action) {
      case '登录':
        return <LogOut className="w-4 h-4" />;
      case '登出':
        return <LogOut className="w-4 h-4" />;
      case '修改密码':
        return <Key className="w-4 h-4" />;
      case '启用双因素认证':
      case '禁用双因素认证':
        return <Shield className="w-4 h-4" />;
      case '更新个人资料':
        return <User className="w-4 h-4" />;
      default:
        return <History className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            安全日志
          </DialogTitle>
          <DialogDescription>查看您的账户安全活动记录</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {logs.length === 0 ? (
            <Alert>
              <History className="w-4 h-4 mr-2" />
              <AlertDescription>暂无安全日志记录</AlertDescription>
            </Alert>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="p-2 bg-muted rounded-full">{getActionIcon(log.action)}</div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{log.action}</p>
                  <p className="text-sm text-muted-foreground">IP: {log.ip}</p>
                  <p className="text-sm text-muted-foreground">设备: {log.device}</p>
                  <p className="text-sm text-muted-foreground">时间: {log.timestamp}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SecurityLogs;
