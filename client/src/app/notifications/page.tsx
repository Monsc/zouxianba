import { Metadata } from 'next';
import { NotificationList } from '@/components/NotificationList';

export const metadata: Metadata = {
  title: '通知',
  description: '查看你的通知',
};

export default function NotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NotificationList />
    </div>
  );
} 