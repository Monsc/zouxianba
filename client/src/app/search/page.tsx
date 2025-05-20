import { Metadata } from 'next';
import { SearchResults } from '@/components/SearchResults';

export const metadata: Metadata = {
  title: '搜索',
  description: '搜索帖子和用户',
};

export default function SearchPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SearchResults />
    </div>
  );
} 