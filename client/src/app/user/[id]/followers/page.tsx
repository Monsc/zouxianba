import { Metadata } from 'next';
import { UserList } from '@/components/UserList';

interface FollowersPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: FollowersPageProps): Promise<Metadata> {
  return {
    title: '关注者',
    description: '查看用户的关注者列表',
  };
}

export default function FollowersPage({ params }: FollowersPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <UserList userId={params.id} type="followers" />
    </div>
  );
} 