import { Metadata } from 'next';
import { UserProfile } from '@/components/UserProfile';

interface UserPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  // 这里可以根据用户ID获取用户信息，然后生成动态元数据
  return {
    title: '用户主页',
    description: '查看用户信息和帖子',
  };
}

export default function UserPage({ params }: UserPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <UserProfile userId={params.id} />
    </div>
  );
} 