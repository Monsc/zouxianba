import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { apiService } from '../services/api';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import UserList from './UserList';
import MessageModal from './MessageModal';
import ReportModal from './ReportModal';

function ProfileView({ userId, onClose }) {
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
    likes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [userListType, setUserListType] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileResponse, statsResponse] = await Promise.all([
          apiService.get(`/users/${userId}`),
          apiService.get(`/users/${userId}/stats`),
        ]);
        setUser(profileResponse.data);
        setStats(statsResponse.data);
        setIsFollowing(profileResponse.data.followers.includes(currentUser._id));
      } catch (error) {
        showToast('获取用户信息失败', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleFollow = async () => {
    try {
      setLoading(true);
      const response = await apiService.post(`/users/${userId}/follow`);
      setUser(prev => ({
        ...prev,
        followers: response.data.followers,
        isFollowing: response.data.isFollowing,
      }));
      showToast(response.data.isFollowing ? '关注成功' : '取消关注成功', 'success');
    } catch (error) {
      showToast('操作失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUserListClick = (type) => {
    setUserListType(type);
    setShowUserList(true);
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-twitter-blue border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-twitter-gray-900 rounded-2xl w-full max-w-2xl mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="relative h-48 bg-twitter-blue">
            <button
              onClick={onClose}
              className="absolute top-4 left-4 text-white hover:bg-black/10 p-2 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 用户信息 */}
          <div className="px-4 pb-4">
            <div className="flex justify-between items-start -mt-16 mb-4">
              <div className="relative">
                <Avatar user={user} size="xl" />
              </div>
              {currentUser._id !== userId && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowMessageModal(true)}
                    className="p-2 text-twitter-blue hover:bg-twitter-blue/10 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="p-2 text-twitter-gray-500 hover:bg-twitter-gray-100 dark:hover:bg-twitter-gray-800 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleFollow}
                    className={`px-4 py-2 rounded-full font-bold ${
                      isFollowing
                        ? 'bg-white text-black border border-twitter-gray-300 hover:bg-twitter-gray-100'
                        : 'bg-black text-white hover:bg-twitter-gray-900'
                    }`}
                  >
                    {isFollowing ? '已关注' : '关注'}
                  </button>
                </div>
              )}
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-bold">{user.username}</h2>
              <p className="text-twitter-gray-500">@{user.handle}</p>
            </div>

            {user.bio && (
              <p className="mb-4 whitespace-pre-wrap">{user.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-twitter-gray-500 mb-4">
              {user.location && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {user.location}
                </div>
              )}
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-twitter-blue hover:underline"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {user.website}
                </a>
              )}
              {user.birthdate && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {format(new Date(user.birthdate), 'yyyy年MM月dd日', { locale: zhCN })}
                </div>
              )}
              {user.gender && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {user.gender === 'male' ? '男' : user.gender === 'female' ? '女' : '其他'}
                </div>
              )}
            </div>

            {/* 统计数据 */}
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => handleUserListClick('following')}
                className="hover:underline"
              >
                <span className="font-bold">{stats.following}</span>
                <span className="text-twitter-gray-500"> 关注中</span>
              </button>
              <button
                onClick={() => handleUserListClick('followers')}
                className="hover:underline"
              >
                <span className="font-bold">{stats.followers}</span>
                <span className="text-twitter-gray-500"> 关注者</span>
              </button>
              <button
                onClick={() => handleUserListClick('posts')}
                className="hover:underline"
              >
                <span className="font-bold">{stats.posts}</span>
                <span className="text-twitter-gray-500"> 帖子</span>
              </button>
              <button
                onClick={() => handleUserListClick('likes')}
                className="hover:underline"
              >
                <span className="font-bold">{stats.likes}</span>
                <span className="text-twitter-gray-500"> 获赞</span>
              </button>
            </div>

            {/* 标签页 */}
            <div className="border-b border-twitter-gray-200 dark:border-twitter-gray-800">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`flex-1 py-4 font-bold ${
                    activeTab === 'posts'
                      ? 'text-twitter-blue border-b-2 border-twitter-blue'
                      : 'text-twitter-gray-500 hover:bg-twitter-gray-100 dark:hover:bg-twitter-gray-800'
                  }`}
                >
                  帖子
                </button>
                <button
                  onClick={() => setActiveTab('replies')}
                  className={`flex-1 py-4 font-bold ${
                    activeTab === 'replies'
                      ? 'text-twitter-blue border-b-2 border-twitter-blue'
                      : 'text-twitter-gray-500 hover:bg-twitter-gray-100 dark:hover:bg-twitter-gray-800'
                  }`}
                >
                  回复
                </button>
                <button
                  onClick={() => setActiveTab('media')}
                  className={`flex-1 py-4 font-bold ${
                    activeTab === 'media'
                      ? 'text-twitter-blue border-b-2 border-twitter-blue'
                      : 'text-twitter-gray-500 hover:bg-twitter-gray-100 dark:hover:bg-twitter-gray-800'
                  }`}
                >
                  媒体
                </button>
                <button
                  onClick={() => setActiveTab('likes')}
                  className={`flex-1 py-4 font-bold ${
                    activeTab === 'likes'
                      ? 'text-twitter-blue border-b-2 border-twitter-blue'
                      : 'text-twitter-gray-500 hover:bg-twitter-gray-100 dark:hover:bg-twitter-gray-800'
                  }`}
                >
                  喜欢
                </button>
              </div>
            </div>

            {/* 内容区域 */}
            <div className="mt-4">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post._id} className="border-b border-twitter-gray-200 dark:border-twitter-gray-800 py-4">
                    {/* 帖子内容 */}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-twitter-gray-500">
                  暂无内容
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* 用户列表模态框 */}
      {showUserList && (
        <UserList
          type={userListType}
          userId={userId}
          onClose={() => setShowUserList(false)}
        />
      )}

      {/* 私信模态框 */}
      {showMessageModal && (
        <MessageModal
          targetUser={user}
          onClose={() => setShowMessageModal(false)}
        />
      )}

      {/* 举报模态框 */}
      {showReportModal && (
        <ReportModal
          type="user"
          targetId={userId}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </>
  );
}

export default ProfileView; 