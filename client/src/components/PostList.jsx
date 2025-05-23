import React from 'react';
import { PostCard } from './PostCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

function PostList({ posts, loading, error }) {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!Array.isArray(posts) || posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No posts found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.isArray(posts) && posts.map(post => <PostCard key={post._id} post={post} />)}
    </div>
  );
}

export default PostList;
