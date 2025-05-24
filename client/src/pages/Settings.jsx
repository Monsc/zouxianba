import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { User, Shield, Bell, Palette } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';

const Settings = () => {
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">设置</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>设置选项</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  <Link
                    to="/settings/profile"
                    className={`flex items-center gap-2 p-2 rounded-lg hover:bg-accent ${
                      currentPath === 'profile' ? 'bg-accent' : ''
                    }`}
                  >
                    <User className="w-4 h-4" />
                    个人资料
                  </Link>
                  <Link
                    to="/settings/security"
                    className={`flex items-center gap-2 p-2 rounded-lg hover:bg-accent ${
                      currentPath === 'security' ? 'bg-accent' : ''
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    安全设置
                  </Link>
                  <Link
                    to="/settings/notifications"
                    className={`flex items-center gap-2 p-2 rounded-lg hover:bg-accent ${
                      currentPath === 'notifications' ? 'bg-accent' : ''
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    通知设置
                  </Link>
                  <Link
                    to="/settings/appearance"
                    className={`flex items-center gap-2 p-2 rounded-lg hover:bg-accent ${
                      currentPath === 'appearance' ? 'bg-accent' : ''
                    }`}
                  >
                    <Palette className="w-4 h-4" />
                    外观设置
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3">
            <Outlet />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
