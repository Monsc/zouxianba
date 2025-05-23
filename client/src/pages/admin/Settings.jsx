import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Globe, Shield, Mail, Bell } from 'lucide-react';

const defaultSiteSettings = {
  siteName: '走线吧',
  siteDescription: '一个现代化的社交平台',
  siteKeywords: '社交,社区,分享',
  siteLogo: '/logo.png',
  siteFavicon: '/favicon.ico',
  allowRegistration: true,
  allowComments: true,
  maintenanceMode: false,
};

const defaultSecuritySettings = {
  enableTwoFactor: false,
  passwordMinLength: 8,
  requireSpecialChars: true,
  requireNumbers: true,
  requireUppercase: true,
  loginAttempts: 5,
  lockoutDuration: 30,
  sessionTimeout: 60,
};

const defaultEmailSettings = {
  smtpHost: 'smtp.example.com',
  smtpPort: 587,
  smtpUser: 'noreply@example.com',
  smtpPassword: '',
  smtpSecure: true,
  fromEmail: 'noreply@example.com',
  fromName: '走线吧',
};

const defaultNotificationSettings = {
  enableEmailNotifications: true,
  enablePushNotifications: true,
  notifyNewUsers: true,
  notifyNewPosts: true,
  notifyNewComments: true,
  notifyReports: true,
};

export default function Settings() {
  const [siteSettings, setSiteSettings] = useState(defaultSiteSettings);
  const [securitySettings, setSecuritySettings] = useState(defaultSecuritySettings);
  const [emailSettings, setEmailSettings] = useState(defaultEmailSettings);
  const [notificationSettings, setNotificationSettings] = useState(defaultNotificationSettings);

  const handleSave = () => {
    // 实现保存逻辑
    console.log('保存设置', {
      siteSettings,
      securitySettings,
      emailSettings,
      notificationSettings,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">系统设置</h1>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          保存设置
        </Button>
      </div>

      <Tabs defaultValue="site" className="space-y-4">
        <TabsList>
          <TabsTrigger value="site">
            <Globe className="w-4 h-4 mr-2" />
            网站设置
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            安全设置
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="w-4 h-4 mr-2" />
            邮件设置
          </TabsTrigger>
          <TabsTrigger value="notification">
            <Bell className="w-4 h-4 mr-2" />
            通知设置
          </TabsTrigger>
        </TabsList>

        <TabsContent value="site">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>网站名称</Label>
                  <Input
                    value={siteSettings.siteName}
                    onChange={e => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>网站描述</Label>
                  <Input
                    value={siteSettings.siteDescription}
                    onChange={e =>
                      setSiteSettings({ ...siteSettings, siteDescription: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>网站关键词</Label>
                <Input
                  value={siteSettings.siteKeywords}
                  onChange={e => setSiteSettings({ ...siteSettings, siteKeywords: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>网站 Logo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      // 处理文件上传
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>网站图标</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      // 处理文件上传
                    }}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>允许新用户注册</Label>
                  <Switch
                    checked={siteSettings.allowRegistration}
                    onCheckedChange={checked =>
                      setSiteSettings({ ...siteSettings, allowRegistration: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>允许评论</Label>
                  <Switch
                    checked={siteSettings.allowComments}
                    onCheckedChange={checked =>
                      setSiteSettings({ ...siteSettings, allowComments: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>维护模式</Label>
                  <Switch
                    checked={siteSettings.maintenanceMode}
                    onCheckedChange={checked =>
                      setSiteSettings({ ...siteSettings, maintenanceMode: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>启用双因素认证</Label>
                <Switch
                  checked={securitySettings.enableTwoFactor}
                  onCheckedChange={checked =>
                    setSecuritySettings({ ...securitySettings, enableTwoFactor: checked })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>密码最小长度</Label>
                  <Input
                    type="number"
                    value={securitySettings.passwordMinLength}
                    onChange={e =>
                      setSecuritySettings({
                        ...securitySettings,
                        passwordMinLength: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>登录失败次数</Label>
                  <Input
                    type="number"
                    value={securitySettings.loginAttempts}
                    onChange={e =>
                      setSecuritySettings({
                        ...securitySettings,
                        loginAttempts: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>锁定时长(分钟)</Label>
                  <Input
                    type="number"
                    value={securitySettings.lockoutDuration}
                    onChange={e =>
                      setSecuritySettings({
                        ...securitySettings,
                        lockoutDuration: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>会话超时(分钟)</Label>
                  <Input
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={e =>
                      setSecuritySettings({
                        ...securitySettings,
                        sessionTimeout: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>密码需包含特殊字符</Label>
                <Switch
                  checked={securitySettings.requireSpecialChars}
                  onCheckedChange={checked =>
                    setSecuritySettings({ ...securitySettings, requireSpecialChars: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>密码需包含数字</Label>
                <Switch
                  checked={securitySettings.requireNumbers}
                  onCheckedChange={checked =>
                    setSecuritySettings({ ...securitySettings, requireNumbers: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>密码需包含大写字母</Label>
                <Switch
                  checked={securitySettings.requireUppercase}
                  onCheckedChange={checked =>
                    setSecuritySettings({ ...securitySettings, requireUppercase: checked })
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SMTP 主机</Label>
                  <Input
                    value={emailSettings.smtpHost}
                    onChange={e => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMTP 端口</Label>
                  <Input
                    type="number"
                    value={emailSettings.smtpPort}
                    onChange={e =>
                      setEmailSettings({ ...emailSettings, smtpPort: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SMTP 用户名</Label>
                  <Input
                    value={emailSettings.smtpUser}
                    onChange={e => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMTP 密码</Label>
                  <Input
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={e =>
                      setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>使用 SSL/TLS</Label>
                <Switch
                  checked={emailSettings.smtpSecure}
                  onCheckedChange={checked =>
                    setEmailSettings({ ...emailSettings, smtpSecure: checked })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>发件人邮箱</Label>
                  <Input
                    value={emailSettings.fromEmail}
                    onChange={e =>
                      setEmailSettings({ ...emailSettings, fromEmail: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>发件人名称</Label>
                  <Input
                    value={emailSettings.fromName}
                    onChange={e => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notification">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>启用邮件通知</Label>
                <Switch
                  checked={notificationSettings.enableEmailNotifications}
                  onCheckedChange={checked =>
                    setNotificationSettings({
                      ...notificationSettings,
                      enableEmailNotifications: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>启用推送通知</Label>
                <Switch
                  checked={notificationSettings.enablePushNotifications}
                  onCheckedChange={checked =>
                    setNotificationSettings({
                      ...notificationSettings,
                      enablePushNotifications: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>新用户注册通知</Label>
                <Switch
                  checked={notificationSettings.notifyNewUsers}
                  onCheckedChange={checked =>
                    setNotificationSettings({ ...notificationSettings, notifyNewUsers: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>新帖子通知</Label>
                <Switch
                  checked={notificationSettings.notifyNewPosts}
                  onCheckedChange={checked =>
                    setNotificationSettings({ ...notificationSettings, notifyNewPosts: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>新评论通知</Label>
                <Switch
                  checked={notificationSettings.notifyNewComments}
                  onCheckedChange={checked =>
                    setNotificationSettings({ ...notificationSettings, notifyNewComments: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>举报通知</Label>
                <Switch
                  checked={notificationSettings.notifyReports}
                  onCheckedChange={checked =>
                    setNotificationSettings({ ...notificationSettings, notifyReports: checked })
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
