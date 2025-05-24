import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/common/Button';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import ImagePreview from '@/components/common/ImagePreview';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const PostDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user: currentUser } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState([]);

  // 获取帖子详情
  const fetchPost = async () => {
    try {
      setLoading(true);
      const [postData, commentsData] = await Promise.all([
        api.get(`/posts/${id}`),
        api.get(`/posts/${id}/comments`)
      ]);
      setPost(postData.data);
      setComments(commentsData.data || []);
    } catch (err) {
      setError(err.message || '加载帖子失败');
      toast.error('加载帖子失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理点赞/取消点赞
  const handleLike = async () => {
    try {
      const res = await api.post(`/posts/${id}/like`);
      setPost(prev => ({
        ...prev,
        ...res,
      }));
      toast.success(post.isLiked ? '已取消点赞' : '点赞成功');
    } catch (err) {
      toast.error('操作失败，请重试');
    }
  };

  // 处理评论提交
  const handleComment = async e => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmitting(true);
      const res = await api.post(`/posts/${id}/comments`, { content: comment });
      setComments([...comments, res.data]);
      setComment('');
      toast.success('评论成功');
    } catch (err) {
      toast.error('评论失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 处理评论删除
  const handleDeleteComment = async commentId => {
    try {
      await api.delete(`/posts/${id}/comments/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
      toast.success('评论已删除');
    } catch (err) {
      toast.error('删除失败，请重试');
    }
  };

  // 处理帖子删除
  const handleDeletePost = async () => {
    if (!window.confirm('确定要删除这条帖子吗？')) return;

    try {
      await api.delete(`/posts/${id}`);
      toast.success('帖子已删除');
      router.push('/');
    } catch (err) {
      toast.error('删除失败，请重试');
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <LoadingOverlay isLoading={true} />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <ErrorState
          title="加载失败"
          description={error}
          action={<Button onClick={() => router.reload()}>重试</Button>}
        />
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout>
        <EmptyState
          title="帖子不存在"
          description="该帖子可能已被删除或不存在"
          action={<Button onClick={() => router.push('/')}>返回首页</Button>}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          {/* 帖子内容 */}
          <div className="p-6">
            {/* 作者信息 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={post.author.avatar || '/default-avatar.png'}
                  alt={post.author.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">{post.author.username}</h3>
                    {post.author.isVerified && (
                      <span className="text-blue-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                      locale: zhCN,
                    })}
                  </p>
                </div>
              </div>

              {/* 操作按钮 */}
              {currentUser && currentUser._id === post.author._id && (
                <div className="flex items-center space-x-2">
                  <Button variant="secondary" onClick={() => router.push(`/post/edit/${id}`)}>
                    编辑
                  </Button>
                  <Button variant="danger" onClick={handleDeletePost}>
                    删除
                  </Button>
                </div>
              )}
            </div>

            {/* 帖子内容 */}
            <div className="prose max-w-none mb-6">
              <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* 图片展示 */}
            {post.images && post.images.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {post.images.map((image, index) => (
                  <ImagePreview
                    key={index}
                    src={image}
                    alt={`图片 ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            {/* 互动数据 */}
            <div className="flex items-center space-x-6 text-gray-500 mb-6">
              <button
                className={`flex items-center space-x-1 ${post.isLiked ? 'text-red-500' : ''}`}
                onClick={handleLike}
              >
                <svg
                  className="w-5 h-5"
                  fill={post.isLiked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span>{post.likesCount}</span>
              </button>
              <div className="flex items-center space-x-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span>{comments.length}</span>
              </div>
              <button className="flex items-center space-x-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <span>{post.sharesCount}</span>
              </button>
            </div>

            {/* 评论输入框 */}
            {currentUser && (
              <form onSubmit={handleComment} className="mb-6">
                <div className="flex space-x-4">
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="写下你的评论..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                  />
                  <Button type="submit" loading={submitting} disabled={!comment.trim()}>
                    评论
                  </Button>
                </div>
              </form>
            )}

            {/* 评论列表 */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-gray-500">暂无评论</div>
              ) : (
                comments.map(comment => (
                  <div key={comment._id} className="flex space-x-4">
                    <img
                      src={comment.author.avatar || '/default-avatar.png'}
                      alt={comment.author.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{comment.author.username}</h4>
                            {comment.author.isVerified && (
                              <span className="text-blue-500">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(comment.createdAt), {
                                addSuffix: true,
                                locale: zhCN,
                              })}
                            </span>
                            {currentUser &&
                              (currentUser._id === comment.author._id ||
                                currentUser._id === post.author._id) && (
                                <button
                                  onClick={() => handleDeleteComment(comment._id)}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              )}
                          </div>
                        </div>
                        <p className="text-gray-800">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PostDetailPage;
