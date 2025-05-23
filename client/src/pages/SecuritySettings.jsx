import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { TwoFactorSetup } from '../components/TwoFactorSetup';
import { ActiveSessions } from '../components/ActiveSessions';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

const SecuritySettings = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">安全设置</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>两步验证</CardTitle>
          </CardHeader>
          <CardContent>
            <TwoFactorSetup />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>活跃会话</CardTitle>
          </CardHeader>
          <CardContent>
            <ActiveSessions />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecuritySettings;
