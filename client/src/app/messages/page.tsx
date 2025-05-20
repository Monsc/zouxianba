import { Metadata } from 'next';
import { MessageList } from '@/components/MessageList';

export const metadata: Metadata = {
  title: '消息',
  description: '查看你的私信',
};

export default function MessagesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <MessageList />
    </div>
  );
} 