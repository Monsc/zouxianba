import { Metadata } from 'next';
import { UserList } from '@/components/UserList';

interface FollowingPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: FollowingPageProps): Promise<Metadata> {
  return {
    title: '关注中',
    description: '查看用户关注的用户列表',
  };
}

export default function FollowingPage({ params }: FollowingPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <UserList userId={params.id} type="following" />
    </div>
  );
} 