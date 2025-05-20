import { Metadata } from 'next';
import { PostDetail } from '@/components/PostDetail';

interface PostPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  // 这里可以根据帖子ID获取帖子信息，然后生成动态元数据
  return {
    title: '帖子详情',
    description: '查看帖子详细内容和评论',
  };
}

export default function PostPage({ params }: PostPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PostDetail postId={params.id} />
    </div>
  );
} 