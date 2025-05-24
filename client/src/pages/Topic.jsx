import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/Button';
import { PostCard } from '../components/PostCard';
import { Hash, UserPlus, UserMinus } from 'lucide-react';

export default function Topic() {
  const { name } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [topic, setTopic] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopic();
  }, [name]);

  const fetchTopic = async () => {
    try {
      setLoading(true);
      const [topicData, postsData] = await Promise.all([
        apiService.getTopic(name),
        apiService.getTopicPosts(name)
      ]);
      setTopic(topicData);
      setPosts(postsData);
    } catch (error) {
      showToast('获取话题信息失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      showToast('请先登录', 'error');
      return;
    }

    try {
      if (topic.isFollowing) {
        await apiService.unfollowTopic(topic._id);
        showToast('已取消关注话题');
      } else {
        await apiService.followTopic(topic._id);
        showToast('已关注话题');
      }
      setTopic(prev => ({
        ...prev,
        isFollowing: !prev.isFollowing,
        followersCount: prev.isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
      }));
    } catch (error) {
      showToast('操作失败，请稍后重试', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center py-8 text-gray-500">
        话题不存在
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 话题头部 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Hash className="w-6 h-6 text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {topic.name}
              </h1>
            </div>
            {topic.description && (
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {topic.description}
              </p>
            )}
            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{topic.postsCount} 个帖子</span>
              <span>{topic.followersCount} 个关注者</span>
            </div>
          </div>
          {user && (
            <Button
              variant={topic.isFollowing ? 'outline' : 'default'}
              onClick={handleFollow}
            >
              {topic.isFollowing ? (
                <>
                  <UserMinus className="w-4 h-4 mr-2" />
                  取消关注
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  关注
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* 帖子列表 */}
      <div className="space-y-4">
        {posts.map(post => (
          <PostCard key={post._id} post={post} />
        ))}
        {posts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            暂无相关帖子
          </div>
        )}
      </div>
    </div>
  );
} 