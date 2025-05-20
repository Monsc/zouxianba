import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Feed } from '@/components/Feed';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PullToRefresh } from 'react-pull-to-refresh-js';

const Home = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // 刷新页面数据
      window.location.reload();
    } catch (error) {
      showToast('刷新失败，请重试', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <PullToRefresh
        onRefresh={handleRefresh}
        pullDownThreshold={100}
        resistance={2.5}
      >
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Feed />
        </div>
      </PullToRefresh>
    </ErrorBoundary>
  );
};

export default Home;
